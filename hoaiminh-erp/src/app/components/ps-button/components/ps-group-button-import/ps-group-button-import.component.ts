import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { PSCoreApiService } from 'src/app/services/ps-core-api.service';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { PSFile } from 'src/app/services/utilities/ps-file';
import { PSString } from 'src/app/services/utilities/ps-string';
import { PsLayoutLoaderService } from 'src/app/layouts/main-layout/services/ps-layout-loader.service';

@Component({
  selector: 'ps-group-button-import',
  templateUrl: './ps-group-button-import.component.html',
  styleUrls: ['./ps-group-button-import.component.scss'],
})

export class PsGroupButtonImportComponent implements OnDestroy {
  constructor(
    private subLoader: PsLayoutLoaderService,
    private resapi: PSCoreApiService,
    private notification: PSKendoNotificationService
  ) { }

  //#region lifecycle
  private arrUnsubscribe: Subscription[] = []

  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }
  //#endregion

  //#region download
  @Input() fileName: string = '';
  @Input() disabledDown: boolean = false;
  @Input() actionDownName: string = 'template';

  public onGetTemplate() {
    if (PSString.isNullOrWhitespace(this.fileName))
      return;
    else
      this.GetTemplate();
  }

  private GetTemplate() {
    this.subLoader.loader(true);
    var temp = this.resapi.GetTemplate(this.fileName).subscribe(res => {
      if (res != null) {
        PSFile.getFile(res, 0, this.fileName);
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Tải template ${this.fileName} không thành công: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Tải template ${this.fileName} không thành công: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }
  //#endregion

  //#region upload
  @Input() disabledUp: boolean = false;
  @Input() actionUpName: string = 'import';
  @Output() selectFile: EventEmitter<any> = new EventEmitter<any>();

  public onSelectFile(e) {
    this.selectFile.emit(e.files[0].rawFile)
  }
  //#endregion
}
