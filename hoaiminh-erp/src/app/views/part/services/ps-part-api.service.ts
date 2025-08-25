import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WHInventoryMasterCusDTO } from '../../../models/dtos/e-dtos/wh-inventory-master.dto';
import { WHInventoryPointCusDTO } from '../../../models/dtos/e-dtos/wh-inventory-point.dto';
import { WHInventorySessionCusDTO } from '../../../models/dtos/e-dtos/wh-inventory-session.dto';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { UpdatePropertiesInterface } from 'src/app/models/dtos/update-properties.interface';
import { UpdateStatusInterface } from 'src/app/models/dtos/update-status.interface';
import { PSAPIService } from 'src/app/services/core/ps-api.service';
import { ResponseDTO } from 'src/app/models/dtos/reponse.dto';
import { PSPartApiStaticService } from './ps-part-api-static.service';
import { WHInventoryScanCusDTO } from '../../../models/dtos/e-dtos/wh-inventory-scan.dto';
import { WHIOMasterCusDTO } from '../../../models/dtos/e-dtos/wh-io-master.dto';
import { WHIODetailCusDTO } from '../../../models/dtos/e-dtos/wh-io-detail.dto';
import { LSTypeOfPartCusDTO } from '../../../models/dtos/e-dtos/ls-type-of-part.dto';
import { LSTypeOfPartSpecsDTO } from '../../../models/dtos/e-dtos/ls-type-of-part-specs.dto';
import { LSPartCategoryCusDTO } from '../../../models/dtos/e-dtos/ls-part-category.dto';
import { LSPartItemCusDTO, LSPartItemDTO } from '../../../models/dtos/e-dtos/ls-part-item.dto';
import { LSPartItemVehicleCusDTO } from '../../../models/dtos/e-dtos/ls-part-item-vehicle.dto';
import { LSTypeOfVehicleCusDTO } from '../../../models/dtos/e-dtos/ls-type-of-vehicle.dto';
import { PSGetConfigService } from 'src/app/services/core/ps-get-config.service';

@Injectable({
  providedIn: 'root',
})

export class PSPartApiService {
  private dll: string;
  constructor(
    private api: PSAPIService,
    private config: PSGetConfigService,
  ) {
    this.dll = config.GetDLL();
  }

  public GetListInventoryMaster(filter: State) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(
          PSPartApiStaticService[this.config.GetDLL()].GetListInventoryMaster,
          toDataSourceRequest(filter)
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

  public GetInventoryMaster(param: WHInventoryMasterCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].GetInventoryMaster, param).subscribe(
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

  public GetListInventoryPoint(param: WHInventoryMasterCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].GetListInventoryPoint, param)
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

  public GetInventoryPoint(param: WHInventoryPointCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].GetInventoryPoint, param).subscribe(
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

  public GetListInventorySession(param: WHInventoryPointCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].GetListInventorySession, param)
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

  public GetListSessionLocation(param: WHInventorySessionCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].GetListSessionLocation, param)
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

  public GetListSessionScanLocation(filter: State) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(
          PSPartApiStaticService[this.config.GetDLL()].GetListSessionScanLocation,
          toDataSourceRequest(filter)
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

  public GetListInventoryOnSession(filterState: State) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(
          PSPartApiStaticService[this.config.GetDLL()].GetListInventoryOnSession,
          toDataSourceRequest(filterState)
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

  public GetListInventoryPointStock(filterState: State) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(
          PSPartApiStaticService[this.config.GetDLL()].GetListInventoryPointStock,
          toDataSourceRequest(filterState)
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

  public UpdateInventorySession(param: WHInventorySessionCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].UpdateInventorySession, param)
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

  public UpdateAndCreateInventorySession(param: WHInventorySessionCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].UpdateAndCreateInventorySession, param)
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

  public UpdateInventoryMaster(
    param: UpdatePropertiesInterface<WHInventoryMasterCusDTO>
  ) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].UpdateInventoryMaster, param)
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

  public UpdateInventoryPoint(
    param: UpdatePropertiesInterface<WHInventoryPointCusDTO>
  ) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].UpdateInventoryPoint, param)
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

  public DeleteInventoryMaster(param: WHInventoryMasterCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].DeleteInventoryMaster, param)
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

  public UpdateInventoryMasterStatus(
    param: UpdateStatusInterface<WHInventoryMasterCusDTO>
  ) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].UpdateInventoryMasterStatus, param)
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

  public DeleteInventoryPoint(param: WHInventoryPointCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].DeleteInventoryPoint, param)
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

  public UpdateInventoryPointStatus(
    param: UpdateStatusInterface<WHInventoryPointCusDTO>
  ) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].UpdateInventoryPointStatus, param)
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

  public ImportInventoryStock(data: File, invPoint: number) {
    var form: FormData = new FormData();
    form.append('file', data);
    form.append('InventoryPoint', invPoint.toString());

    return new Observable<any>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].ImportInventoryStock, form, true)
        .subscribe(
          (res: any) => {
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

  public ImportInventoryScan(data: File, invPoint: number) {
    var form: FormData = new FormData();
    form.append('file', data);
    form.append('InventoryPoint', invPoint.toString());

    return new Observable<any>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].ImportInventoryScan, form, true)
        .subscribe(
          (res: any) => {
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

  public ExportInventorySummary(InventoryPoint: number) {
    var data = { InventoryPoint: InventoryPoint };

    return new Observable<any>((obs) => {
      this.api
        .post(
          PSPartApiStaticService[this.config.GetDLL()].ExportInventorySummary,
          JSON.stringify(data),
          false,
          false,
          'response',
          'blob'
        )
        .subscribe(
          (res: any) => {
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

  public ExportInventorySession(InventorySession: number) {
    var data = { InventorySession: InventorySession };
    return new Observable<any>((obs) => {
      this.api
        .post(
          PSPartApiStaticService[this.config.GetDLL()].ExportInventorySession,
          JSON.stringify(data),
          false,
          false,
          'response',
          'blob'
        )
        .subscribe(
          (res: any) => {
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

  public UpdateListInventoryStaff(param: WHInventoryPointCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].UpdateListInventoryStaff, param)
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

  public GetListPartItemError(param: WHInventorySessionCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].GetListPartItemError, param)
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

  public GetListPartItemErrorDetail(param: WHInventoryScanCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].GetListPartItemErrorDetail, param)
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

  public DeletePartItemScanByBarcode(param: WHInventoryScanCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].DeletePartItemScanByBarcode, param)
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

  public UpdateInventoryScan(
    param: UpdatePropertiesInterface<WHInventoryScanCusDTO>
  ) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].UpdateInventoryScan, param)
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

  public GetListIOMaster(filter: State) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(
          PSPartApiStaticService[this.config.GetDLL()].GetListIOMaster,
          toDataSourceRequest(filter)
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

  public GetIOMaster(param: WHIOMasterCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].GetIOMaster, param).subscribe(
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

  public UpdateIOMasterStatus(
    param: UpdateStatusInterface<WHIOMasterCusDTO>
  ): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].UpdateIOMasterStatus, param)
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

  public DeleteIOMaster(param: WHIOMasterCusDTO[]): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].DeleteIOMaster, param).subscribe(
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

  public GetListWarehouse(headId: number): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].GetListWarehouse, headId).subscribe(
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

  public UpdateIOMaster(
    param: UpdatePropertiesInterface<WHIOMasterCusDTO>
  ): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].UpdateIOMaster, param).subscribe(
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

  public GetListIODetail(filter: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(
          PSPartApiStaticService[this.config.GetDLL()].GetListIODetail,
          toDataSourceRequest(filter)
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

  public DeleteIODetail(params: WHIODetailCusDTO[]): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].DeleteIODetail, params).subscribe(
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

  public ImportIODetail(file: File, IOMaster: number) {
    var form: FormData = new FormData();
    form.append('file', file);
    form.append('IOMaster', IOMaster.toString());

    return new Observable<any>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].ImportIODetail, form, true).subscribe(
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

  public GetListPartItem(param: State, iomaster: number): Observable<ResponseDTO> {
    var temp = toDataSourceRequest(param);
    temp['IOMaster'] = iomaster
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].GetListPartItem, temp).subscribe(
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

  public UpdateIODetail(param: WHIODetailCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].UpdateIODetail, param).subscribe(
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

  public UpdateIOQuantity(param: WHIOMasterCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].UpdateIOQuantity, param).subscribe(
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

  public UpdateListIODetail(param: WHIODetailCusDTO[]): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].UpdateListIODetail, param).subscribe(
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
  public GetListPartCategory(filter: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        PSPartApiStaticService[this.config.GetDLL()].GetListPartCategory,
        toDataSourceRequest(filter)
      ).subscribe(
        (res: ResponseDTO) => { obs.next(res); obs.complete(); },
        (err) => { obs.error(err); obs.complete(); }
      );
    });
  }

  public DeletePartCategory(params: LSPartCategoryCusDTO[]): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        PSPartApiStaticService[this.config.GetDLL()].DeletePartCategory,
        params
      ).subscribe(
        (res: ResponseDTO) => { obs.next(res); obs.complete(); },
        (err) => { obs.error(err); obs.complete(); }
      );
    });
  }

  public UpdatePartCategory(
    param: UpdatePropertiesInterface<LSPartCategoryCusDTO>
  ): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        PSPartApiStaticService[this.config.GetDLL()].UpdatePartCategory,
        param
      ).subscribe(
        (res: ResponseDTO) => { obs.next(res); obs.complete(); },
        (err) => { obs.error(err); obs.complete(); }
      );
    });
  }
  public GetListTypeOfPart(filter: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        PSPartApiStaticService.type.GetListTypeOfPart,
        toDataSourceRequest(filter)
      ).subscribe(
        (res: ResponseDTO) => { obs.next(res); obs.complete(); },
        (err) => { obs.error(err); obs.complete(); }
      );
    });
  }

  public DeleteTypeOfPart(params: LSTypeOfPartCusDTO[]): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        PSPartApiStaticService.type.DeleteTypeOfPart,
        params
      ).subscribe(
        (res: ResponseDTO) => { obs.next(res); obs.complete(); },
        (err) => { obs.error(err); obs.complete(); }
      );
    });
  }

  public UpdateTypeOfPart(param: UpdatePropertiesInterface<LSTypeOfPartCusDTO>): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        PSPartApiStaticService.type.UpdateTypeOfPart,
        param
      ).subscribe(
        (res: ResponseDTO) => { obs.next(res); obs.complete(); },
        (err) => { obs.error(err); obs.complete(); }
      );
    });
  }

  public GetTypeOfPart(param: LSTypeOfPartCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        PSPartApiStaticService.type.GetTypeOfPart,
        param
      ).subscribe(
        (res: ResponseDTO) => { obs.next(res); obs.complete(); },
        (err) => { obs.error(err); obs.complete(); }
      );
    });
  }
  public GetListTypeOfPartSpecs(
    param: LSTypeOfPartCusDTO
  ): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        PSPartApiStaticService.type.GetListTypeOfPartSpecs,
        param
      ).subscribe(
        (res: ResponseDTO) => { obs.next(res); obs.complete(); },
        (err) => { obs.error(err); obs.complete(); }
      );
    });
  }

  public DeleteTypeOfPartSpecs(
    params: LSTypeOfPartSpecsDTO[]
  ): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        PSPartApiStaticService.type.DeleteTypeOfPartSpecs,
        params
      ).subscribe(
        (res: ResponseDTO) => { obs.next(res); obs.complete(); },
        (err) => { obs.error(err); obs.complete(); }
      );
    });
  }

  public UpdateTypeOfPartSpecs(
    param: UpdatePropertiesInterface<LSTypeOfPartSpecsDTO>
  ): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(
        PSPartApiStaticService.type.UpdateTypeOfPartSpecs,
        param
      ).subscribe(
        (res: ResponseDTO) => { obs.next(res); obs.complete(); },
        (err) => { obs.error(err); obs.complete(); }
      );
    });
  }

  public GetListVehicleForPartItem(): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].GetListVehicleForPartItem, {}).subscribe(
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

  public GetListPartItemConfig(filter: State) {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(
          PSPartApiStaticService[this.config.GetDLL()].GetListPartItemConfig,
          toDataSourceRequest(filter)
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
  public GetPartItemConfig(param: LSPartItemDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSPartApiStaticService[this.config.GetDLL()].GetPartItemConfig, param).subscribe(
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

  public GetListPartItemVehicle(param: State): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].GetListPartItemVehicle, toDataSourceRequest(param))
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
  public GetListTypeOfVehicle(parameter: boolean = true): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].GetListTypeOfVehicle, parameter)
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
  public GetListVehicle(param: LSTypeOfVehicleCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].GetListVehicle, param)
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
  public GetListVehicleColor(param: LSTypeOfVehicleCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].GetListVehicleColor, (param))
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

  public GetListPartItemImage(param: LSPartItemCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].GetListPartItemImage, param)
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

  public UpdatePartItem(
    param: UpdatePropertiesInterface<LSPartItemCusDTO>
  ): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].UpdatePartItem, param)
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

  public UpdatePartItemVehicle(param: LSPartItemVehicleCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].UpdatePartItemVehicle, param)
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

  public DeletePartItemVehicle(params: LSPartItemVehicleCusDTO): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api
        .post(PSPartApiStaticService[this.config.GetDLL()].DeletePartItemVehicle, params)
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
}
