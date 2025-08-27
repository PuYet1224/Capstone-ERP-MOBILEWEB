import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { ResponseDTO } from "src/app/models/dtos/reponse.dto";
import { APIService } from "src/app/services/core/api.service";
import { AuthApiStaticService } from "./auth-api-static.service";

@Injectable({
  providedIn: 'root',
})

export class AuthApiService {
  constructor(
    private api: APIService,
  ) { }

  public GetHead() {
    let that = this;
    return new Observable<ResponseDTO>(obs => {
      that.api.post(AuthApiStaticService.GetHead).subscribe((res: ResponseDTO) => {
        obs.next(res);
        obs.complete();
      }, errors => {
        obs.error(errors);
        obs.complete();
      })
    });
  }
}
