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
  prepareRoute(outlet: RouterOutlet) {
    return outlet?.activatedRouteData?.['animation'];
  }

  ngAfterViewInit() {
    PSString.highlightRequiredLabels();
  }
}
