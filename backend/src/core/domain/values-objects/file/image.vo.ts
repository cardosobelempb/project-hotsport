import { BaseFileVO } from "./base-file.vo";

export class ImageVO extends BaseFileVO {
  private static readonly ALLOWED_EXTENSIONS = [
    ".png",
    ".jpeg",
    ".jpg",
    ".webp",
  ];
  private static readonly ALLOWED_MIME_TYPES = [
    "image/png",
    "image/jpeg",
    "image/webp",
  ];

  public isValid(): boolean {
    throw new Error("Method not implemented.");
  }

  public static create(
    originalName: string,
    mimeType: string,
    buffer: Buffer,
    size: number,
  ): ImageVO {
    const image = new ImageVO(originalName, mimeType, buffer, size);
    return image;
  }

  async validate() {
    const ext = "." + (this.originalName.split(".").pop() ?? "").toLowerCase();
    if (!ImageVO.ALLOWED_EXTENSIONS.includes(ext)) {
      throw new Error(`Invalid image extension: ${ext}`);
    }
    if (!ImageVO.ALLOWED_MIME_TYPES.includes(this.mimeType)) {
      throw new Error(`Invalid image MIME type: ${this.mimeType}`);
    }
    if (!this.buffer || this.buffer.length === 0)
      throw new Error("Image is empty or corrupted");
    // Magic number básico
    const header = this.buffer.slice(0, 4);
    const valid =
      (ext === ".png" && header.toString("hex") === "89504e47") ||
      ([".jpg", ".jpeg"].includes(ext) &&
        header.toString("hex").startsWith("ffd8")) ||
      (ext === ".webp" && header.toString() === "RIFF");
    if (!valid)
      throw new Error("Invalid image signature (magic number mismatch)");
  }
}
