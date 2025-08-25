import { Injectable } from "@angular/core";
import { DashboardInputDTO } from "src/app/models/dtos/dashboard-input.dto";
import { PSAPIService } from "src/app/services/core/ps-api.service";
import { ResponseDTO } from 'src/app/models/dtos/reponse.dto';
import { Observable } from 'rxjs';
import { PSDashboardApiStaticService } from "./ps-dashboard-api-static.service";
import { ParameterDTO } from "src/app/models/dtos/parameter.dto";
import { PSGetConfigService } from "src/app/services/core/ps-get-config.service";

@Injectable({
  providedIn: 'root',
})

export class PsDashboardApiService {
  constructor(
    private api: PSAPIService,
    private config: PSGetConfigService
  ) { }


  public GetMotorbikeOverview(param: ParameterDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSDashboardApiStaticService[this.config.GetDLL()].GetMotorbikeOverview, param).subscribe(
        (res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        },
        (errors) => {
          obs.error(errors);
          obs.complete();
        }
      );
    });
  }
  public GetListDashboard(param: DashboardInputDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSDashboardApiStaticService[this.config.GetDLL()].GetListDashboard, param).subscribe(
        (res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        },
        (errors) => {
          obs.error(errors);
          obs.complete();
        }
      );
    });
  }
}
