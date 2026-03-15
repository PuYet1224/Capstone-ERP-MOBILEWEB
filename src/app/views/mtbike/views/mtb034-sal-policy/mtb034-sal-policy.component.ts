import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { POLSalesPolicyCusDTO } from 'src/app/models/dtos/e-dtos/pol-sales-policy.dto';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { SystemLoaderService } from 'src/app/views/system/services/system-loader.service';
import { MtbikeApiService } from '../../services/mtbike-api.service';

@Component({
  selector: 'mtb034-sal-policy',
  templateUrl: './mtb034-sal-policy.component.html',
  styleUrls: ['./mtb034-sal-policy.component.scss'],
})
export class Mtb034SalPolicyComponent implements OnInit, OnDestroy {
  public policylist: POLSalesPolicyCusDTO[] = [];
  private arrUnsubscribe: Subscription[] = [];

  constructor(
    private router: Router,
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private mtbikeapi: MtbikeApiService,
  ) { }

  ngOnInit(): void {
    this.getlistsalpolicy();
  }

  ngOnDestroy(): void {
    this.subLoader.reset();
    this.arrUnsubscribe.forEach(e => e.unsubscribe());
    this.arrUnsubscribe = [];
  }

  private getlistsalpolicy() {
    this.subLoader.loader(true);
    // Giả lập gọi API hoặc gọi thật nếu backend đã có
    const sub = this.mtbikeapi.GetListSALPolicy()
      .subscribe((res) => {
        if (res.StatusCode === 0) {
          this.policylist = res.ObjectReturn || [];
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi lấy danh sách chính sách: ${res.ErrorString}`);
        }
      },
        (err) => {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi hệ thống: ${err.message}`);
        }
      );
    this.arrUnsubscribe.push(sub);
  }

  public onBack() {
    this.router.navigate(['/menu']);
  }
}
