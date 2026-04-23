import { BaseFileVO } from "./base-file.vo";

export class VideoVO extends BaseFileVO {
  constructor(
    originalName: string,
    mimeType: string,
    buffer: Buffer,
    maxSizeInBytes?: number,
  ) {
    super(originalName, mimeType, buffer, maxSizeInBytes);
  }

  public isValid(): boolean {
    return (
      this.mimeType === "video/mp4" &&
      this.buffer.subarray(4, 8).toString() === "ftyp"
    );
  }
  async validate() {
    if (this.mimeType !== "video/mp4") {
      throw new Error("Invalid video MIME type");
    }

    const header = this.buffer.subarray(4, 8).toString(); // normalmente "ftyp" fica aqui
    if (header !== "ftyp") {
      throw new Error("Invalid MP4 file signature");
    }
  }
}
