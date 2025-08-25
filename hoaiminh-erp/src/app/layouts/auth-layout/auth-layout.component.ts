import { Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';
import { Subscription } from 'rxjs';
import { ConfigDTO } from 'src/app/models/dtos/config.dto';
import { LSHeadCusDTO } from 'src/app/models/dtos/e-dtos/ls-head.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { AuthApiService } from 'src/app/services/auth/auth-api.service';
import { LayoutApiService } from 'src/app/services/layout/layout-api.service';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PSArray } from 'src/app/services/utilities/ps-array';
import { PSCache } from 'src/app/services/utilities/ps-cache';
import { AuthService } from 'src/app/services/auth/auth.service';
import { PSObject } from 'src/app/services/utilities/ps-object';
import { PsLayoutLoaderService } from '../main-layout/services/ps-layout-loader.service';
import { PSGetConfigService } from 'src/app/services/core/ps-get-config.service';
import { PSDate } from 'src/app/services/utilities/ps-date';
import { PSString } from 'src/app/services/utilities/ps-string';
declare var $: any;

@Component({
  selector: 'ps-auth-layout',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss']
})
export class AuthLayoutComponent {
  @ViewChild("password") public tbpassword: TextBoxComponent;
  private arrUnsubscribe: Subscription[] = [];
  public tabActive = 1;
  public loginForm: UntypedFormGroup;
  public returnUrl: string = "/";
  public carouselActive: string = '../../../assets/images/bg_auth_carosel_1.jpg';
  public carouselData: string[] = [
    "../../../assets/images/bg_auth_carosel_1.jpg",
    "../../../assets/images/bg_auth_carosel_2.jpg",
    "../../../assets/images/bg_auth_carosel_3.jpg"
  ]
  passwordHidden: boolean = true;
  isLoggedIn: boolean = true;

  constructor(
    protected router: Router,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private authAPI: AuthApiService,
    private cache: PSCache,
    private layoutapi: LayoutApiService,
    private notification: PSKendoNotificationService,
    private authService: AuthService,
    private subLoader: PsLayoutLoaderService,
    private config: PSGetConfigService,
  ) { }

  ngOnInit() {
    const token = this.config.GetToken();
    var time = token ? PSDate.addHours(new Date(token.time_expired), -7) : null;
    if (time && time > new Date()) {
      this.router.navigate(["/"]);
    }

    if (!PSObject.isNullOfUndefined(window.caches))
      window.caches.keys().then(function (names) {
        for (let name of names)
          caches.delete(name);
      });

    this.onInitForm()

    var cacheuurl = this.cache.getItem(KeyLocalStorageEnum.OUT_URL);
    var urldata = this.cache.parseValue(cacheuurl);
    this.returnUrl = PSString.isNullOrWhitespace(urldata) ? this.route.url : urldata;
  }

  ngAfterViewInit(): void {
    if (this.tabActive == 1)
      this.tbpassword.input.nativeElement.type = "password";

    var that = this;
    $(document).ready(function () {
      var $carousel = $('.owl-carousel').owlCarousel({
        items: 1,
        loop: true,
        autoplay: true,
        autoplayTimeout: 5000,
        autoHeight: true,
        autoplayHoverPause: true
      });

      $carousel.on('changed.owl.carousel', function (event) {
        var currentIndex = event.item.index;
        that.carouselActive = that.carouselData[currentIndex - 2];
      });
    });
  }

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
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.authAPI.token(this.f['username'].value, this.f['password'].value)
      .subscribe(res => {
        if (res) {
          var cacheheadlastactive = this.cache.getItem(KeyLocalStorageEnum.HEAD_OBJECT);
          var headlastactive = cacheheadlastactive ? this.cache.parseValue(cacheheadlastactive) : null;

          if (!headlastactive || !headlastactive.Head) {
            this.tabActive = 2;
            this.getListHead();
          } else {
            this.router.navigate([this.returnUrl]);
          }
        }
      }, (e) => {
        this.notification.onError("Đăng nhập thất bại")
      });
  }

  onInitForm() {
    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  public listHead: LSHeadCusDTO[] = [];

  public getListHead() {
    this.subLoader.loader(true);
    let temp = this.layoutapi.GetHead().subscribe(res => {
      if (res.StatusCode == 0) {
        this.listHead = res.ObjectReturn;
        if (!PSArray.any(this.listHead))
          this.authService.logout();
        else if (PSArray.count(this.listHead) == 1) {
          ConfigDTO.head = this.listHead[0];
        }
        this.cache.setItem(KeyLocalStorageEnum.HEAD_LIST, this.listHead);
        this.subLoader.loader(false);

      } else
        this.notification.onError(`Lỗi lấy danh sách head: ${res.ErrorString}`);
    }, (err) => {
      this.notification.onError(`Lỗi lấy danh sách head: ${err.message}`);
    })
    // this.arrUnsubscribe.push(temp);
  }

  public selectHead(obj: LSHeadCusDTO) {
    this.cache.setItem(KeyLocalStorageEnum.HEAD_OBJECT, obj);
    ConfigDTO.head = obj;
    this.router.navigate([this.returnUrl]);
  }
}
