// import JSZip from 'jszip'
import { AbstractFileVO } from './AbstractFileVO'

let JSZip: any
try {
  JSZip = require('jszip')
} catch {
  JSZip = null
}

export class ZipVO extends AbstractFileVO {
  async validate() {
    if (this.mimeType !== 'application/zip') throw new Error('Invalid ZIP MIME type')
    if (typeof JSZip !== 'undefined') {
      await JSZip.loadAsync(this.buffer).catch(() => {
        throw new Error('Invalid ZIP file')
      })
    }
  }
}
