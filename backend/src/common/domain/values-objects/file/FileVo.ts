export class FileVO {
  private static readonly ALLOWED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/webp',
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
    'application/zip',
    'video/mp4',
  ];

  private static readonly ALLOWED_EXTENSIONS = [
    '.png',
    '.jpeg',
    '.jpg',
    '.webp',
    '.pdf',
    '.docx',
    '.xlsx',
    '.zip',
    '.mp4',
  ];

  constructor(
    private readonly originalName: string,
    private readonly mimeType: string,
    private readonly buffer: Buffer,
    private readonly maxSizeInBytes: number = 5 * 1024 * 1024, // 5MB
  ) {
    this.validate();
  }

  private validate(): void {
    const extension = this.getExtension(this.originalName).toLowerCase();

    if (!FileVO.ALLOWED_EXTENSIONS.includes(extension)) {
      throw new Error(`Invalid file extension: ${extension}`);
    }

    if (!FileVO.ALLOWED_MIME_TYPES.includes(this.mimeType)) {
      throw new Error(`Invalid MIME type: ${this.mimeType}`);
    }

    if (!this.buffer || this.buffer.length === 0) {
      throw new Error('File is empty or corrupted');
    }

    if (this.buffer.length > this.maxSizeInBytes) {
      throw new Error(
        `File exceeds maximum size of ${this.maxSizeInBytes / (1024 * 1024)}MB`
      );
    }

    if (!this.isValidMagicNumber(extension)) {
      throw new Error('Invalid file signature (magic number mismatch)');
    }
  }

  private isValidMagicNumber(extension: string): boolean {
    const header = this.buffer.subarray(0, 12); // ✅ Subarray evita depreciação

    const magicChecks: Record<string, () => boolean> = {
      '.png': () => header.subarray(0, 4).toString('hex') === '89504e47',
      '.jpeg': () => header.subarray(0, 3).toString('hex') === 'ffd8ff',
      '.jpg': () => header.subarray(0, 3).toString('hex') === 'ffd8ff',
      '.webp': () =>
        header.subarray(0, 4).toString() === 'RIFF' &&
        header.subarray(8, 12).toString() === 'WEBP',
      '.pdf': () => header.subarray(0, 4).toString() === '%PDF',
      '.zip': () => header.subarray(0, 4).toString('hex') === '504b0304',
      '.docx': () => header.subarray(0, 4).toString('hex') === '504b0304',
      '.xlsx': () => header.subarray(0, 4).toString('hex') === '504b0304',
      '.mp4': () => header.includes('ftyp'),
    };

    const check = magicChecks[extension];
    return check ? check() : false;
  }

  private getExtension(fileName: string): string {
    const lastDot = fileName.lastIndexOf('.');
    return lastDot === -1 ? '' : fileName.substring(lastDot).toLowerCase();
  }

  public getName(): string {
    return this.originalName;
  }

  public getMimeType(): string {
    return this.mimeType;
  }

  public getBuffer(): Buffer {
    return this.buffer;
  }

  public getSizeInBytes(): number {
    return this.buffer.length;
  }
}
