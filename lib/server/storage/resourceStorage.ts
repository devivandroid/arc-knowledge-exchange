import { createHash } from "crypto";
import { createReadStream, type ReadStream } from "fs";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "fs/promises";
import path from "path";
import { isPostgresEnabled, pgQuery } from "@/lib/server/postgres";
import type { ResourceFile } from "@/types/resource";

const privateStorageRoot = path.join(process.cwd(), "private-resources");
const seedStorageRoot = path.join(process.cwd(), "private-resources-seed");
const defaultSupabaseBucket = "kx-resource-files";

const allowedExtensions = new Set([
  "csv",
  "json",
  "yaml",
  "yml",
  "md",
  "txt",
  "pdf",
  "zip",
  "parquet",
  "ipynb",
  "py"
]);

export const maxResourceFileSizeBytes = 10 * 1024 * 1024;
export const maxFilesPerResource = 10;

type StoredResourceFileRow = {
  filename: string;
  mime_type: string;
  size_bytes: string | number;
  checksum: string | null;
  storage_key: string;
};

type StoredResourceFile = {
  stream: ReadStream | ReadableStream<Uint8Array>;
  metadata: ResourceFile;
};

function isSupabaseStorageEnabled(): boolean {
  return (
    process.env.RESOURCE_STORAGE_PROVIDER === "supabase" ||
    Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY)
  );
}

function getSupabaseStorageConfig() {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || defaultSupabaseBucket;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("SUPABASE_STORAGE_NOT_CONFIGURED");
  }

  return { supabaseUrl, serviceRoleKey, bucket };
}

function encodeStoragePath(value: string): string {
  return value.split("/").map(encodeURIComponent).join("/");
}

function getStorageKey(resourceId: string, filename: string): string {
  return `resources/${getSafeResourceId(resourceId)}/${sanitizeFilename(filename)}`;
}

async function upsertResourceFileMetadata(input: {
  resourceId: string;
  file: ResourceFile;
  storageProvider: "local" | "supabase";
  storageKey: string;
}) {
  if (!isPostgresEnabled()) return;

  await pgQuery(
    `
      INSERT INTO resource_files (
        resource_id,
        filename,
        mime_type,
        size_bytes,
        checksum,
        storage_provider,
        storage_key,
        data,
        created_at,
        updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, NOW(), NOW())
      ON CONFLICT (resource_id, filename) DO UPDATE SET
        mime_type = EXCLUDED.mime_type,
        size_bytes = EXCLUDED.size_bytes,
        checksum = EXCLUDED.checksum,
        storage_provider = EXCLUDED.storage_provider,
        storage_key = EXCLUDED.storage_key,
        data = EXCLUDED.data,
        updated_at = NOW()
    `,
    [
      input.resourceId,
      input.file.filename,
      input.file.mimeType,
      input.file.sizeBytes,
      input.file.checksum ?? null,
      input.storageProvider,
      input.storageKey,
      JSON.stringify({ description: input.file.description ?? null })
    ]
  );
}

async function listStoredResourceFiles(resourceId: string): Promise<ResourceFile[]> {
  if (!isPostgresEnabled()) return [];

  const rows = await pgQuery<StoredResourceFileRow>(
    `
      SELECT filename, mime_type, size_bytes, checksum, storage_key
      FROM resource_files
      WHERE resource_id = $1
      ORDER BY filename ASC
    `,
    [resourceId]
  );

  return rows.map((row) => ({
    filename: row.filename,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes),
    checksum: row.checksum ?? undefined
  }));
}

async function getStoredResourceFileRow(
  resourceId: string,
  filename: string
): Promise<StoredResourceFileRow | null> {
  if (!isPostgresEnabled()) return null;

  const rows = await pgQuery<StoredResourceFileRow>(
    `
      SELECT filename, mime_type, size_bytes, checksum, storage_key
      FROM resource_files
      WHERE resource_id = $1 AND filename = $2
      LIMIT 1
    `,
    [resourceId, sanitizeFilename(filename)]
  );

  return rows[0] ?? null;
}

async function saveSupabaseResourceFile(resourceId: string, file: File): Promise<ResourceFile> {
  const { supabaseUrl, serviceRoleKey, bucket } = getSupabaseStorageConfig();
  const filename = sanitizeFilename(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());
  const storageKey = getStorageKey(resourceId, filename);
  const mimeType = file.type || getMimeType(filename);

  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeStoragePath(
      storageKey
    )}`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        "content-type": mimeType,
        "x-upsert": "true"
      },
      body: buffer
    }
  );

  if (!response.ok) {
    throw new Error("SUPABASE_STORAGE_UPLOAD_FAILED");
  }

  const metadata: ResourceFile = {
    filename,
    mimeType,
    sizeBytes: buffer.byteLength,
    checksum: createHash("sha256").update(buffer).digest("hex")
  };

  await upsertResourceFileMetadata({
    resourceId,
    file: metadata,
    storageProvider: "supabase",
    storageKey
  });

  return metadata;
}

async function getSupabaseResourceFile(
  resourceId: string,
  filename: string
): Promise<StoredResourceFile | null> {
  const row = await getStoredResourceFileRow(resourceId, filename);
  if (!row) return null;

  const { supabaseUrl, serviceRoleKey, bucket } = getSupabaseStorageConfig();
  const response = await fetch(
    `${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}/${encodeStoragePath(
      row.storage_key
    )}`,
    {
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`
      }
    }
  );

  if (!response.ok || !response.body) return null;

  return {
    stream: response.body,
    metadata: {
      filename: row.filename,
      mimeType: row.mime_type,
      sizeBytes: Number(row.size_bytes),
      checksum: row.checksum ?? undefined
    }
  };
}

function sanitizePathSegment(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function sanitizeFilename(filename: string): string {
  const base = sanitizePathSegment(path.basename(filename));
  if (!base || base === "." || base === ".." || base.includes("..")) {
    throw new Error("INVALID_FILENAME");
  }
  return base;
}

function getSafeResourceId(resourceId: string): string {
  const safe = sanitizePathSegment(resourceId);
  if (!safe) {
    throw new Error("INVALID_RESOURCE_ID");
  }
  return safe;
}

export function getFileExtension(filename: string): string {
  return path.extname(filename).replace(".", "").toLowerCase();
}

export function isAllowedResourceFilename(filename: string): boolean {
  return allowedExtensions.has(getFileExtension(filename));
}

function getResourceDirectory(root: string, resourceId: string): string {
  return path.join(root, getSafeResourceId(resourceId));
}

async function readMetadataFromPath(filePath: string, filename: string): Promise<ResourceFile> {
  const [fileStat, buffer] = await Promise.all([stat(filePath), readFile(filePath)]);
  return {
    filename,
    mimeType: getMimeType(filename),
    sizeBytes: fileStat.size,
    checksum: createHash("sha256").update(buffer).digest("hex")
  };
}

async function findResourceFilePath(resourceId: string, filename: string): Promise<string | null> {
  const safeFilename = sanitizeFilename(filename);
  const locations = [
    path.join(getResourceDirectory(privateStorageRoot, resourceId), safeFilename),
    path.join(getResourceDirectory(seedStorageRoot, resourceId), safeFilename)
  ];

  for (const location of locations) {
    try {
      const fileStat = await stat(location);
      if (fileStat.isFile()) {
        return location;
      }
    } catch {
      // Try the next storage location.
    }
  }

  return null;
}

export function getMimeType(filename: string): string {
  const extension = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    csv: "text/csv",
    json: "application/json",
    yaml: "application/yaml",
    yml: "application/yaml",
    md: "text/markdown",
    txt: "text/plain",
    pdf: "application/pdf",
    zip: "application/zip",
    parquet: "application/octet-stream",
    ipynb: "application/x-ipynb+json",
    py: "text/x-python"
  };
  return mimeTypes[extension] ?? "application/octet-stream";
}

export async function saveResourceFile(resourceId: string, file: File): Promise<ResourceFile> {
  const filename = sanitizeFilename(file.name);

  if (!isAllowedResourceFilename(filename)) {
    throw new Error("UNSUPPORTED_FILE_TYPE");
  }

  if (file.size > maxResourceFileSizeBytes) {
    throw new Error("FILE_TOO_LARGE");
  }

  if (isSupabaseStorageEnabled()) {
    return saveSupabaseResourceFile(resourceId, file);
  }

  const directory = getResourceDirectory(privateStorageRoot, resourceId);
  await mkdir(directory, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(directory, filename);
  await writeFile(filePath, buffer);

  const metadata = {
    filename,
    mimeType: file.type || getMimeType(filename),
    sizeBytes: buffer.byteLength,
    checksum: createHash("sha256").update(buffer).digest("hex")
  };

  await upsertResourceFileMetadata({
    resourceId,
    file: metadata,
    storageProvider: "local",
    storageKey: filePath
  });

  return metadata;
}

export async function listResourceFiles(resourceId: string): Promise<ResourceFile[]> {
  const files: ResourceFile[] = [];

  for (const root of [seedStorageRoot, privateStorageRoot]) {
    try {
      const directory = getResourceDirectory(root, resourceId);
      const entries = await readdir(directory, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          files.push(await readMetadataFromPath(path.join(directory, entry.name), entry.name));
        }
      }
    } catch {
      // Missing directories simply mean this provider has no files for the resource.
    }
  }

  files.push(...(await listStoredResourceFiles(resourceId)));

  const seen = new Set<string>();
  return files.filter((file) => {
    if (seen.has(file.filename)) return false;
    seen.add(file.filename);
    return true;
  });
}

export async function getResourceFile(resourceId: string, filename: string) {
  if (isSupabaseStorageEnabled()) {
    const supabaseFile = await getSupabaseResourceFile(resourceId, filename);
    if (supabaseFile) return supabaseFile;
  }

  const filePath = await findResourceFilePath(resourceId, filename);
  if (!filePath) return null;
  return {
    stream: createReadStream(filePath),
    metadata: await readMetadataFromPath(filePath, sanitizeFilename(filename))
  };
}

export async function getResourceFileMetadata(
  resourceId: string,
  filename: string
): Promise<ResourceFile | null> {
  const storedFile = await getStoredResourceFileRow(resourceId, filename);
  if (storedFile) {
    return {
      filename: storedFile.filename,
      mimeType: storedFile.mime_type,
      sizeBytes: Number(storedFile.size_bytes),
      checksum: storedFile.checksum ?? undefined
    };
  }

  const filePath = await findResourceFilePath(resourceId, filename);
  if (!filePath) return null;
  return readMetadataFromPath(filePath, sanitizeFilename(filename));
}

export async function deleteResourceFile(resourceId: string, filename: string): Promise<void> {
  const safeFilename = sanitizeFilename(filename);
  const storedFile = await getStoredResourceFileRow(resourceId, safeFilename);

  if (storedFile && isSupabaseStorageEnabled()) {
    const { supabaseUrl, serviceRoleKey, bucket } = getSupabaseStorageConfig();
    await fetch(`${supabaseUrl}/storage/v1/object/${encodeURIComponent(bucket)}`, {
      method: "DELETE",
      headers: {
        apikey: serviceRoleKey,
        authorization: `Bearer ${serviceRoleKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({ prefixes: [storedFile.storage_key] })
    });

    if (isPostgresEnabled()) {
      await pgQuery("DELETE FROM resource_files WHERE resource_id = $1 AND filename = $2", [
        resourceId,
        safeFilename
      ]);
    }
    return;
  }

  const filePath = path.join(getResourceDirectory(privateStorageRoot, resourceId), safeFilename);
  await rm(filePath, { force: true });
}

export type FutureStorageProvider = {
  name: "local" | "cloudflare-r2" | "aws-s3" | "supabase-storage";
  saveResourceFile: typeof saveResourceFile;
  listResourceFiles: typeof listResourceFiles;
  getResourceFile: typeof getResourceFile;
  getResourceFileMetadata: typeof getResourceFileMetadata;
  deleteResourceFile?: typeof deleteResourceFile;
};
