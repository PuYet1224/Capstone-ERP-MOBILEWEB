import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SALOrderDetailTypeDataEnum } from 'src/app/models/enums/e-type/sal-order-detail-type-data.enum';

@Pipe({
    name: 'SALOrderDetailTypeData'
})

export class SALOrderDetailTypeDataPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(status: { Status: SALOrderDetailTypeDataEnum, StatusName: string }): SafeHtml {
        let html = ``;

        switch (status.Status) {
            case SALOrderDetailTypeDataEnum.BUY:
                html = `<span class="pipe-class" style="background-color: #126433; border-color: #ffffff; color: #ffffff;">
                        ${status.StatusName}
                    </span>`;
                break;

            case SALOrderDetailTypeDataEnum.TRANSFER:
                html = `<span class="pipe-class" style="background-color: #CD9000; border-color: #ffffff; color: #ffffff;">
                        ${status.StatusName}
                    </span>`;
                break;

            case SALOrderDetailTypeDataEnum.BOOK:
                html = `<span class="pipe-class" style="background-color: #3c4858; border-color: #ffffff; color: #ffffff;">
                        ${status.StatusName}
                    </span>`;
                break;

        }
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}