import { BaseFileVO } from "./base-file.vo";

export class PDFVO extends BaseFileVO {
  public isValid(): boolean {
    try {
      // Validações básicas
      if (!this.mimeType || this.mimeType !== "application/pdf") {
        return false;
      }

      if (!this.buffer || this.buffer.length === 0) {
        return false;
      }

      // Verifica assinatura PDF (%PDF)
      const signature = this.buffer.subarray(0, 4).toString();
      return signature === "%PDF";
    } catch {
      return false;
    }
  }
  async validate() {
    if (this.mimeType !== "application/pdf") {
      throw new Error("Invalid MIME type for PDF");
    }

    if (this.buffer.subarray(0, 4).toString() !== "%PDF") {
      throw new Error("Invalid PDF file");
    }
  }
}
