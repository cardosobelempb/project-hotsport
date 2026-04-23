// import JSZip from 'jszip'
import { BaseFileVO } from "./base-file.vo";

let JSZip: any;
try {
  JSZip = require("jszip");
} catch {
  JSZip = null;
}

export class ZipVO extends BaseFileVO {
  public isValid(): boolean {
    try {
      if (this.mimeType !== "application/zip") {
        return false;
      }
      if (typeof JSZip === "undefined") {
        return true; // Não podemos validar o conteúdo, mas o MIME type é correto
      }
      // Tenta ler o arquivo como ZIP para validar a estrutura
      return JSZip.loadAsync(this.buffer)
        .then(() => true)
        .catch(() => false);
    } catch {
      return false;
    }
  }

  async validate() {
    if (this.mimeType !== "application/zip")
      throw new Error("Invalid ZIP MIME type");
    if (typeof JSZip !== "undefined") {
      await JSZip.loadAsync(this.buffer).catch(() => {
        throw new Error("Invalid ZIP file");
      });
    }
  }
}
