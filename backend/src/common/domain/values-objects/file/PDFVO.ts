import { AbstractFileVO } from "./AbstractFileVO";

export class PDFVO extends AbstractFileVO {
  async validate() {
    if (this.mimeType !== 'application/pdf') {
      throw new Error('Invalid MIME type for PDF');
    }

    if (this.buffer.subarray(0, 4).toString() !== '%PDF') {
      throw new Error('Invalid PDF file');
    }
  }
}
