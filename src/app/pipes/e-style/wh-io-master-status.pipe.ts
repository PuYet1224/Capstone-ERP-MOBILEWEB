import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WHIOMasterStatusEnum } from '../../models/enums/e-status/wh-io-master-status.enum';

@Pipe({
    name: 'WHIOMasterStatus'
})

export class WHIOMasterStatusPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(status: { Status: WHIOMasterStatusEnum, StatusName: string }): SafeHtml {
        let html = ``;

        switch (status.Status) {
            case WHIOMasterStatusEnum.NEW:
                html = `<span style="background-color: transparent; border: 1px solid #3c4858; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: #3c4858;">${status.StatusName}</span>`;
                break;
            case WHIOMasterStatusEnum.SENT:
                html = `<span style="background-color: #e5322b; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: white;">${status.StatusName}</span>`;
                break;
            case WHIOMasterStatusEnum.PENDING:
                html = `<span style="background-color: #CD9000; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px;  color: white;">${status.StatusName}</span>`;
                break;
            case WHIOMasterStatusEnum.RECEIVING:
                html = `<span style="background-color: #126433; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px;  color: white;">${status.StatusName}</span>`;
                break;
            case WHIOMasterStatusEnum.DONE:
                html = `<span style="background-color: transparent; border: 1px solid #126433; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px;  color: #126433;">${status.StatusName}</span>`;
                break;
        }
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}