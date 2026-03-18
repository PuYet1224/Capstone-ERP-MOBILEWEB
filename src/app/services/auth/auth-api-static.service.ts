import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: 'root'
})

export class AuthApiStaticService {
  public static token: string = environment.identityServer + '/connect/token';
  public static getuserinfo: string = environment.identityServer + '/identity/getuserinfo';
}
