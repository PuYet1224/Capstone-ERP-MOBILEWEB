import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SALOrderDetailStatusEnum } from 'src/app/models/enums/e-status/sal-order-detail-status.enum';

@Pipe({
    name: 'SALOrderDetailStatus'
})

export class SALOrderDetailStatusPipe implements PipeTransform {

    constructor(private sanitizer: DomSanitizer) { }

    transform(status: { Status: SALOrderDetailStatusEnum, StatusName: string }): SafeHtml {
        let html = ``;

        switch (status.Status) {
            //         case SALOrderDetailStatusEnum.Transfer:
            //             html = `<span class="pipe-class" style="background-color: #CD9000; color: white;">
            //                 ${status.StatusName}
            //                 </span>`;
            //             break;

            //         case SALOrderDetailStatusEnum.TransferRequest:
            //             html = `<span class="pipe-class" style="background-color: transparent; border-color: #CD9000; color: #CD9000; max-width: 88px;">
            //                 ${status.StatusName}
            //                 </span>`;
            //             break;

            //         case SALOrderDetailStatusEnum.Booking:
            //             html = `<span class="pipe-class" style="background-color: transparent; border-color: #3c4858; color: #3c4858;">
            //                 ${status.StatusName}
            //             </span>`;
            //             break;

            //         case SALOrderDetailStatusEnum.Selected:
            //         case SALOrderDetailStatusEnum.PaymentRequest:
            //             html = `<span class="pipe-class" style="background-color: #126633; border-color: #126633; color: #ffffff;">
            //                     ${status.StatusName}
            //                 </span>`;
            //             break;

            //         case SALOrderDetailStatusEnum.OwnerInfo:
            //             html = `<span class="pipe-class" style="background-color: #0074FF; border-color: #0074FF; color: #ffffff;">
            //                     ${status.StatusName}
            //                 </span>`;
            //             break;

            //         case SALOrderDetailStatusEnum.ContactInfo:
            //             html = `<span class="pipe-class" style="background-color: #transparent; border-color: #0074FF; color: #0074FF;">
            //                     ${status.StatusName}
            //                 </span>`;
            //             break;

            //         case SALOrderDetailStatusEnum.OtherInfo:
            //             html = `<span class="pipe-class" style="background-color: transparent; border-color: #3c4858; color: #3c4858;">
            //                     ${status.StatusName}
            //                 </span>`;
            //             break;
            //         case SALOrderDetailStatusEnum.RePayment:
            //             html = `<span class="pipe-class" style="background-color: transparent; border-color: #5D478B; color: #5D478B;max-width: 88px;">
            //                         ${status.StatusName}
            //                     </span>`;
            //             break;
            //         case SALOrderDetailStatusEnum.Payment:
            //             html = `<span class="pipe-class" style="background-color: #126633; border-color: #126633; color: #ffffff;">
            //                         ${status.StatusName}
            //                     </span>`;
            //             break;
            //         case SALOrderDetailStatusEnum.OutboundRequest:
            //             html = `<span class="pipe-class"
            //     style="background-color: transparent; border-color: #CD9000; color: #CD9000; max-width: 110px;">
            //     ${status.StatusName}
            // </span>`;
            //             break;

            //         case SALOrderDetailStatusEnum.OutboundCompleted:
            //             html = `<span class="pipe-class"
            //     style="background-color: #126633; border-color: #126633; color: #ffffff; max-width: 110px;">
            //     ${status.StatusName}
            // </span>`;
            //             break;

            //         case SALOrderDetailStatusEnum.Technical:
            //             html = `<span class="pipe-class"
            //     style="background-color: transparent; border-color: #0074FF; color: #0074FF; max-width: 110px;">
            //     ${status.StatusName}
            // </span>`;
            //             break;

            //         case SALOrderDetailStatusEnum.Completed:
            //             html = `<span class="pipe-class" style="background-color: transparent; border-color: #126633; color: #126633;max-width: 88px;">
            //                     ${status.StatusName}
            //                 </span>`;
            //             break;

            //         case SALOrderDetailStatusEnum.Canceled:
            //             html = `<span class="pipe-class" style="background-color: transparent; border-color: #e5322b; color: #e5322b;max-width: 88px;">
            //                     ${status.StatusName}
            //                 </span>`;
            //             break;
        }
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}