import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { WOMStatusEnum } from 'src/app/models/enums/e-status/wom-status.enum';

@Pipe({
    name: 'WOMProgressStatus'
})
export class WOMProgressStatusPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) { }

    transform(status: { Progress: WOMStatusEnum, ProgressName: string }): SafeHtml {
        let html = ``;

        switch (status.Progress) {
            case WOMStatusEnum.RECEIVING: // Tiếp nhận
                html = `<span style="background-color: #8B0000; 
                            width: 45px;
                            padding: 4px;
                            display: flex;
                            align-items: center;
                            height: 45px;
                            font-size: 11px;
                            text-align: center;
                            color: white;">
                  ${status.ProgressName}
                </span>`;
                break;

            case WOMStatusEnum.REPAIRING: // Đang sửa
                html = `<span style="background-color: #CD9000; 
                            width: 45px;
                            padding: 4px;
                            display: flex;
                            align-items: center;
                            height: 45px;
                            font-size: 11px;
                            text-align: center;
                            color: white;">
                  ${status.ProgressName}
                </span>`;
                break;

            case WOMStatusEnum.WAITING_DELIVERY: // Chờ giao xe
                html = `<span style="background-color: #126433; 
                           width: 45px;
                           padding: 4px;
                           display: flex;
                           align-items: center;
                           height: 45px;
                           font-size: 11px;
                           text-align: center;
                           color: white;">
                  ${status.ProgressName}
                </span>`;
                break;

            case WOMStatusEnum.DONE: // Hoàn tất
                html = `<span style="background-color: #ffffff; 
                           width: 45px;
                           padding: 4px;
                           display: flex;
                           align-items: center;
                           height: 45px;
                           font-size: 11px;
                           text-align: center;
                           border: 1px solid #126633;
                           color: #126633;">
                  ${status.ProgressName}
                </span>`;
                break;
        }

        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
