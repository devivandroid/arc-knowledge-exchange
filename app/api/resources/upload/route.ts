import { NextResponse, type NextRequest } from "next/server";
import { apiError } from "@/lib/server/apiResponse";
import {
  isAllowedResourceFilename,
  maxFilesPerResource,
  maxResourceFileSizeBytes,
  sanitizeFilename,
  saveResourceFile
} from "@/lib/server/storage/resourceStorage";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return apiError({
      status: 400,
      error: "INVALID_INPUT",
      message: "Upload must use multipart/form-data."
    });
  }

  const resourceId = String(formData.get("resourceId") || "");
  const files = formData.getAll("files").filter((value): value is File => value instanceof File);

  if (!resourceId.trim()) {
    return apiError({
      status: 400,
      error: "INVALID_INPUT",
      message: "resourceId is required."
    });
  }

  if (files.length === 0) {
    return apiError({
      status: 400,
      error: "INVALID_INPUT",
      message: "Attach at least one file."
    });
  }

  if (files.length > maxFilesPerResource) {
    return apiError({
      status: 400,
      error: "TOO_MANY_FILES",
      message: `Upload up to ${maxFilesPerResource} files per resource.`
    });
  }

  for (const file of files) {
    const filename = sanitizeFilename(file.name);
    if (!isAllowedResourceFilename(filename)) {
      return apiError({
        status: 400,
        error: "UNSUPPORTED_FILE_TYPE",
        message: `${filename} is not an allowed resource file type.`
      });
    }

    if (file.size > maxResourceFileSizeBytes) {
      return apiError({
        status: 400,
        error: "FILE_TOO_LARGE",
        message: `${filename} is larger than 10 MB.`
      });
    }
  }

  const uploadedFiles = await Promise.all(files.map((file) => saveResourceFile(resourceId, file)));

  return NextResponse.json(
    {
      ok: true,
      resourceId,
      files: uploadedFiles
    },
    { status: 201 }
  );
}
