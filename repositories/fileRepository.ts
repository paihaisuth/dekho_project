import { CustomError } from "@/utils/customError";
import { IfileRepository, IresponseUploadFile } from "@/utils/interface";
import { put, del } from "@vercel/blob";

export class FileRepository implements IfileRepository {
  async uploadFile(file: File, prefix?: string): Promise<IresponseUploadFile> {
    // Check if file is provided
    if (!file) throw new CustomError("No file provided", 400);

    // Validate file type and size
    this.validateFileType(file);
    this.validateFileSize(file);

    // Convert File to Buffer
    const arayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arayBuffer);

    // Remove _ form original file name
    const cleanFileName = this.sanitizeFileName(file.name);

    // Construct file path with timestamp
    let fileName = +Date.now() + "_" + cleanFileName;

    // Add prefix to file path if provided
    if (prefix) fileName = `${prefix}/${fileName}`;

    // Upload file to Vercel Blob Storage
    const result = await put(fileName, buffer, {
      access: "public",
      contentType: file.type,
    });

    return { url: result.url, key: fileName };
  }

  async deleteFile(key: string): Promise<void> {
    // Delete file from Vercel Blob Storage
    await del(key);
    return;
  }

  private validateFileSize(file: File, maxSize: number = 5 * 1024 * 1024) {
    // Validate file size
    if (file.size > maxSize)
      throw new CustomError(
        `File size exceeds the limit of ${maxSize / (1024 * 1024)} MB`,
        400
      );
    return;
  }

  private validateFileType(
    file: File,
    allowedTypes: string[] = ["image/jpeg", "image/png", "application/pdf"]
  ) {
    // Validate file type
    if (!allowedTypes.includes(file.type))
      throw new CustomError("Unsupported file type", 400);
    return;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-\.]/g, "")
      .replace(/_+/g, "_");
  }
}
