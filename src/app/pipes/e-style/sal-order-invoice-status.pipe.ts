import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SALOrderInvoiceStatusEnum } from 'src/app/models/enums/e-status/sal-order-invoice-status.enum';

@Pipe({
    name: 'SALOrderInvoiceStatus'
})

export class SALOrderInvoiceStatusPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(status: any): SafeHtml {
        if (!status) return '';
        
        let statusCode = typeof status === 'object' ? (status.TypeOfStatus || status.Status) : status;
        let statusName = typeof status === 'object' ? status.StatusName : (statusCode === 1 ? 'Chưa xuất' : 'Đã xuất');

        let html = ``;

        switch (statusCode) {
            case SALOrderInvoiceStatusEnum.New:
                html = `<span class="pipe-class" style="background-color: transparent; border: 1px solid #e5322b; color: #e5322b; line-height: 1; display: inline-flex; align-items: center; padding: 6px 8px; border-radius: 12px; font-weight: 700; font-size: 10px;">
                    ${statusName}
                </span>`;
                break;

            case SALOrderInvoiceStatusEnum.Success:
                html = `<span class="pipe-class" style="background-color: transparent; border: 1px solid #126433; color: #126433; line-height: 1; display: inline-flex; align-items: center; padding: 6px 8px; border-radius: 12px; font-weight: 700; font-size: 10px;">
                    ${statusName}
                </span>`;
                break;
                
            default:
                html = `<span style="padding: 6px 8px; border-radius: 12px; font-weight: 700; font-size: 10px;">${statusName}</span>`;
                break;
        }
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}