import { PsString } from "./ps-string";

export class PSFile {
  public static getFileName(disposition: string): string {
    const utf8FilenameRegex = /filename\*=UTF-8''([\w%\-\.]+)(?:; ?|$)/i;
    const asciiFilenameRegex = /filename=(["']?)(.*?[^\\])\1(?:; ?|$)/i;

    let fileName: string = null;
    if (utf8FilenameRegex.test(disposition)) {
      fileName = decodeURIComponent(utf8FilenameRegex.exec(disposition)[1]);
    } else {
      const matches = asciiFilenameRegex.exec(disposition);
      if (matches != null && matches[2]) {
        fileName = matches[2];
      }
    }
    return fileName;
  }

  public static getFile(res, typeExport = 0, getfileName = 'ExcelTemplate') {
    const listTypeExport = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/pdf'
    ]
    const contentDisposition = res.headers.get('content-disposition');
    const filename = this.getFileName(contentDisposition);
    // ko biết type: application/octet-stream
    // type excel xlsx: vnd.openxmlformats-officedocument.spreadsheetml.sheet
    // type excel xls: vnd.ms-excel
    const blob = new Blob([res.body], { type: listTypeExport[typeExport] });

    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");

    a.href = url;
    a.download = !PsString.isNullOrWhitespace(filename) ? filename : getfileName
    a.click();
    window.URL.revokeObjectURL(url)
  }
}