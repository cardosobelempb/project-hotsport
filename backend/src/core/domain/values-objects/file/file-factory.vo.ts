import { BaseFileVO } from "./base-file.vo";
import { DocxVO } from "./docx.vo";

import { ImageVO } from "./image.vo";
import { PDFVO } from "./pdf.vo";
import { VideoVO } from "./video.vo";
import { XlsxVO } from "./xlsx.vo";
import { ZipVO } from "./zip.vo";

export class FileFactory {
  static async create(
    originalName: string,
    mimeType: string,
    buffer: Buffer,
  ): Promise<BaseFileVO> {
    const ext = "." + (originalName.split(".").pop() ?? "").toLowerCase();

    let vo: BaseFileVO;
    switch (ext) {
      case ".png":
      case ".jpg":
      case ".jpeg":
      case ".webp":
        vo = new ImageVO(originalName, mimeType, buffer);
        break;
      case ".pdf":
        vo = new PDFVO(originalName, mimeType, buffer);
        break;
      case ".docx":
        vo = new DocxVO(originalName, mimeType, buffer);
        break;
      case ".xlsx":
        vo = new XlsxVO(originalName, mimeType, buffer);
        break;
      case ".zip":
        vo = new ZipVO(originalName, mimeType, buffer);
        break;
      case ".mp4":
        vo = new VideoVO(originalName, mimeType, buffer);
        break;
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }

    await vo.validate();
    return vo;
  }
}

/**
 *
 * Exemplo de uso
import fs from 'fs'

async function main() {
  const buffer = fs.readFileSync('example.pdf')
  const file = await FileFactory.create('example.pdf', 'application/pdf', buffer)
  console.log('Arquivo válido:', file.getName(), file.getSizeInBytes(), 'bytes')
}

main()
 */
