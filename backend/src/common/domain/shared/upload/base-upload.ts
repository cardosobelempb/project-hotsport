// core/contracts/Uploader.ts

export type BaseUploadFile = {
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string; // Pode ser útil para serviços como S3, Firebase, etc.
};

export abstract class BaseUpload {
  /**
   * Faz o upload de um arquivo e retorna seus dados.
   */
  abstract upload(file: Request): Promise<BaseUploadFile>;

  /**
   * (Opcional) Remove o arquivo do storage.
   */
  abstract delete(filePath: string): Promise<void>;
}
