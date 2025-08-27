import { Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';
import { Subscription } from 'rxjs';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { AuthApiService } from 'src/app/services/auth/auth-api.service';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PSObject } from 'src/app/services/utilities/ps-object';
import { PSGetConfigService } from 'src/app/services/core/ps-get-config.service';
import { PSDate } from 'src/app/services/utilities/ps-date';
import { PsCache } from 'src/app/services/utilities/ps-cache';
declare var $: any;

@Component({
  selector: 'ath001-login',
  templateUrl: './ath001-login.component.html',
  styleUrls: ['./ath001-login.component.scss']
})

export class Ath001LoginComponent {
  constructor(
    protected router: Router,
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private authAPI: AuthApiService,
    private cache: PsCache,
    private notification: PSKendoNotificationService,
    private config: PSGetConfigService,
  ) { }

  //#region life cycle
  private arrUnsubscribe: Subscription[] = [];

  ngOnInit() {
    // const token = this.config.GetToken();
    // var time = token ? PSDate.addHours(new Date(token.time_expired), -7) : null;
    // if (time && time > new Date()) {
    //   this.router.navigate(["/"]);
    // }

    if (!PSObject.isNullOfUndefined(window.caches))
      window.caches.keys().then(function (names) {
        for (let name of names)
          caches.delete(name);
      });

    this.onInitForm()

    var cacheuurl = this.cache.getItem(KeyLocalStorageEnum.OUT_URL);
    this.returnUrl = PSObject.isNullOfUndefined(cacheuurl) ? this.route.url : this.cache.parseValue(cacheuurl);
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
  public returnUrl: string = "/";
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
            this.router.navigate(['store'], { relativeTo: this.route });
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
  //#endregion
}
