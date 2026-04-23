// core/contracts/Uploader.ts

export interface BaseUploadsFile {
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string;
}

export abstract class BaseUploads {
  abstract upload(req: Request, folder?: string): Promise<BaseUploadsFile[]>;
  abstract delete(filePath: string): Promise<void>;
}
