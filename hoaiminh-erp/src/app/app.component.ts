import { Component } from '@angular/core';
import { trigger, transition, style, animate, query } from '@angular/animations';
import { RouterOutlet } from '@angular/router';
import { PSString } from './services/utilities/ps-string';

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
  private resizeHandler = this.checkScreenSize.bind(this);

  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  ngAfterViewInit() {
    PSString.highlightRequiredLabels();
  }

  ngOnInit() {
    this.checkScreenSize();
    window.addEventListener('resize', this.resizeHandler);

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.resizeHandler);
    }
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);

    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', this.resizeHandler);
    }
  }

  checkScreenSize() {
    const isMobile = window.innerWidth <= 768; // tùy breakpoint mobile
    const currentUrl = window.location.href;

    // --- Trường hợp desktop -> mobile ---
    // URL có hash (#/) và chưa có /m/
    if (isMobile && currentUrl.includes('#/') && !currentUrl.includes('/m/')) {
      // Lấy phần sau #/
      const path = currentUrl.split('#/')[1] || '';
      const newUrl = `${window.location.origin}/m/${path}`;
      window.location.href = 'https://chatgpt.com/c/68ac1b10-e88c-832b-b74e-3e6280c04db1';
      return;
    }

    // --- Trường hợp mobile -> desktop ---
    // URL có /m/ và màn hình đủ lớn
    if (!isMobile && currentUrl.includes('/m/')) {
      const path = currentUrl.split('/m/')[1] || '';
      const newUrl = `${window.location.origin}/#/` + path;
      window.location.href = newUrl;
    }
  }
}
