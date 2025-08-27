import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResponseDTO } from 'src/app/models/dtos/reponse.dto';
import { PSAPIService } from './core/api.service';
import { PSCoreApiStaticService } from './ps-core-api-static.service';
import { LSDistrictDTO } from '../models/dtos/e-dtos/ls-district.dto';
import { LSProvinceDTO } from '../models/dtos/e-dtos/ls-province.dto';
import { FileInfo } from '@progress/kendo-angular-upload';
import { LSStatusTypeDataEnum } from 'src/app/models/enums/e-type/ls-status-type-data.enum';
import { LSListTypeDataEnum } from 'src/app/models/enums/e-type/ls-list-type-data.enum';
import { HRListTypeDataEnum } from '../models/enums/e-type/hr-list-type-data.enum';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { DashboardInputDTO } from '../models/dtos/dashboard-input.dto';
import { ReportInputDTO } from '../models/dtos/report-input.dto';

@Injectable({
  providedIn: 'root',
})
export class PSCoreApiService {
  constructor(private api: PSAPIService) { }

  GetListWarehouse(headnumber: number = null) {
    let that = this;
    return new Observable<ResponseDTO>((obs) => {
      that.api
        .post(PSCoreApiStaticService.GetListWarehouse, headnumber)
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

  GetListEmployee() {
    let that = this;
    return new Observable<ResponseDTO>((obs) => {
      that.api.post(PSCoreApiStaticService.GetListEmployee).subscribe(
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

  public GetTemplate(filename: string) {
    var format = { Template: filename }

    return new Observable<any>((obs) => {
      this.api.post(PSCoreApiStaticService.GetTemplate, JSON.stringify(format), false, null, 'response', 'blob')
        .subscribe((res: any) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public ExportExcel(param: ReportInputDTO) {
    return new Observable<any>((obs) => {
      this.api.post(PSCoreApiStaticService.ExportExcel, JSON.stringify(param), false, null, 'response', 'blob')
        .subscribe((res: any) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public ExportExcelPDF(param: ReportInputDTO) {
    return new Observable<any>((obs) => {
      this.api.post(PSCoreApiStaticService.ExportExcelPDF, JSON.stringify(param), false, null, 'response', 'blob')
        .subscribe((res: any) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  GetListProvince() {
    let that = this;
    return new Observable<ResponseDTO>((obs) => {
      that.api.post(PSCoreApiStaticService.GetListProvince).subscribe(
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

  GetListDistrict(param: LSProvinceDTO) {
    let that = this;
    return new Observable<ResponseDTO>((obs) => {
      that.api.post(PSCoreApiStaticService.GetListDistrict, param).subscribe(
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

  GetListWard(param: LSDistrictDTO) {
    let that = this;
    return new Observable<ResponseDTO>((obs) => {
      that.api.post(PSCoreApiStaticService.GetListWard, param).subscribe(
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

  public UploadImage(keypath: string, data: Array<FileInfo>) {
    var form: FormData = new FormData();

    data.forEach(f => {
      form.append('file', f.rawFile);
    })
    form.append('KeyPath', keypath.toString());

    return new Observable<any>((obs) => {
      this.api
        .post(PSCoreApiStaticService.UploadImage, form, true)
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

  public DeleteImage(param: string[]) {
    let that = this;
    return new Observable<ResponseDTO>((obs) => {
      that.api.post(PSCoreApiStaticService.DeleteImage, param).subscribe(
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

  public GetListLSList(param: LSListTypeDataEnum): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSCoreApiStaticService.GetListLSList, param).subscribe(
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

  public GetListStatus(param: LSStatusTypeDataEnum): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSCoreApiStaticService.GetListStatus, param).subscribe(
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

  public GetListHRList(param: HRListTypeDataEnum): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSCoreApiStaticService.GetListHRList, param).subscribe(
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

  public GetListHead(IsAll: boolean = false): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSCoreApiStaticService.GetListHead, IsAll).subscribe(
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

  public GetListSupplier(): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSCoreApiStaticService.GetListSupplier, {}).subscribe(
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

  public GetListPartnerCustomer(): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSCoreApiStaticService.GetListPartnerCustomer, {}).subscribe(
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

  public GetListReport(filter: State, dll: string) {
    var filterData = toDataSourceRequest(filter);
    filterData['DLLPackage'] = dll;
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PSCoreApiStaticService.GetListReport, filterData)
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
