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
    <span class="pipe-class"
          style="background-color:${background};
                 border-color:${color};
                 color:${color};">
      ${status.ProgressName}
    </span>
    `;

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
