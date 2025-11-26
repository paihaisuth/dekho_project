import { IfileRepository, IresponseUploadFile } from "@/utils/interface";

export class FileService {
  constructor(private fileRepository: IfileRepository) {}

  async uploadFile(
    userID: string,
    file: File,
    prefix?: string
  ): Promise<IresponseUploadFile> {
    return this.fileRepository.uploadFile(userID, file, prefix);
  }

  async deleteFile(userID: string, key: string): Promise<void> {
    const file = await this.fileRepository.getByURL(key);
    if (!file) {
      throw new Error("File not found");
    }

    if (file.userID !== userID) {
      throw new Error("Unauthorized to delete this file");
    }

    return this.fileRepository.deleteFile(key);
  }
}
