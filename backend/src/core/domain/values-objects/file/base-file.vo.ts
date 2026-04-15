import { BaseVO } from "../base.vo";

export abstract class BaseFileVO extends BaseVO<{
  originalName: string;
  mimeType: string;
  buffer: Buffer;
}> {
  constructor(
    protected readonly originalName: string,
    protected readonly mimeType: string,
    protected readonly buffer: Buffer,
    protected readonly maxSizeInBytes: number = 5 * 1024 * 1024, // 5MB padrão
  ) {
    super({ originalName, mimeType, buffer });

    if (buffer.length > maxSizeInBytes) {
      throw new Error(
        `File size exceeds the maximum allowed of ${maxSizeInBytes} bytes`,
      );
    }
  }

  abstract validate(): Promise<void>;

  public getName() {
    return this.originalName;
  }
  public getMimeType() {
    return this.mimeType;
  }
  public getBuffer() {
    return this.buffer;
  }
  public getSizeInBytes() {
    return this.buffer.length;
  }
}
