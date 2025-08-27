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
import 'hammerjs';

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
  ],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }
