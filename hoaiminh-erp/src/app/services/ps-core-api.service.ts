import { Injectable } from '@angular/core';
import { FileInfo } from '@progress/kendo-angular-upload';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { Observable } from 'rxjs';
import { ResponseDTO } from 'src/app/models/dtos/reponse.dto';
import { LSListTypeDataEnum } from 'src/app/models/enums/e-type/ls-list-type-data.enum';
import { LSStatusTypeDataEnum } from 'src/app/models/enums/e-type/ls-status-type-data.enum';
import { LSDistrictDTO } from '../models/dtos/e-dtos/ls-district.dto';
import { LSProvinceDTO } from '../models/dtos/e-dtos/ls-province.dto';
import { ReportInputDTO } from '../models/dtos/report-input.dto';
import { CSListTypeDataEnum } from '../models/enums/e-type/cs-list-type-data.enum';
import { HRListTypeDataEnum } from '../models/enums/e-type/hr-list-type-data.enum';
import { APIService } from './core/api.service';
import { CoreApiStaticService } from './core/ps-core-api-static.service';

@Injectable({
  providedIn: 'root',
})
export class PSCoreApiService {
  constructor(private api: APIService) { }

  GetListWarehouse(headnumber: number = null) {
    let that = this;
    return new Observable<ResponseDTO>((obs) => {
      that.api
        .post(CoreApiStaticService.GetListWarehouse, headnumber)
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
      that.api.post(CoreApiStaticService.GetListEmployee).subscribe(
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
      this.api.post(CoreApiStaticService.GetTemplate, JSON.stringify(format), false, null, 'response', 'blob')
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
      this.api.post(CoreApiStaticService.ExportExcel, JSON.stringify(param), false, null, 'response', 'blob')
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
      this.api.post(CoreApiStaticService.ExportExcelPDF, JSON.stringify(param), false, null, 'response', 'blob')
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
      that.api.post(CoreApiStaticService.GetListProvince).subscribe(
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
      that.api.post(CoreApiStaticService.GetListDistrict, param).subscribe(
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
      that.api.post(CoreApiStaticService.GetListWard, param).subscribe(
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
        .post(CoreApiStaticService.UploadImage, form, true)
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
      that.api.post(CoreApiStaticService.DeleteImage, param).subscribe(
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
      this.api.post(CoreApiStaticService.GetListLSList, param).subscribe(
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

  public GetListCSList(param: CSListTypeDataEnum) {
    let that = this;
    return new Observable<ResponseDTO>((obs) => {
      that.api.post(CoreApiStaticService.GetListCSList, param).subscribe(
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
      this.api.post(CoreApiStaticService.GetListStatus, param).subscribe(
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
      this.api.post(CoreApiStaticService.GetListHRList, param).subscribe(
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

  public GetListHead(IsAll: boolean = true): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(CoreApiStaticService.GetListHead, IsAll).subscribe(
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
      this.api.post(CoreApiStaticService.GetListSupplier, {}).subscribe(
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
      this.api.post(CoreApiStaticService.GetListPartnerCustomer, {}).subscribe(
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

  public GetListPartnerFinance(): Observable<ResponseDTO> {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(CoreApiStaticService.GetListPartnerFinance, {}).subscribe(
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
      this.api.post(CoreApiStaticService.GetListReport, filterData)
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
