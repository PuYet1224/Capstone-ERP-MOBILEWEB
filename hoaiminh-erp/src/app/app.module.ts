import { NgModule, CUSTOM_ELEMENTS_SCHEMA, APP_INITIALIZER } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { ICON_SETTINGS, IconModule } from '@progress/kendo-angular-icons';
import { ScrollViewModule } from '@progress/kendo-angular-scrollview';
import { AppRouting } from './app.routing';
import { AppComponent } from './app.component';
import { PSLayoutModule } from './components/ps-layout/ps-layout.module';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LabelModule } from '@progress/kendo-angular-label';
import { PSButtonModule } from './components/ps-button/ps-button.module';
import { NotificationModule } from '@progress/kendo-angular-notification';
import { PopupModule } from '@progress/kendo-angular-popup';
import { PS_AuthInterceptorService } from './services/auth/auth.service.interceptor';
import { LoaderModule } from '@progress/kendo-angular-indicators';
import { SubLayoutComponent } from './layouts/sub-layout/sub-layout.component';
import { ChartsModule } from '@progress/kendo-angular-charts';
import 'hammerjs';
import { PSDropdownModule } from './components/ps-dropdown/ps-dropdown.module';



@NgModule({
  imports: [
    BrowserAnimationsModule,
    HttpClientModule,
    RouterModule,
    AppRouting,
    CommonModule,
    LayoutModule,
    ButtonsModule,
    IconModule,
    ScrollViewModule,
    PSLayoutModule,
    InputsModule,
    FormsModule,
    LabelModule,
    PSButtonModule,
    IconModule,
    ReactiveFormsModule,
    NotificationModule,
    PopupModule,
    LoaderModule,
    ChartsModule,
    PSDropdownModule
  ],
  declarations: [
    AppComponent,
    MainLayoutComponent,
    SubLayoutComponent,
    AuthLayoutComponent,
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
