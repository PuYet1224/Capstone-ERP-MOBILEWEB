import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { SystemService } from '../views/system/services/system.service';

@Injectable({
  providedIn: 'root'
})

export class AuthGuard implements CanActivate {
  constructor(private authService: SystemService) { }

  canActivate(): Promise<boolean> | boolean {
    return this.authService.isLoggedIn().then((login) => {
      if (login) {
        return true;
      } else {
        this.authService.logout();
        return false;
      }
    });
  }
}
