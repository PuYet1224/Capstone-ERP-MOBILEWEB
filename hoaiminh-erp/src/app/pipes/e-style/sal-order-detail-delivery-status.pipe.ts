import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SALOrderDetailDeliveryStatusEnum } from 'src/app/models/enums/e-status/sal-order-detail-delivery-status.enum';

@Pipe({
  name: 'SALOrderDetailDeliveryStatus'
})

export class SALOrderDetailDeliveryStatusPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(status: { Status: SALOrderDetailDeliveryStatusEnum, StatusName: string }): SafeHtml {
    let html = ``;

    switch (status.Status) {
      case SALOrderDetailDeliveryStatusEnum.NEW:
        html = `<span style="background-color: transparent; border: 1px solid #3c4858; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: #3c4858;">${status.StatusName}</span>`;
        break;
      case SALOrderDetailDeliveryStatusEnum.NOTDELIVERED:
        html = `<span style="background-color: #e5322b; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px;  color: white;">${status.StatusName}</span>`;
        break;
      case SALOrderDetailDeliveryStatusEnum.DELIVERED:
        html = `<span style="background-color: transparent; border: 1px solid #126433; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: #126433;">${status.StatusName}</span>`;
        break;
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
