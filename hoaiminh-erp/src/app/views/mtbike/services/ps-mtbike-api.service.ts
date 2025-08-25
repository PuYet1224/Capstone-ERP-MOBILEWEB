import { Injectable } from "@angular/core";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { Observable } from "rxjs";
import { ResponseDTO } from "src/app/models/dtos/reponse.dto";
import { PSAPIService } from "src/app/services/core/ps-api.service";
import { PSMtbikeApiStaticService } from "./ps-mtbike-api-static.service";
import { LSTypeOfVehicleCusDTO } from "../../../models/dtos/e-dtos/ls-type-of-vehicle.dto";
import { LSVehicleCusDTO } from "../../../models/dtos/e-dtos/ls-vehicle.dto";
import { UpdatePropertiesInterface } from "src/app/models/dtos/update-properties.interface";
import { SALOrderDetailCusDTO } from "src/app/models/dtos/e-dtos/sal-order-detail.dto";
import { CSLoyalCustomerCusDTO } from "src/app/models/dtos/e-dtos/cs-loyal-customer.dto";
import { UpdateStatusInterface } from "src/app/models/dtos/update-status.interface";
import { SALOrderMasterCusDTO } from "src/app/models/dtos/e-dtos/sal-order-master.dto";
import { PURDOMasterCusDTO } from "src/app/models/dtos/e-dtos/pur-do-master.dto";
import { PURDODetailCusDTO } from "src/app/models/dtos/e-dtos/pur-do-detail.dto";
import { WHIOMasterVehicleCusDTO } from "src/app/models/dtos/e-dtos/wh-io-master-vehicle.dto";
import { WHIODetailVehicleCusDTO } from "src/app/models/dtos/e-dtos/wh-io-detail-vehicle.dto";
import { LSVehicleColorCusDTO } from "src/app/models/dtos/e-dtos/ls-vehicle-color-cus.dto";
import { PSGetConfigService } from "src/app/services/core/ps-get-config.service";

@Injectable({
  providedIn: 'root',
})

export class PSMtbikeApiService {
  private dll: string;
  constructor(
    private api: PSAPIService,
    private config: PSGetConfigService,
  ) {
    this.dll = config.GetDLL();
  }

  public GetListSOMaster(filter: State, type: number, vehicle: number, color: number) {
    var param = toDataSourceRequest(filter);

    if (type != null && type != 0)
      param["TypeOfVehicle"] = type;

    if (vehicle != null && vehicle != 0)
      param["Vehicle"] = vehicle;

    if (color != null && color != 0)
      param["VehicleColor"] = color;

    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListSOMaster, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListRetail(filter: State) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListRetail, toDataSourceRequest(filter))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }
  public GetListIODetailVehicle(filter: State) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListIODetailVehicle, toDataSourceRequest(filter))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListTypeOfVehicle() {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListTypeOfVehicle)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListVehicle(params: LSTypeOfVehicleCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListVehicle, params)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListVehicleColor(params: LSVehicleCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListVehicleColor, params)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetSOMaster(params: SALOrderMasterCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetSOMaster, params)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetRetail(params: SALOrderDetailCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetRetail, params)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetSeri(filter: SALOrderDetailCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetSeri, filter)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetCustomer(param: SALOrderMasterCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetCustomer, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }
  public GetIOMasterVehicle(param: WHIOMasterVehicleCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetIOMasterVehicle, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSORetailDetail(param: UpdatePropertiesInterface<SALOrderDetailCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateSORetailDetail, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListCustomer() {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListCustomer)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateLoyalCustomer(param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateLoyalCustomer, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateIOMasterVehicle(param: UpdatePropertiesInterface<WHIOMasterVehicleCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateIOMasterVehicle, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSOMaster(param: UpdatePropertiesInterface<SALOrderMasterCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateSOMaster, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSODetail(param: SALOrderDetailCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].wholesale.UpdateSODetail, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteSOMaster(param: SALOrderMasterCusDTO[]) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].DeleteSOMaster, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteSODetail(param: SALOrderDetailCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].wholesale.DeleteSODetail, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSOMasterStatus(param: UpdateStatusInterface<SALOrderMasterCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateSOMasterStatus, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSODetail(param: State) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].wholesale.GetListSODetail, toDataSourceRequest(param))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }
  public GetListIOMasterVehicle(param: State) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListIOMasterVehicle, toDataSourceRequest(param))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListDOMaster(filter: State) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListDOMaster, toDataSourceRequest(filter))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteDOMaster(p: PURDOMasterCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].DeleteDOMaster, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetDOMaster(p: PURDOMasterCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetDOMaster, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateDOMaster(param: UpdatePropertiesInterface<PURDOMasterCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateDOMaster, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateDOMasterStatus(param: UpdateStatusInterface<PURDOMasterCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateDOMasterStatus, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateIOMasterVehicleStatus(param: UpdateStatusInterface<WHIOMasterVehicleCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateIOMasterVehicleStatus, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListDODetail(p: PURDOMasterCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListDODetail, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListStockVehicleColor(params: LSVehicleColorCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListStockVehicleColor, params)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListDO() {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListDO)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }
  public GetIOSeri(param: WHIODetailVehicleCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetIOSeri, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }
  public GetIOSeriInternal(param: WHIODetailVehicleCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetIOSeriInternal, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteDODetail(p: PURDODetailCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].DeleteDODetail, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteIOMasterVehicle(p: WHIOMasterVehicleCusDTO[]) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].DeleteIOMasterVehicle, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteIODetailVehicle(p: WHIODetailVehicleCusDTO[]) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].DeleteIODetailVehicle, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateDODetail(p: PURDODetailCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateDODetail, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateIODetailVehicle(p: WHIODetailVehicleCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateIODetailVehicle, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public ImportDODetail(data: File, DO: number) {
    var form: FormData = new FormData();
    form.append('file', data);
    form.append('DOMaster', DO.toString());

    return new Observable<any>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].ImportDODetail, form, true).subscribe(
        (res: any) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListColor() {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListColor)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListVehicleConfig(filter: State, type: number = null, color: string = null): Observable<ResponseDTO> {
    var param = toDataSourceRequest(filter);

    if (type != null)
      param['TypeOfVehicle'] = type;

    if (color != null)
      param['ColorName'] = color;

    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListVehicleConfig, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListPartCategory(filter: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListPartCategory, toDataSourceRequest(filter))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteTypeOfVehicle(p: LSTypeOfVehicleCusDTO[]): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].DeleteTypeOfVehicle, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteVehicle(p: LSVehicleCusDTO[]): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].DeleteVehicle, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteVehicleColor(p: LSVehicleColorCusDTO[]): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].DeleteVehicleColor, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListVehicleColorCodeImage() {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListVehicleColorCodeImage)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListVehicleSettingImage() {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].GetListVehicleSettingImage)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateTypeOfVehicle(p: LSTypeOfVehicleCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateTypeOfVehicle, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateVehicle(p: LSVehicleCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateVehicle, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateVehicleColor(p: LSVehicleColorCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSMtbikeApiStaticService[this.config.GetDLL()].UpdateVehicleColor, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }
}
