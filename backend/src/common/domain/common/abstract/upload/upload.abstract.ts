// core/contracts/Uploader.ts

export type UploadFile = {
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string; // Pode ser útil para serviços como S3, Firebase, etc.
};

export abstract class UploadAbstract {
  /**
   * Faz o upload de um arquivo e retorna seus dados.
   */
  abstract upload(file: Request): Promise<UploadFile>;

  /**
   * (Opcional) Remove o arquivo do storage.
   */
  abstract delete(filePath: string): Promise<void>;
}

