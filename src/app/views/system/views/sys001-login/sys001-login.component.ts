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
import { environment } from 'src/environments/environment';
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
    // Đánh thức server hosting khỏi chế độ ngủ (cold start)
    fetch(environment.apiServer + '/api/ping').catch(() => {});

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

          var subConfig = this.sysapi.GetConfig().subscribe({
            complete: () => {
              subConfig.unsubscribe();
            }
          });
          this.arrUnsubscribe.push(subConfig);
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
