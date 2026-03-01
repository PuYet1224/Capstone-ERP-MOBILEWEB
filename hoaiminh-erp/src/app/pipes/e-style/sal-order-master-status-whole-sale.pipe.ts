import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SALOrderMasterStatusWholeSaleEnum } from 'src/app/models/enums/e-status/sal-order-master-status-wholesale.enum';

@Pipe({
  name: 'SALOrderMasterStatusWholeSale'
})

export class SALOrderMasterStatusWholeSalePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(status: { Status: SALOrderMasterStatusWholeSaleEnum, StatusName: string }): SafeHtml {
    let html = ``;

    switch (status.Status) {
      case SALOrderMasterStatusWholeSaleEnum.NEW:
        html = `<span style="background-color: transparent; border: 1px solid #3c4858; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: #3c4858;">${status.StatusName}</span>`;
        break;
      case SALOrderMasterStatusWholeSaleEnum.WATITINGDELIVERY:
        html = `<span style="background-color: #126433; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px;  color: white;">${status.StatusName}</span>`;
        break;
      case SALOrderMasterStatusWholeSaleEnum.CANCLE:
        html = `<span style="background-color: transparent; border: 1px solid #e5322b; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: #e5322b;">${status.StatusName}</span>`;
        break;
      case SALOrderMasterStatusWholeSaleEnum.OK:
        html = `<span style="background-color: transparent; border: 1px solid #126433; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px;  color: #126433;">${status.StatusName}</span>`;
        break;
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
