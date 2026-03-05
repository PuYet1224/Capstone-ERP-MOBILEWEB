import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';
import { Subscription } from 'rxjs';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { AuthApiService } from 'src/app/services/auth/auth-api.service';
import { GetConfigService } from 'src/app/services/core/ps-get-config.service';
import { PsKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PsCache } from 'src/app/services/utilities/ps-cache';
import { PSDate } from 'src/app/services/utilities/ps-date';
import { PSObject } from 'src/app/services/utilities/ps-object';
import { SystemApiService } from '../../services/system-api.service';
import { SystemLoaderService } from '../../services/system-loader.service';
import { SystemService } from '../../services/system.service';
declare var $: any;

@Component({
  selector: 'sys001-login',
  templateUrl: './sys001-login.component.html',
  styleUrls: ['./sys001-login.component.scss']
})

export class Sys001LoginComponent implements OnDestroy, OnInit, AfterViewInit {
  constructor(
    protected router: Router,
    private formBuilder: UntypedFormBuilder,
    private authAPI: AuthApiService,
    private cache: PsCache,
    private notification: PsKendoNotificationService,
    private config: GetConfigService,
    private loader: SystemLoaderService,
    private sysservices: SystemService,
    private sysapi: SystemApiService,
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];

  ngOnInit() {
    // this.cache.setItem(KeyLocalStorageEnum.BEARER_TOKEN, {
    //   "access_token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjZCN0FDQzUyMDMwNUJGREI0RjcyNTJEQUVCMjE3N0NDMDkxRkFBRTEiLCJ0eXAiOiJKV1QiLCJ4NXQiOiJhM3JNVWdNRnY5dFBjbExhNnlGM3pBa2ZxdUUifQ.eyJuYmYiOjE3NjMxMTI1NzksImV4cCI6MTc2MzExNjE3OSwiaXNzIjoiaHR0cDovL2xvY2FsaG9zdCIsImF1ZCI6WyJodHRwOi8vbG9jYWxob3N0L3Jlc291cmNlcyIsImFkbWluYXBpIl0sImNsaWVudF9pZCI6ImFkbWluIiwic3ViIjoiNjI4Zjk2NWEtNzJmOS00MjEzLTljNzEtMzMyMWRkZDBiMzZjIiwiYXV0aF90aW1lIjoxNzYzMTEyNTc5LCJpZHAiOiJsb2NhbCIsInByb2ZpbGUiOiIxIiwibmFtZSI6Ik5ndXnhu4VuIEh14buzbmggTWFpIiwic2NvcGUiOlsiYWRtaW5hcGkiLCJvZmZsaW5lX2FjY2VzcyJdLCJhbXIiOlsicGFzc3dvcmQiXX0.VgV_SFuYeSkgU3XhTkX7FDx8ag7JRZhjahS4WT_umONUP4qna3w3ZmshvyipGDEhulB-pHvBGgYXzqbq7pPSnm1YbuFgBvAo1ZLDie3BsHk3IGY4KgqT_jA87tkLRgcE2tftfT2-i2RxFRdsP8mqIlEJFulgsGUvITDZiccfCVg3RMFUxJsLEBGvpQJ4AGXTSZwnEMNjc1DkpimG4nFZ2noDRKoKjqFC_beIMtHxzkyyeJk_eA9CJ29rvqhzcyvZ0i2IghWeoTiVCKzZHZSwCuWIQL5v5Sn8qS3QmACiwW3ZSHw6hgsvX0DrrfiCHJ3elfTQTSnPax73sRZ6xefeQQ",
    //   "expires_in": 3600,
    //   "token_type": "Bearer",
    //   "refresh_token": "b96e529181106f6fc0d1e5a33068e35d301384b469325c686cbdf25b44fd32b0"
    // })
    const token = this.config.GetToken();
    var time = token ? PSDate.addHours(new Date(token.time_expired), -7) : null;
    if (time && time > new Date()) {
      this.sysservices.logout();
    }

    if (!PSObject.isNullOfUndefined(window.caches))
      window.caches.keys().then(function (names) {
        for (let name of names)
          caches.delete(name);
      });

    this.onInitForm()
  }

  ngAfterViewInit(): void {
    this.tbpassword.input.nativeElement.type = "password";

    var that = this;
    $(document).ready(function () {
      var $carousel = $('.owl-carousel').owlCarousel({
        items: 1, loop: true, autoplay: true, autoplayTimeout: 5000,
        autoHeight: true, autoplayHoverPause: true
      });

      $carousel.on('changed.owl.carousel', function (event) {
        var currentIndex = event.item.index;
        that.carouselActive = that.carouselData[currentIndex - 2];
      });
    });
  }

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region header carousel
  public carouselActive: string = '../../../assets/images/bg_auth_carosel_1.jpg';
  public carouselData: string[] = [
    "../../../assets/images/bg_auth_carosel_1.jpg",
    "../../../assets/images/bg_auth_carosel_2.jpg",
    "../../../assets/images/bg_auth_carosel_3.jpg"
  ]
  //#endregion

  //#region form body
  @ViewChild("password") public tbpassword: TextBoxComponent;
  public loginForm: UntypedFormGroup;
  passwordHidden: boolean = true;
  isLoggedIn: boolean = true;

  get f() {
    return this.loginForm.controls
  }

  public showpassword(): void {
    const inputEl = this.tbpassword.input.nativeElement;
    inputEl.type = "text";
  }

  public hidepassword(): void {
    const inputEl = this.tbpassword.input.nativeElement;
    inputEl.type = "password";
  }

  onSubmit() {
    this.loader.loader(true);
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      this.notification.onWarning("Tài khoản hoặc mật khẩu không hợp lệ");
      this.loader.loader(false);
      return;
    }

    var temp = this.authAPI.token(this.f['username'].value, this.f['password'].value)
      .subscribe(res => {
        if (res) {
          // Gọi GetConfig trước để nạp GlobalVar trên server (roles, permissions, API)
          var configSub = this.sysapi.GetConfig().subscribe({
            next: () => {
              var cacheheadlastactive = this.cache.getItem(KeyLocalStorageEnum.HEAD_OBJECT);
              var headlastactive = cacheheadlastactive ? this.cache.parseValue(cacheheadlastactive) : null;

              this.loader.loader(false);
              if (!headlastactive || !headlastactive.Head) {
                this.router.navigate(['/store']);
              } else {
                this.router.navigate(["menu"]);
              }

              var sub = this.sysapi.GetEmployeeAccount().subscribe({
                complete: () => {
                  sub.unsubscribe();
                }
              });
              this.arrUnsubscribe.push(sub);
            },
            error: () => {
              // Nếu GetConfig lỗi, vẫn cho navigate
              this.loader.loader(false);
              this.router.navigate(['/store']);
            }
          });
          this.arrUnsubscribe.push(configSub);
        }
      }, (e) => {
        this.loader.loader(false);
        this.notification.onError("Đăng nhập thất bại")
      });
    this.arrUnsubscribe.push(temp);
  }

  onInitForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  //#endregion
}
