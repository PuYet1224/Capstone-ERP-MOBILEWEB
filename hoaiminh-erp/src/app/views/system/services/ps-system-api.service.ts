import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { State, toDataSourceRequest } from '@progress/kendo-data-query';
import { PSAPIService } from 'src/app/services/core/ps-api.service';
import { PsSystemApiStaticService } from './ps-system-api-static.service';
import { ResponseDTO } from 'src/app/models/dtos/reponse.dto';
import { LSHeadCusDTO } from 'src/app/models/dtos/e-dtos/ls-head.dto';
import { PSGetConfigService } from 'src/app/services/core/ps-get-config.service';
import { LSHeadTransferCusDTO } from 'src/app/models/dtos/e-dtos/ls-head-transfer.dto';

@Injectable({
  providedIn: 'root',
})

export class PSSystemApiService {
  private dll: string;
  constructor(
    private api: PSAPIService,
    private config: PSGetConfigService,
  ) {
    this.dll = config.GetDLL();
  }

  public GetListStoreMapImage() {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PsSystemApiStaticService[this.config.GetDLL()].GetListStoreMapImage)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListStore(param: State) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PsSystemApiStaticService[this.config.GetDLL()].GetListStore, toDataSourceRequest(param))
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListStoreTypeData() {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PsSystemApiStaticService[this.config.GetDLL()].GetListStoreTypeData)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateStore(param: LSHeadCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PsSystemApiStaticService[this.config.GetDLL()].UpdateStore, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListStoreManagement(param: LSHeadCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PsSystemApiStaticService[this.config.GetDLL()].GetListStoreManagement, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public DeleteStore(param: LSHeadCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PsSystemApiStaticService[this.config.GetDLL()].DeleteStore, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public GetListStoreTransfer(param: LSHeadCusDTO) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PsSystemApiStaticService[this.config.GetDLL()].GetListStoreTransfer, param)
        .subscribe((res: ResponseDTO) => {
          obs.next(res);
          obs.complete();
        }, (errors) => {
          obs.error(errors);
          obs.complete();
        });
    });
  }

  public UpdateListStoreTransfer(param: Array<LSHeadTransferCusDTO>) {
    return new Observable<ResponseDTO>((obs) => {
      this.api.post(PsSystemApiStaticService[this.config.GetDLL()].UpdateListStoreTransfer, param)
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
