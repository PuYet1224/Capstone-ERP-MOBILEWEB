import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { InventoryMasterStatusEnum } from '../../models/enums/e-status/wh-inventory-master-status.enum';

@Pipe({
  name: 'WHInventoryMasterStatus'
})

export class WHInventoryMasterStatusPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(status: { Status: InventoryMasterStatusEnum, StatusName: string }): SafeHtml {
    let html = ``;

    switch (status.Status) {
      case InventoryMasterStatusEnum.NEW:
        html = `<span style="background-color: transparent; border: 1px solid #3c4858; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: #3c4858;">${status.StatusName}</span>`;
        break;
      case InventoryMasterStatusEnum.DOING:
        html = `<span style="background-color: #126433; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px;  color: white;">${status.StatusName}</span>`;
        break;
      case InventoryMasterStatusEnum.CANCLE:
        html = `<span style="background-color: transparent; border: 1px solid #e5322b; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: #e5322b;">${status.StatusName}</span>`;
        break;
      case InventoryMasterStatusEnum.DONE:
        html = `<span style="background-color: transparent; border: 1px solid #126433; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px;  color: #126433;">${status.StatusName}</span>`;
        break;
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
