import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.dev';

@Injectable({
  providedIn: 'root',
})
export class AuthApiStaticService {
  public static GetHead: string = environment.apiServer + '/api/admin/GetHead';
}