import { AbstractFileVO } from "./AbstractFileVO";

export class VideoVO extends AbstractFileVO {
  async validate() {
    if (this.mimeType !== 'video/mp4') {
      throw new Error('Invalid video MIME type');
    }

    const header = this.buffer.subarray(4, 8).toString(); // normalmente "ftyp" fica aqui
    if (header !== 'ftyp') {
      throw new Error('Invalid MP4 file signature');
    }
  }
}
