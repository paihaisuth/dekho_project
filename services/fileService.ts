import { IfileRepository, IresponseUploadFile } from "@/utils/interface";

export class FileService implements IfileRepository {
  constructor(private fileRepository: IfileRepository) {}

  async uploadFile(file: File, prefix?: string): Promise<IresponseUploadFile> {
    return this.fileRepository.uploadFile(file, prefix);
  }

  async deleteFile(key: string): Promise<void> {
    return this.fileRepository.deleteFile(key);
  }
}
