import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SALOrderMasterProcessEnum } from 'src/app/models/enums/e-status/sal-order-master-process.enum';

@Pipe({
  name: 'SALOrderMasterProcessRetail'
})
export class SALOrderMasterProcessRetailPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(status: { Progress: SALOrderMasterProcessEnum, ProgressName: string }): SafeHtml {
    let color = '#3C4858', background = '#fff';

    switch (status.Progress) {
      case SALOrderMasterProcessEnum.NEW: color = '#3C4858'; break;
      case SALOrderMasterProcessEnum.PROCESSING: color = '#CD9000'; break
      case SALOrderMasterProcessEnum.END: color = '#126433'; break;
    }

    const html = `
      <span style="
        background-color: #fff;
        width: fit-content;
        height: 21px;
        padding: 4px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-size: 11px;
        text-align: center;
        border: 1px solid ${color};
        line-height: 1;
        color: ${color};
      ">
        ${status.ProgressName}
      </span>
    `;

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
