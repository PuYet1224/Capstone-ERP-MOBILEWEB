import { Component, Input, ViewChild } from "@angular/core";
import { PSButtonModule } from "src/app/components/ps-button/ps-button.module";
import { PSDropdownModule } from "src/app/components/ps-dropdown/ps-dropdown.module";
import { LabelModule } from "@progress/kendo-angular-label";
import { PSDialogModule } from "src/app/components/ps-dialog/ps-dialog.module";
import { SharedModule } from "@progress/kendo-angular-grid";
import { PSTableModule } from "src/app/components/ps-table/ps-table.module";
import { PSInputModule } from "src/app/components/ps-input/ps-input.module";
import { PSLayoutModule } from "src/app/components/ps-layout/ps-layout.module";
import { PURDOMasterCusDTO } from "src/app/models/dtos/e-dtos/pur-do-master.dto";
import { BehaviorSubject, Subscription } from "rxjs";
import { FunctionPermissionDTO } from "src/app/models/dtos/function-permission.dto";
import { SysDataTypePopupEnum } from "src/app/models/enums/e-type/sys-data-type-popup.enum";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { PSCache } from "src/app/services/utilities/ps-cache";
import { PSGetConfigService } from "src/app/services/core/ps-get-config.service";
import { CompositeFilterDescriptor, FilterDescriptor, State } from "@progress/kendo-data-query";
import { PsFilterTextboxComponent } from "src/app/components/ps-input/components/ps-filter-textbox/ps-filter-textbox.component";
import { LSHeadCusDTO } from "src/app/models/dtos/e-dtos/ls-head.dto";
import { PSArray } from "src/app/services/utilities/ps-array";
import { ActionColumnDTO } from "src/app/components/ps-table/models/dtos/action-column.dto";
import { SYSDataDTO } from "src/app/models/dtos/e-dtos/sys-data.dto";
import { ReportInputDTO } from "src/app/models/dtos/report-input.dto";
import { KeyLocalStorageEnum } from "src/app/models/enums/key-local-storage.enum";
import { FileDownloadTypeEnum } from "src/app/models/enums/file-download-type.enum";
import { PSFile } from "src/app/services/utilities/ps-file";
import { PSDate } from "src/app/services/utilities/ps-date";
import { FormsModule } from "@angular/forms";
import { DatePickerModule } from "@progress/kendo-angular-dateinputs";
import { TypeDuration, TypeDurationConfig } from "src/app/models/enums/type-duration.enum";
import { PSHeaderService } from "src/app/layouts/main-layout/services/ps-header.service";

@Component({
  standalone: true,
  selector: 'mtb-report',
  templateUrl: './mtb-report.component.html',
  styleUrls: ['./mtb-report.component.scss'],
  imports: [PSButtonModule, PSDropdownModule, LabelModule, PSDialogModule, SharedModule, PSTableModule, PSInputModule, PSLayoutModule, FormsModule, DatePickerModule]
})

export class MtbReport {


  //#REGION LIFE CYCLE
  private arrUnsubscribe: Subscription[] = []; // Lưu các subscription để unsubscribe khi destroy
  public FunctionPermissionDTO = FunctionPermissionDTO; // Enum quyền dùng cho template
  @Input() DLLPakage: string;
  public selectedStore: number = null;
  public selectedduration: number = null;
  public typeOfpopup: number;
  public SysDataTypePopupEnum = SysDataTypePopupEnum

  constructor(
    private subLoader: PsLayoutLoaderService, // Service hiển thị loading
    private notification: PSKendoNotificationService, // Service hiển thị thông báo
    private coreapi: PSCoreApiService, // Service gọi API core
    private cache: PSCache, // Service cache dữ liệu local
    private config: PSGetConfigService, // Service lấy config
    private header: PSHeaderService
  ) { }

  ngOnInit(): void {
    this.GetListHead();
    // Khi khởi tạo component, gọi API lấy danh sách báo cáo với DLL package mặc định
    // const dllPackage = this.getDefaultDLLPackage();
    // this.DLLPakage = dllPackage
    this.GetListReport(this.filter, this.DLLPakage);

    var head = this.header.headObs$.subscribe((data) => {
      if (data != null) {
        this.GetListReport(this.filter, this.DLLPakage);
        this.header.headChange.next(null);
      }
    })
    this.arrUnsubscribe.push(head);
  }

  ngOnDestroy(): void {
    // Hủy tất cả các subscription khi component bị destroy để tránh memory leak
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
  }
  //#END REGION LIFE CYCLE

  //#REGION FILTER & THỜI GIAN XUẤT BÁO CÁO
  // Danh sách các trường filter text
  public listfiltertext = ['ID', 'Name', 'Description'];
  private lasttextvalue = '';
  private filter: State = {
    skip: 0,
    take: 25,
    sort: [{ field: 'ID', dir: 'asc' }],
    filter: { logic: 'and', filters: [] },
  };
  private filtertext: CompositeFilterDescriptor = { filters: [], logic: 'or' };
  public action: string = '';

  // Các biến điều khiển hiển thị popup điều kiện xuất báo cáo
  public isDay: boolean = false;
  public isMonth: boolean = false;
  public isQuarter: boolean = false;
  public isYear: boolean = false;

  // Danh sách năm, tháng, quý, loại kỳ xuất báo cáo
  public listYear: any[] = PSDate.getYears(new Date().getFullYear());
  public listDataMonthAndQuarter: { Code: number; Name: string; Type: number }[] = [
    { Code: 1, Name: 'Tháng 1', Type: 1 },
    { Code: 2, Name: 'Tháng 2', Type: 1 },
    { Code: 3, Name: 'Tháng 3', Type: 1 },
    { Code: 4, Name: 'Tháng 4', Type: 1 },
    { Code: 5, Name: 'Tháng 5', Type: 1 },
    { Code: 6, Name: 'Tháng 6', Type: 1 },
    { Code: 7, Name: 'Tháng 7', Type: 1 },
    { Code: 8, Name: 'Tháng 8', Type: 1 },
    { Code: 9, Name: 'Tháng 9', Type: 1 },
    { Code: 10, Name: 'Tháng 10', Type: 1 },
    { Code: 11, Name: 'Tháng 11', Type: 1 },
    { Code: 12, Name: 'Tháng 12', Type: 1 },
    { Code: 1, Name: 'Quý 1', Type: 2 },
    { Code: 2, Name: 'Quý 2', Type: 2 },
    { Code: 3, Name: 'Quý 3', Type: 2 },
    { Code: 4, Name: 'Quý 4', Type: 2 },
  ];
  public listDataMonthAndQuarterFilter: { Code: number; Name: string; Type: number }[] = [...this.listDataMonthAndQuarter];
  public listTypeOfReport = Object.values(TypeDurationConfig);
  public TypeDuration = TypeDuration
  // Các biến lưu giá trị đang chọn trong popup xuất báo cáo
  public selectedYear: any = null; // Năm đang chọn
  public selectedMonthOrQuarter: any = null; // Tháng hoặc quý đang chọn
  public selectedDay: Date = new Date(); // Ngày đang chọn
  public selectedTypeOfReport: any = TypeDuration.DAY; // Loại kỳ đang chọn (1: ngày, 2: tháng, ...)

  // Giới hạn thời gian không cho chọn tương lai
  public maxDate: Date = new Date(); // Ngày lớn nhất được chọn (hôm nay)
  public maxYear: number = new Date().getFullYear(); // Năm lớn nhất
  public maxMonth: number = new Date().getMonth() + 1; // Tháng lớn nhất nếu là năm hiện tại
  public maxQuarter: number = Math.floor((new Date().getMonth()) / 3) + 1; // Quý lớn nhất nếu là năm hiện tại

  @ViewChild(PsFilterTextboxComponent) filterTextbox!: PsFilterTextboxComponent; // Lấy reference tới component filter textbox

  // Danh sách cửa hàng (mặc định chỉ có "Tất cả các cửa hàng")
  public listheadcopy: LSHeadCusDTO[] = [
    { Code: null, BriefName: 'Tất cả các cửa hàng' } as LSHeadCusDTO,
  ];
  public listhead: LSHeadCusDTO[] = [];
  public headactive: LSHeadCusDTO = new LSHeadCusDTO();

  // Hàm tạo filter chỉ có search text (lọc theo 3 trường: Name, Description, ID)
  private createTextFilter(text: string): State {
    return {
      skip: 0,
      take: 25,
      filter: {
        logic: 'or',
        filters: [
          { field: 'Name', operator: 'contains', value: text },
          { field: 'Description', operator: 'contains', value: text },
          { field: 'ID', operator: 'contains', value: text },
        ],
      },
    };
  }

  // Xử lý khi thay đổi filter text (tìm kiếm)
  public textFilterChange(e: FilterDescriptor[]) {
    var text = PSArray.isNullOrEmpty(e) ? '' : e[0].value;
    if (text != this.lasttextvalue) {
      this.filter = this.createTextFilter(text);
      const dllPackage = this.getDefaultDLLPackage();
      this.GetListReport(this.filter, dllPackage);
      this.lasttextvalue = text;
    }
  }

  // Xử lý khi thay đổi năm (chỉ cho phép chọn tháng/quý không vượt quá hiện tại nếu là năm hiện tại)
  public onYearChange(year: number) {
    this.selectedYear = year;
    if (this.isMonth) {
      this.listDataMonthAndQuarterFilter = this.listDataMonthAndQuarter.filter(
        (item) => item.Type == 1 && (year < this.maxYear || item.Code <= this.maxMonth)
      );
      if (year == this.maxYear && this.selectedMonthOrQuarter > this.maxMonth) {
        this.selectedMonthOrQuarter = this.maxMonth;
      }
    }
    if (this.isQuarter) {
      this.listDataMonthAndQuarterFilter = this.listDataMonthAndQuarter.filter(
        (item) => item.Type == 2 && (year < this.maxYear || parseInt(item.Name.replace(/\D/g, '')) <= this.maxQuarter)
      );
      if (year == this.maxYear && this.selectedMonthOrQuarter > (12 + this.maxQuarter)) {
        this.selectedMonthOrQuarter = 12 + this.maxQuarter;
      }
    }
  }

  // Hàm tiện ích: Lấy thông tin ngày/tháng/quý/năm hiện tại
  private getCurrentDateInfo() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const quarter = Math.floor((month - 1) / 3) + 1;
    return { now, year, month, quarter };
  }
  //#END REGION FILTER & THỜI GIAN XUẤT BÁO CÁO

  //#REGION DANH SÁCH & ACTION GRID
  public actionColumn: ActionColumnDTO[] = []; // Danh sách các action hiển thị trên từng dòng grid
  public data: BehaviorSubject<SYSDataDTO[]> = new BehaviorSubject<SYSDataDTO[]>([]); // Dữ liệu danh sách báo cáo (dùng async pipe)
  public skip = 0; // Số dòng bỏ qua (phân trang)
  private _showpopup = false; // Biến điều khiển hiển thị popup xuất báo cáo
  public get showpopup() {
    return this._showpopup;
  }
  public set showpopup(val: boolean) {
    this._showpopup = val;
    if (val) {
      this.resetExportDialog();
    }
  }

  public itemAction: SYSDataDTO = new SYSDataDTO(); // Báo cáo đang thao tác (dùng cho xuất báo cáo)

  public parammeterdto: ReportInputDTO = new ReportInputDTO()

  public onActionClick(e: ActionColumnDTO) {
    this.itemAction = e.data;
    this.action = e.action as string;
    this.cache.setItem(KeyLocalStorageEnum.DO, e.data);
    this.resetExportDialog();
    this.showpopup = true;

    this.parammeterdto.Report = this.itemAction;
    this.parammeterdto.Parameter.DLLPackage = this.DLLPakage;
    this.parammeterdto.Parameter.Type = this.selectedTypeOfReport;

    if (this.itemAction.TypePopup == SysDataTypePopupEnum.None || this.itemAction.TypePopup == SysDataTypePopupEnum.NoneHead || this.itemAction.TypePopup == SysDataTypePopupEnum.All || this.itemAction.TypePopup == SysDataTypePopupEnum.Day) {
      this.selectedTypeOfReport = TypeDuration.DAY;
    } else if (this.itemAction.TypePopup == SysDataTypePopupEnum.Month) {
      this.selectedTypeOfReport = TypeDuration.MONTH;
    } else if (this.itemAction.TypePopup == SysDataTypePopupEnum.Quarter) {
      this.selectedTypeOfReport = TypeDuration.QUARTER;
    } else if (this.itemAction.TypePopup == SysDataTypePopupEnum.Year) {
      this.selectedTypeOfReport = TypeDuration.YEAR;
    }

    this.typeOfpopup = this.itemAction.TypePopup;

    const { now, year, month, quarter } = this.getCurrentDateInfo();
    this.selectedYear = year;

    if (this.selectedTypeOfReport == TypeDuration.MONTH) {
      this.isDay = false;
      this.isMonth = true;
      this.isQuarter = false;
      this.isYear = false;

      this.listDataMonthAndQuarterFilter = this.listDataMonthAndQuarter.filter(
        (item) => item.Type == 1 && (year < this.maxYear || item.Code <= this.maxMonth)
      );
      this.selectedMonthOrQuarter = month;

    } else if (this.selectedTypeOfReport == TypeDuration.QUARTER) {
      this.isDay = false;
      this.isMonth = false;
      this.isQuarter = true;
      this.isYear = false;

      this.listDataMonthAndQuarterFilter = this.listDataMonthAndQuarter.filter(
        (item) => item.Type == 2 && (year < this.maxYear || parseInt(item.Name.replace(/\D/g, '')) <= this.maxQuarter)
      );

      const quarterItem = this.listDataMonthAndQuarterFilter.find(
        (item) => item.Code === quarter
      );
      this.selectedMonthOrQuarter = quarterItem ? quarterItem.Code : null;

    } else if (this.selectedTypeOfReport == TypeDuration.YEAR) {
      this.isDay = false;
      this.isMonth = false;
      this.isQuarter = false;
      this.isYear = true;
    } else {
      this.isDay = true;
      this.isMonth = false;
      this.isQuarter = false;
      this.isYear = false;
      this.selectedDay = now;
    }
  }


  public onActionColumnFocus(e: PURDOMasterCusDTO) {

    this.actionColumn = [
      {
        image: 'assets/images/icons/export-pdf.icon.svg',
        text: 'Xuất báo cáo PDF',
        action: 'pdf',
      },
      {
        image: 'assets/images/icons/export-excel.icon.svg',
        text: 'Xuất báo cáo Excel',
        action: 'excel',
      },
    ];
  }

  public onstorechange(store: number) {
    this.parammeterdto.Parameter.Head = store;
  }
  public ondatechange(date: Date) {
    this.parammeterdto.Parameter.Date = date;
  }
  public onTypeOfReportChanged(report: number) {
    this.parammeterdto.Parameter.Type = report;
    const { now, year, month, quarter } = this.getCurrentDateInfo();
    if (report == TypeDuration.DAY) {
      this.isDay = true;
      this.isMonth = false;
      this.isQuarter = false;
      this.isYear = false;
      this.selectedDay = now;
    } else if (report == TypeDuration.MONTH) {
      this.isDay = false;
      this.isMonth = true;
      this.isQuarter = false;
      this.isYear = false;
      this.selectedYear = year;
      this.selectedMonthOrQuarter = month;

      this.listDataMonthAndQuarterFilter = this.listDataMonthAndQuarter.filter(
        (item) => item.Type == 1 && (this.selectedYear < this.maxYear || item.Code <= this.maxMonth)
      );
    } else if (report == TypeDuration.QUARTER) {
      this.isDay = false;
      this.isMonth = false;
      this.isQuarter = true;
      this.isYear = false;
      this.selectedYear = year;

      this.listDataMonthAndQuarterFilter = this.listDataMonthAndQuarter.filter(
        (item) => item.Type == 2 && (this.selectedYear < this.maxYear || parseInt(item.Name.replace(/\D/g, '')) <= this.maxQuarter)
      );

      const quarterItem = this.listDataMonthAndQuarterFilter.find(
        (item) => item.Code === quarter
      );
      this.selectedMonthOrQuarter = quarterItem ? quarterItem.Code : null;
    } else if (report == TypeDuration.YEAR) {
      this.isDay = false;
      this.isMonth = false;
      this.isQuarter = false;
      this.isYear = true;
      this.selectedYear = year;
    }
  }
  //#END REGION DANH SÁCH & ACTION GRID

  //#REGION API & EXPORT DIALOG
  // Get API lấy danh sách báo cáo
  private GetListReport(filter: State, dll: string) {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListReport(filter, dll).subscribe(
      (res) => {
        if (res.StatusCode == 0) {
          this.data.next(res.ObjectReturn.Data as SYSDataDTO[]);
          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi lấy danh sách báo cáo: ${res.ErrorString}`);
        }
      },
      (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách báo cáo: ${err.message}`);
      }
    );
    this.arrUnsubscribe.push(temp);
  }

  private GetListHead() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListHead().subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listhead = [...this.listheadcopy]
        this.listhead.push(...res.ObjectReturn);
        this.headactive = this.listhead[0]
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy thông tin cửa hàng: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy thông tin cửa hàng: ${err.message}`)
    });
    this.arrUnsubscribe.push(temp);
  }

  public uploadScan(p) {
    if (this.selectedTypeOfReport == TypeDuration.DAY) {
      this.parammeterdto.Parameter.Date = this.selectedDay
    }
    if (this.selectedTypeOfReport == TypeDuration.MONTH) {
      delete this.parammeterdto.Parameter.Date;
      this.parammeterdto.Parameter.Year = this.selectedYear;
      this.parammeterdto.Parameter.Month = this.selectedMonthOrQuarter;
    }
    if (this.selectedTypeOfReport == TypeDuration.QUARTER) {
      delete this.parammeterdto.Parameter.Date;
      this.parammeterdto.Parameter.Year = this.selectedYear;
      this.parammeterdto.Parameter.Quarter = this.selectedMonthOrQuarter;
    }
    if (this.selectedTypeOfReport == TypeDuration.YEAR) {
      delete this.parammeterdto.Parameter.Date;
      delete this.parammeterdto.Parameter.Quarter
      this.parammeterdto.Parameter.Year = this.selectedYear;
    }
    this.export(this.parammeterdto, p);
  }

  private export(param, api) {
    this.subLoader.loader(true);
    var temp = this.coreapi[api](param).subscribe(res => {
      if (res != null) {
        this.subLoader.loader(false);
        PSFile.getFile(res, api == 'ExportExcel' ? FileDownloadTypeEnum.EXCEL : FileDownloadTypeEnum.PDF);
        this.showpopup = false;
        this.notification.onSuccess(`Thành công`);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Không thành công: ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Không thành công: ${err.message}`);
    })
    this.arrUnsubscribe.push(temp);
  }

  // Reset lại các giá trị trong popup xuất báo cáo về mặc định
  resetExportDialog() {
    this.selectedTypeOfReport = TypeDuration.DAY;
    this.isDay = true;
    this.isMonth = false;
    this.isQuarter = false;
    this.isYear = false;
    const { now, year, month, quarter } = this.getCurrentDateInfo();
    this.selectedDay = now;
    this.selectedYear = year;
    this.selectedMonthOrQuarter = month;
    const quarterItem = this.listDataMonthAndQuarter.find(
      (item) => item.Type === 2 && item.Name.replace(/\s/g, '') === `Quý${quarter}`
    );
    this.selectedMonthOrQuarter = quarterItem ? quarterItem.Code : null;
  }

  // Get DLL package mặc định từ cache
  private getDefaultDLLPackage() {
    return this.config.GetDLL();
  }


  //#END REGION API & EXPORT DIALOG

}


