import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LSTypeOfPartOfStatusEnum } from 'src/app/models/enums/e-status/ls-type-of-part-of-status.enum';
@Pipe({
    name: 'LSTypeOfPartOfStatus'
})

export class LSTypeOfPartOfStatusPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(status: { StatusWhole: LSTypeOfPartOfStatusEnum, StatusWholeName: string }): SafeHtml {
        let html = ``;

        switch (status.StatusWhole) {
            case LSTypeOfPartOfStatusEnum.BusinessActive:
                html = `<span style="background-color: #126433; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px;  color: white; text-transform: uppercase;">${status.StatusWholeName}</span>`;
                break;
            case LSTypeOfPartOfStatusEnum.BusinessInactive:
                html = `<span style="background-color: #e5322b; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px;  color: white; text-transform: uppercase;">${status.StatusWholeName}</span>`;
                break;
            default:
                html = `<span>${status.StatusWholeName}</span>`;
        }
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
