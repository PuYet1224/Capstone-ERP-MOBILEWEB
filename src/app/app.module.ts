import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { ICON_SETTINGS, IconModule } from '@progress/kendo-angular-icons';
import { ScrollViewModule } from '@progress/kendo-angular-scrollview';
import { AppRouting } from './app.routing';
import { AppComponent } from './app.component';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LabelModule } from '@progress/kendo-angular-label';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { PS_AuthInterceptorService } from './services/auth/auth.service.interceptor';
import { LoaderModule, IndicatorsModule } from '@progress/kendo-angular-indicators'
import 'hammerjs';
import * as Hammer from 'hammerjs';
import { LucideAngularModule } from 'lucide-angular';
import { HAMMER_GESTURE_CONFIG, HammerGestureConfig, HammerModule } from '@angular/platform-browser';

export class MyHammerConfig extends HammerGestureConfig {
  override overrides = {
    swipe: { direction: Hammer.DIRECTION_ALL }, // Cho phép vuốt 4 hướng
  };
}

@NgModule({
  imports: [
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    AppRouting,
    CommonModule,
    ButtonsModule,
    IconModule,
    ScrollViewModule,
    InputsModule,
    FormsModule,
    LabelModule,
    IconModule,
    ReactiveFormsModule,
    NotificationModule,
    PopupModule,
    LoaderModule,
    IndicatorsModule,
    LucideAngularModule,
    HammerModule
  ],
  declarations: [
    AppComponent
  ],
  providers: [
    {
      provide: ICON_SETTINGS,
      useValue: {
        type: 'font'
      }
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: PS_AuthInterceptorService,
      multi: true
    },
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig, // ✅ cấu hình swipe
    },
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
