import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ProcessStatusEnum } from '../../models/enums/process-status.enum';

@Pipe({
  name: 'ProcessStatus'
})

export class ProcessStatusPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }

  transform(status: { Status: ProcessStatusEnum, StatusName: string }): SafeHtml {
    let html = ``;

    switch (status.Status) {
      case ProcessStatusEnum.NEW:
        html = `
          <span style="
            background-color: transparent;
            border: 1px solid #3c4858;
            padding: 4px 8px;
            border-radius: 5px;
            font-weight: 700;
            font-size: 12px;
            color: #3c4858;">
            ${status.StatusName}
          </span>`;
        break;
      case ProcessStatusEnum.SENT:
        html = `
          <span style="
            background-color: #CD9000;
            padding: 4px 8px;
            border-radius: 5px;
            font-weight: 700;
            font-size: 12px;
            color: white;">
            ${status.StatusName}
          </span>`;
        break;
      case ProcessStatusEnum.NOTAPPROVED:
        html = `
          <span style="
            background-color: #e5322b;
            padding: 4px 8px;
            border-radius: 5px;
            font-weight: 700;
            font-size: 12px;
            color: white;">
            ${status.StatusName}
          </span>`;
        break;
      case ProcessStatusEnum.APPROVED:
        html = `
          <span style="
            background-color: transparent;
            border: 1px solid #126433;
            padding: 4px 8px;
            border-radius: 5px;
            font-weight: 700;
            font-size: 12px;
            color: #126433;">
            ${status.StatusName}
          </span>`;
        break;
      case ProcessStatusEnum.STOP:
        html = `
            <span style="
              background-color: transparent;
              border: 1px solid #e5322b;
              padding: 4px 8px;
              border-radius: 5px;
              font-weight: 700;
              font-size: 12px;
              color: #e5322b;">
              ${status.StatusName}
            </span>`;
        break;
      case ProcessStatusEnum.RETURN:
        html = `
              <span style="
                background-color: transparent;
                border: 1px solid #CD9000;;
                padding: 4px 8px;
                border-radius: 5px;
                font-weight: 700;
                font-size: 12px;
                color: #CD9000;">
                ${status.StatusName}
              </span>`;
        break;
    }
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
