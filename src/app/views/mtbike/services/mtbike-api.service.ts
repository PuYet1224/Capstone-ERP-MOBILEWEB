import { Injectable } from "@angular/core";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { Observable } from "rxjs";
import { DashboardInputDTO } from "src/app/models/dtos/dashboard-input.dto";
import { CSLoyalCustomerCusDTO } from "src/app/models/dtos/e-dtos/cs-loyal-customer.dto";
import { CSVehicleCusDTO } from "src/app/models/dtos/e-dtos/cs-vehicle.dto";
import { CSWorkOrderMasterCusDTO } from "src/app/models/dtos/e-dtos/cs-work-order-master.dto";
import { CSWorkOrderTaskCusDTO } from "src/app/models/dtos/e-dtos/cs-work-order-task.dto";
import { LSPartCategoryCusDTO } from "src/app/models/dtos/e-dtos/ls-part-category.dto";
import { LSTypeOfPartCusDTO } from "src/app/models/dtos/e-dtos/ls-type-of-part.dto";
import { LSVehicleColorCusDTO } from "src/app/models/dtos/e-dtos/ls-vehicle-color.dto";
import { PURDODetailCusDTO } from "src/app/models/dtos/e-dtos/pur-do-detail.dto";
import { PURDOMasterCusDTO } from "src/app/models/dtos/e-dtos/pur-do-master.dto";
import { SALOrderDetailPartItemCusDTO } from "src/app/models/dtos/e-dtos/sal-order-detail-part-item.dto";
import { SALOrderDetailPromotionCusDTO } from "src/app/models/dtos/e-dtos/sal-order-detail-promotion.dto";
import { SALOrderDetailServiceCusDTO } from "src/app/models/dtos/e-dtos/sal-order-detail-service.dto";
import { SALOrderDetailCusDTO } from "src/app/models/dtos/e-dtos/sal-order-detail.dto";
import { SALOrderInvoiceDetailCusDTO } from "src/app/models/dtos/e-dtos/sal-order-invoice-detail.dto";
import { SALOrderInvoiceCusDTO } from "src/app/models/dtos/e-dtos/sal-order-invoice.dto";
import { SALOrderMasterCusDTO } from "src/app/models/dtos/e-dtos/sal-order-master.dto";
import { SALOrderReceiptDetailCusDTO } from "src/app/models/dtos/e-dtos/sal-order-receipt-detail.dto";
import { SALOrderReceiptCusDTO } from "src/app/models/dtos/e-dtos/sal-order-receipt.dto";
import { WHIODetailVehicleCusDTO } from "src/app/models/dtos/e-dtos/wh-io-detail-vehicle.dto";
import { WHIOMasterVehicleCusDTO } from "src/app/models/dtos/e-dtos/wh-io-master-vehicle.dto";
import { ParameterDTO } from "src/app/models/dtos/parameter.dto";
import { ResponseDTO } from "src/app/models/dtos/reponse.dto";
import { UpdatePropertiesInterface } from "src/app/models/dtos/update-properties.interface";
import { UpdateStatusInterface } from "src/app/models/dtos/update-status.interface";
import { CSListTypeDataEnum } from "src/app/models/enums/e-type/cs-list-type-data.enum";
import { APIService } from "src/app/services/core/api.service";
import { GetConfigService } from "src/app/services/core/ps-get-config.service";
import { LSTypeOfVehicleCusDTO } from "../../../models/dtos/e-dtos/ls-type-of-vehicle.dto";
import { LSVehicleCusDTO } from "../../../models/dtos/e-dtos/ls-vehicle.dto";
import { POLSalesPolicyCusDTO } from "src/app/models/dtos/e-dtos/pol-sales-policy.dto";
import { MtbikeApiStaticService } from "./mtbike-api-static.service";

@Injectable({
  providedIn: 'root',
})

export class MtbikeApiService {
  private dll: string;
  constructor(
    private api: APIService,
    private config: GetConfigService,
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListSOMaster, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListRetail, toDataSourceRequest(filter))
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListIODetailVehicle, toDataSourceRequest(filter))
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
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListTypeOfVehicle
      )
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListTypeOfVehicleCategory(param: LSPartCategoryCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListTypeOfVehicleCategory, param
      )
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
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListVehicle, params)
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
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListVehicleColor, params)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetSOMaster, params)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetRetail, params)
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
      const ns = MtbikeApiStaticService.getNamespace(this.config.GetDLL());
      this.api.post(ns.GetSeri, filter)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetCustomer(param: CSLoyalCustomerCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetCustomer, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetIOMasterVehicle, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].UpdateSORetailDetail, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListCustomer)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateWOMCustomer(param: UpdatePropertiesInterface<CSLoyalCustomerCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateWOMCustomer, param)
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
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateLoyalCustomer, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].UpdateIOMasterVehicle, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].UpdateSOMaster, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].wholesale.UpdateSODetail, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].DeleteSOMaster, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].wholesale.DeleteSODetail, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].UpdateSOMasterStatus, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].wholesale.GetListSODetail, toDataSourceRequest(param))
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListIOMasterVehicle, toDataSourceRequest(param))
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListDOMaster, toDataSourceRequest(filter))
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].DeleteDOMaster, p)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetDOMaster, p)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].UpdateDOMaster, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].UpdateDOMasterStatus, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].UpdateIOMasterVehicleStatus, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListDODetail, p)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListStockVehicleColor, params)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListDO)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetIOSeri, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetIOSeriInternal, param)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].DeleteDODetail, p)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].DeleteIOMasterVehicle, p)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].DeleteIODetailVehicle, p)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].UpdateDODetail, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateWOTask(DTO: CSWorkOrderTaskCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateWOTask, { DTO })
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteWOTask(DTO: CSWorkOrderTaskCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).DeleteWOTask, { DTO })
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].UpdateIODetailVehicle, p)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].ImportDODetail, form, true).subscribe(
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListColor)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListVehicleConfig, param)
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
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListPartCategory, toDataSourceRequest(filter))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALVehicle(param: State & { Master: number }): Observable<ResponseDTO> {
    const stateRequest = toDataSourceRequest(param);

    const payload = {
      ...stateRequest,
      Master: param.Master
    };

    return this.api.post(
      MtbikeApiStaticService
        .getNamespace(this.config.GetDLL())
        .GetListSALVehicle,
      payload
    );
  }

  public GetListSALVehicleParts(param: SALOrderDetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALVehicleParts, param
      ).subscribe(
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

  public GetListSALPartVehicle(param: SALOrderDetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALPartVehicle, param
      ).subscribe(
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

  public GetListSALPartCategory(param: SALOrderDetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALPartCategory, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALTypeOfPart(param: { OrderDetail: SALOrderDetailCusDTO; Category: LSPartCategoryCusDTO }): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALTypeOfPart, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALTypeOfPartSpecs(param: { OrderDetail: SALOrderDetailCusDTO; TypeOfPart: LSTypeOfPartCusDTO }): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALTypeOfPartSpecs, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSALPartItem(param: SALOrderDetailPartItemCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateSALPartItem, param)
        .subscribe(
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

  public DeleteSALPartItem(param: SALOrderDetailPartItemCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).DeleteSALPartItem, param)
        .subscribe(
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

  public DeleteTypeOfVehicle(p: LSTypeOfVehicleCusDTO[]): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].DeleteTypeOfVehicle, p)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].DeleteVehicle, p)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].DeleteVehicleColor, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteWOMConsultant(p: CSWorkOrderMasterCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).DeleteWOMConsultant, p)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListVehicleColorCodeImage)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].GetListVehicleSettingImage)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].UpdateTypeOfVehicle, p)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].UpdateVehicle, p)
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
      this.api.post(MtbikeApiStaticService[this.config.GetDLL()].UpdateVehicleColor, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetSALPayment(param: { Code: number }): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetSALPayment, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSALDetail(p: SALOrderDetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateSALDetail, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteSALDetail(p: SALOrderDetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).DeleteSALDetail, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListVehicleOptions(): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListVehicleOptions)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListStockForOrder(p: SALOrderDetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListStockForOrder, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALCompareVehicleSpecs(p: SALOrderMasterCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALCompareVehicleSpecs, p)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetMotorbikeOverview(param: ParameterDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetMotorbikeOverview,
        param
      )
        .subscribe(
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
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListDashboard,
        param
      ).subscribe(
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

  public GetWOMVehicle(param: CSWorkOrderMasterCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetWOMVehicle,
        param
      ).subscribe(
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

  public GetListWOMCustomer(param: CSWorkOrderMasterCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListWOMCustomer,
        param
      ).subscribe(
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

  public GetListWOTask(DTO: CSWorkOrderMasterCusDTO, IsNewTask: boolean): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListWOTask,
        { DTO, IsNewTask }
      ).subscribe(
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

  public GetWOMConsultant(DTO: CSWorkOrderMasterCusDTO, IsAllData: boolean): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetWOMConsultant,
        { DTO, IsAllData }
      ).subscribe(
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

  public GetListServiceMaster(): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListServiceMaster
      ).subscribe(
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

  public GetListTypeOfPart(param: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListTypeOfPart, toDataSourceRequest(param)
      ).subscribe(
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

  public GetListTypeOfPartSpecs(param: LSTypeOfPartCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListTypeOfPartSpecs, param
      ).subscribe(
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

  public GetListCSList(param: CSListTypeDataEnum.FUEL): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListCSList, param
      ).subscribe(
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

  public GetListSALSelectedVehicle(param: SALOrderMasterCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALSelectedVehicle, param
      ).subscribe(
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

  public GetListSALSelectedWH(param: SALOrderMasterCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALSelectedWH, param
      ).subscribe(
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

  public AddSALSelectedVehicles(param: LSVehicleColorCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).AddSALSelectedVehicles, param
      ).subscribe(
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

  public DeleteSALSelectedVehicles(param: LSVehicleColorCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).DeleteSALSelectedVehicles, param
      ).subscribe(
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

  public UpdateSALSelectedVehicleLock(param: LSVehicleColorCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateSALSelectedVehicleLock, param
      ).subscribe(
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

  public GetSALMaster(param: SALOrderMasterCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetSALMaster, param
      ).subscribe(
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

  public GetSALCustomer(param: SALOrderMasterCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetSALCustomer, param
      ).subscribe(
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

  public GetListWOMConsultant(param: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListWOMConsultant, toDataSourceRequest(param))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALMaster(param: any): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      const payload = { ...toDataSourceRequest(param), isExcludeInstallment: param.isExcludeInstallment };
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALMaster, payload)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALCollection(param: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALCollection, toDataSourceRequest(param))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALPayment(param: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALPayment, toDataSourceRequest(param))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALInvoice(param: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALInvoice, toDataSourceRequest(param))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALReceipt(param: any): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      const payload = { ...toDataSourceRequest(param), isExcludeInstallment: param.isExcludeInstallment };
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALReceipt, payload)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetSALReceipt(param: SALOrderReceiptCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetSALReceipt, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSALReceipt(param: SALOrderReceiptCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateSALReceipt, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSALReceiptStatus(param: SALOrderReceiptCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateSALReceiptStatus, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSALReceiptDetail(param: SALOrderReceiptDetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateSALReceiptDetail, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALOrderItem(param: SALOrderInvoiceCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALOrderItem, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetSALInvoice(param: SALOrderInvoiceCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetSALInvoice, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALTypeItem(param: SALOrderInvoiceCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALTypeItem, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALInvoiceDetail(param: SALOrderInvoiceCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALInvoiceDetail, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListTaskBank(param: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListTaskBank, toDataSourceRequest(param))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSALMaster(param: UpdatePropertiesInterface<SALOrderMasterCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      const ns = MtbikeApiStaticService.getNamespace(this.config.GetDLL());
      this.api.post(ns.UpdateSALMaster, param)
        .subscribe(
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

  public UpdateSALInvoice(param: UpdatePropertiesInterface<SALOrderInvoiceCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      const ns = MtbikeApiStaticService.getNamespace(this.config.GetDLL());
      this.api.post(ns.UpdateSALInvoice, param)
        .subscribe(
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

  public ExportSALInvoicePdf(param: any) {
    return new Observable<ResponseDTO>((obs) => {
      const ns = MtbikeApiStaticService.getNamespace(this.config.GetDLL());
      this.api.post(ns.ExportSALInvoicePdf, param)
        .subscribe(
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

  public UpdateWOMVehicle(param: UpdatePropertiesInterface<CSVehicleCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      const ns = MtbikeApiStaticService.getNamespace(this.config.GetDLL());
      this.api.post(ns.UpdateWOMVehicle, param)
        .subscribe(
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

  public UpdateWOMConsultant(DTO: UpdatePropertiesInterface<CSWorkOrderMasterCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      const ns = MtbikeApiStaticService.getNamespace(this.config.GetDLL());
      this.api.post(ns.UpdateWOMConsultant, DTO)
        .subscribe(
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

  public UpdateSALInvoiceInfo(DTO: UpdatePropertiesInterface<SALOrderInvoiceCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      const ns = MtbikeApiStaticService.getNamespace(this.config.GetDLL());
      this.api.post(ns.UpdateSALInvoiceInfo, DTO)
        .subscribe(
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

  public UpdateSALStatus(param: UpdateStatusInterface<SALOrderMasterCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateSALStatus, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSALMasterStatus(param: UpdateStatusInterface<SALOrderMasterCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      const url = MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateSALMasterStatus;
      this.api.post(url, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALWarehouse(param: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALWarehouse, toDataSourceRequest(param))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetSALWarehouse(param: SALOrderDetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetSALWarehouse, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSALWarehouse(param: SALOrderDetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateSALWarehouse, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListVehicleReceipt(param: { OrderMaster: number, OrderReceipt: number }): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListVehicleReceipt, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALService(param: SALOrderDetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALService, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetConsutantOrderDetail(param: SALOrderDetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetConsutantOrderDetail, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALServiceGroup(param: SALOrderMasterCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALServiceGroup, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSALService(param: { IsGroup: boolean, DTO: SALOrderDetailServiceCusDTO, ListDTO: SALOrderDetailServiceCusDTO[] }): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateSALService, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALPromotion(param: SALOrderDetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALPromotion, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSALPromotion(param: SALOrderDetailPromotionCusDTO | SALOrderDetailPromotionCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateSALPromotion, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALPromotionGroup(param: SALOrderMasterCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALPromotionGroup, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListSALPolicy(param: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).GetListSALPolicy, toDataSourceRequest(param))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateSALPolicy(p: POLSalesPolicyCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(MtbikeApiStaticService.getNamespace(this.config.GetDLL()).UpdateSALPolicy, p)
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
