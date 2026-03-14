import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SALOrderInvoiceStatusEnum } from 'src/app/models/enums/e-status/sal-order-invoice-status.enum';

@Pipe({
    name: 'SALOrderInvoiceStatus'
})

export class SALOrderInvoiceStatusPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(status: { Status: SALOrderInvoiceStatusEnum, StatusName: string }): SafeHtml {
        let html = ``;

        switch (status.Status) {
            case SALOrderInvoiceStatusEnum.Cancled:
                html = `<span class="pipe-class"   style="background-color: #e5322b; color: #ffffff; line-height: 1; display: flex; align-items: center; ">
                    ${status.StatusName}
                    </span>`;
                break;

            case SALOrderInvoiceStatusEnum.Success:
                html = `<span class="pipe-class" style="background-color: transparent; border-color: #126433; color: #126433; line-height: 1; display: flex; align-items: center; ">
                    ${status.StatusName}
                    </span>`;
                break;

            case SALOrderInvoiceStatusEnum.New:
                html = `<span class="pipe-class" style="background-color: transparent; justify-content: center; border-color: #3c4858; color: #3c4858; line-height: 1; display: flex; align-items: center; ">
                    ${status.StatusName}
                </span>`;
                break;
        }
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}