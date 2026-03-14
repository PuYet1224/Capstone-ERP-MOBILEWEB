import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { LSVehicleConfigStatus } from 'src/app/models/enums/e-status/ls-vehicle-config-status.enum';

@Pipe({
    name: 'LSVehicleConfigStatus'
})

export class LSVehicleConfigStatusPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(status: { Status: LSVehicleConfigStatus, StatusName: string }): SafeHtml {
        let html = ``;

        switch (status.Status) {
            case LSVehicleConfigStatus.New:
                html = `<span style="background-color: transparent; border: 1px solid #3c4858; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: #3c4858;">${status.StatusName}</span>`;
                break;
            case LSVehicleConfigStatus.Approved:
                html = `<span style="background-color: #126433; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: white;">${status.StatusName}</span>`;
                break;
            case LSVehicleConfigStatus.Stop:
                html = `<span style="background-color: transparent; border: 1px solid #e5322b; padding: 4px 8px; border-radius: 5px; font-weight: 700; font-size: 12px; color: #e5322b;">${status.StatusName}</span>`;
                break;
        }
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}