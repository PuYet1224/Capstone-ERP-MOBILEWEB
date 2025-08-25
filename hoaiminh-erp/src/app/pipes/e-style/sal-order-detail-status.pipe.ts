import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SALOrderDetailStatusEnum } from '../../models/enums/e-status/sal-order-detail-status.enum';
@Pipe({
  name: 'SALOrderDetailStatus'
})

export class SALOrderDetailStatusPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(status: { Status: SALOrderDetailStatusEnum, StatusName: string }): SafeHtml {
    let html = ``;

    switch (status.Status) {
      case SALOrderDetailStatusEnum.NEW:
        html = `<span style="background-color: transparent; border: 1px solid #3c4858; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: #3c4858;">${status.StatusName}</span>`;
        break;
      case SALOrderDetailStatusEnum.NOTDELIVERED:
        html = `<span style="background-color: #e5322b; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px;  color: white;">${status.StatusName}</span>`;
        break;
      case SALOrderDetailStatusEnum.DELIVERED:
        html = `<span style="background-color: transparent; border: 1px solid #126433; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: #126433;">${status.StatusName}</span>`;
        break;
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
