// import JSZip from 'jszip'
import { BaseFileVO } from "./base-file.vo";

let JSZip: any;
try {
  JSZip = require("jszip");
} catch {
  JSZip = null;
}

export class DocxVO extends BaseFileVO {
  public isValid(): boolean {
    try {
      if (!this.mimeType.includes("wordprocessingml.document")) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
  async validate() {
    if (!this.mimeType.includes("wordprocessingml.document"))
      throw new Error("Invalid DOCX MIME type");
    if (typeof JSZip !== "undefined") {
      const zip = await JSZip.loadAsync(this.buffer).catch(() => null);
      if (!zip || !zip.files["word/document.xml"])
        throw new Error("Invalid DOCX structure");
    }
  }
}
