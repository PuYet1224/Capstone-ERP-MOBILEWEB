import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SALOrderReceiptStatusEnum } from 'src/app/models/enums/e-status/sal-order-receipt-status.enum';

@Pipe({
    name: 'SALOrderReceiptStatus'
})

export class SALOrderReceiptStatusPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(status: { Status: SALOrderReceiptStatusEnum, StatusName: string }): SafeHtml {
        let html = ``;

        switch (status.Status) {
            case SALOrderReceiptStatusEnum.Cancled:
                html = `<span class="pipe-class"   style="background-color: #e5322b; color: #ffffff; line-height: 1; display: flex; align-items: center;  ">
                    ${status.StatusName}
                    </span>`;
                break;

            case SALOrderReceiptStatusEnum.Success:
                html = `<span class="pipe-class" style="background-color: transparent; border-color: #126433; color: #126433; line-height: 1; display: flex; align-items: center; justify-content: center; ">
                    ${status.StatusName}
                    </span>`;
                break;

            case SALOrderReceiptStatusEnum.New:
                html = `<span class="pipe-class" style="background-color: transparent; border-color: #3c4858; color: #3c4858; line-height: 1; display: flex; align-items: center; justify-content: center; ">
                    ${status.StatusName}
                </span>`;
                break;
        }
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}