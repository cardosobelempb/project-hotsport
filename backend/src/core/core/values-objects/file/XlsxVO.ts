// import JSZip from 'jszip'
import { AbstractFileVO } from './AbstractFileVO'

let JSZip: any
try {
  JSZip = require('jszip')
} catch {
  JSZip = null
}

export class XlsxVO extends AbstractFileVO {
  async validate() {
    if (!this.mimeType.includes('spreadsheetml.sheet')) throw new Error('Invalid XLSX MIME type')
    if (typeof JSZip !== 'undefined') {
      const zip = await JSZip.loadAsync(this.buffer).catch(() => null)
      if (!zip || !zip.files['xl/workbook.xml']) throw new Error('Invalid XLSX structure')
    }
  }
}

