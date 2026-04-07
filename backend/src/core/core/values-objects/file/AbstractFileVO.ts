export abstract class AbstractFileVO {
  constructor(
    protected readonly originalName: string,
    protected readonly mimeType: string,
    protected readonly buffer: Buffer,
    protected readonly maxSizeInBytes: number = 5 * 1024 * 1024, // 5MB padrão
  ) {}

  abstract validate(): Promise<void>

  public getName() { return this.originalName }
  public getMimeType() { return this.mimeType }
  public getBuffer() { return this.buffer }
  public getSizeInBytes() { return this.buffer.length }
}
