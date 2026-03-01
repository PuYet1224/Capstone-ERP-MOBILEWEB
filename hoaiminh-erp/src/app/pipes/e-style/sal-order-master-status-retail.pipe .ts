import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SALOrderMasterStatusRetailEnum } from 'src/app/models/enums/e-status/sal-order-master-status-retail.enum';

@Pipe({
  name: 'SALOrderMasterStatusRetail'
})
export class SALOrderMasterStatusRetailPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(
    status: {
      Active: 'consultant' | 'processing' | 'payment',
      Progress: SALOrderMasterStatusRetailEnum,
      ProgressName: string
    }
  ): SafeHtml {

    let color = '#3C4858';
    let background = 'transparent';

    switch (status.Progress) {
      case SALOrderMasterStatusRetailEnum.NEW:
        color = '#3C4858';
        break;
      case SALOrderMasterStatusRetailEnum.RETURN:
      case SALOrderMasterStatusRetailEnum.PENDING:
        color = '#CD9000';
        break;
      case SALOrderMasterStatusRetailEnum.PROCESSING:
        color = '#0074FF';
        break;
      case SALOrderMasterStatusRetailEnum.COMPLETE:
        color = '#126433';
        break;
      case SALOrderMasterStatusRetailEnum.CANCEL:
        color = '#E5322B';
        break;
    }

    if (status.Active) {
      background = color;
      color = '#fff';
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
