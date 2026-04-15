// import JSZip from 'jszip'
import { BaseFileVO } from "./base-file.vo";

let JSZip: any;
try {
  JSZip = require("jszip");
} catch {
  JSZip = null;
}

export class XlsxVO extends BaseFileVO {
  public isValid(): boolean {
    try {
      if (!this.mimeType.includes("spreadsheetml.sheet")) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }
  async validate() {
    if (!this.mimeType.includes("spreadsheetml.sheet"))
      throw new Error("Invalid XLSX MIME type");
    if (typeof JSZip !== "undefined") {
      const zip = await JSZip.loadAsync(this.buffer).catch(() => null);
      if (!zip || !zip.files["xl/workbook.xml"])
        throw new Error("Invalid XLSX structure");
    }
  }
}
