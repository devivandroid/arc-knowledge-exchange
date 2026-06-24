import { createHash } from "crypto";
import { createReadStream } from "fs";
import { mkdir, readdir, readFile, rm, stat, writeFile } from "fs/promises";
import path from "path";
import type { ResourceFile } from "@/types/resource";

const privateStorageRoot = path.join(process.cwd(), "private-resources");
const seedStorageRoot = path.join(process.cwd(), "private-resources-seed");

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

  const directory = getResourceDirectory(privateStorageRoot, resourceId);
  await mkdir(directory, { recursive: true });
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = path.join(directory, filename);
  await writeFile(filePath, buffer);

  return {
    filename,
    mimeType: file.type || getMimeType(filename),
    sizeBytes: buffer.byteLength,
    checksum: createHash("sha256").update(buffer).digest("hex")
  };
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

  const seen = new Set<string>();
  return files.filter((file) => {
    if (seen.has(file.filename)) return false;
    seen.add(file.filename);
    return true;
  });
}

export async function getResourceFile(resourceId: string, filename: string) {
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
  const filePath = await findResourceFilePath(resourceId, filename);
  if (!filePath) return null;
  return readMetadataFromPath(filePath, sanitizeFilename(filename));
}

export async function deleteResourceFile(resourceId: string, filename: string): Promise<void> {
  const safeFilename = sanitizeFilename(filename);
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
