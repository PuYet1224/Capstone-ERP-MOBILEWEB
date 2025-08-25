import { Injectable, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ActionHeaderItemEnum } from 'src/app/layouts/main-layout/models/enums/action-header-item.enum';

@Injectable({
  providedIn: 'root'
})
export class PSHeaderService {
  public expanded: EventEmitter<void> = new EventEmitter<void>();

  public headChange = new BehaviorSubject<any>(null);
  public headObs$ = this.headChange.asObservable();

  public dataActionHeader = [
    {
      IsAction: false
    },
    {
      Action: "Thông tin cá nhân",
      Key: ActionHeaderItemEnum.PROFILE,
      Icon: 'badge',
      IsAction: true
    },
    {
      Action: "Đổi mật khẩu",
      Key: ActionHeaderItemEnum.SETTING,
      Icon: 'manage_accounts',
      IsAction: true
    },
    {
      Action: "Đăng xuất",
      Key: ActionHeaderItemEnum.LOGOUT,
      Icon: 'logout',
      IsAction: true
    },
  ]
}
