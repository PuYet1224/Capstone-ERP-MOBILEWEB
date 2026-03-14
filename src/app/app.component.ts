import { animate, query, style, transition, trigger } from '@angular/animations';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PsString } from './services/utilities/ps-string';
import { SystemApiService } from './views/system/services/system-api.service';
import { SystemLoaderService } from './views/system/services/system-loader.service';
import { SystemService } from './views/system/services/system.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter, :leave', [
          style({ position: 'absolute', width: '100%' })
        ], { optional: true }),
        query(':enter', [
          style({ opacity: 0 })
        ], { optional: true }),
        query(':leave', [
          animate('300ms ease', style({ opacity: 0.5 }))
        ], { optional: true }),
        query(':enter', [
          animate('300ms ease', style({ opacity: 1 }))
        ], { optional: true })
      ])
    ])
  ]
})
export class AppComponent {
  constructor(
    public subLoader: SystemLoaderService,
    public api: SystemApiService,
    private authService: SystemService
  ) {
    this.subLoader.loader$.subscribe(val => {
      setTimeout(() => this.showLoader = val);
    });
    this.startAuthCheck();
  }

  showLoader = false;
  private authSub: Subscription;

  startAuthCheck() {
    this.authSub = interval(30000).subscribe(() => { // Check every 30 seconds
      this.authService.isLoggedIn().then(isLoggedIn => {
        if (!isLoggedIn) {
          this.authService.logout();
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  ngAfterViewInit() {
    PsString.highlightRequiredLabels();
  }
}
