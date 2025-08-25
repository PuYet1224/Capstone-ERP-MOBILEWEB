import { Component, Input, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AxisLabelContentArgs, ChartModule } from "@progress/kendo-angular-charts";
import { DatePickerModule } from "@progress/kendo-angular-dateinputs";
import { Subscription } from "rxjs";
import { PsLayoutLoaderService } from "src/app/layouts/main-layout/services/ps-layout-loader.service";
import { ListDTO } from "src/app/models/dtos/e-dtos/list.dto";
import { LSHeadCusDTO } from "src/app/models/dtos/e-dtos/ls-head.dto";
import { LSListTypeDataEnum } from "src/app/models/enums/e-type/ls-list-type-data.enum";
import { PSKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { LabelModule } from '@progress/kendo-angular-label';
import { PSDropdownModule } from "src/app/components/ps-dropdown/ps-dropdown.module";
import { PSLayoutModule } from "src/app/components/ps-layout/ps-layout.module";
import { CommonModule } from "@angular/common";
import { DashboardVehicleOverview } from "src/app/models/dtos/dashboard-vehicle-overview";
import { DashboardInputDTO } from "src/app/models/dtos/dashboard-input.dto";
import { PSDate } from "src/app/services/utilities/ps-date";
import { DashboardDTO } from "src/app/models/dtos/dashboard.dto";
import { ParameterDTO } from "src/app/models/dtos/parameter.dto";
import { PsDashboardApiService } from "../../services/ps-dashboard-api.service";
import { DashboardEnum } from "src/app/models/enums/e-type/dashboard.enum";
import { TypeDuration } from "src/app/models/enums/type-duration.enum";
@Component({
  standalone: true,
  selector: 'mtb-dashboard',
  templateUrl: './mtb-dashboard.component.html',
  styleUrls: ['./mtb-dashboard.component.scss'],
  imports: [ChartModule, DatePickerModule, FormsModule, LabelModule, PSDropdownModule, PSLayoutModule, CommonModule]
})
export class MtbDashboard implements OnInit {

  constructor(
    private subLoader: PsLayoutLoaderService,
    private notification: PSKendoNotificationService,
    private coreapi: PSCoreApiService,
    private dashboardapi: PsDashboardApiService,
  ) {
    var last = new Date().getFullYear()
    this.listyear = PSDate.getYears(last);
  }
  private arrUnsubscribe: Subscription[] = [];
  public listHead: LSHeadCusDTO[] = [];
  public listpaymentmethod: ListDTO[] = [];
  public overview: DashboardVehicleOverview = new DashboardVehicleOverview;
  public duration: ParameterDTO = new ParameterDTO;
  public chartEnum = DashboardEnum;
  public dashboardInput: DashboardInputDTO = new DashboardInputDTO();
  public listMethodEnum = [];
  public dashboard: DashboardDTO[] = [];
  public listyear: number[];
  public listmonth: number[] = [];
  public fullyearmonth: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  public isSelectedMonth: boolean = false;
  public currentYear = new Date().getFullYear();
  public isSelectedYear: boolean = false;
  public currentMonth = new Date().getMonth() + 1;
  public fullQuarter = [1, 2, 3, 4];
  public listquarter: number[] = [];
  public selectedMonth: number = 1;
  public selectedYear: number = this.currentYear;
  public selectedQuater: number = 1;
  public durationMethod: number = TypeDuration.DAY;
  public chart1: DashboardDTO[] = [];
  public chart2: DashboardDTO[] = [];
  public chart3_doanhthu: DashboardDTO[] = [];
  public chart3_thucthu: DashboardDTO[] = [];
  public chart4: DashboardDTO[] = [];
  public chart5_nhaphang: DashboardDTO[] = [];
  public chart5_tonchuaban: DashboardDTO[] = [];
  public chart5_tondaban: DashboardDTO[] = [];
  public chart6_nhaphang: DashboardDTO[] = [];
  public chart6_tonchuaban: any;
  public chart6_tondaban: DashboardDTO[] = [];
  public totalDoanhThuChart3: number;
  public totalThucThuChart3: number;
  public titleChart1: string;
  public titleChart2: string;
  public titleChart3: string;
  public titleChart4: string;
  public titleChart5: string;
  public typechart5: number;
  public chart5_pieChart: DashboardDTO[];
  public totalInboundChart5: number;
  public totalInStockChart5: number;
  public titleChart6: string;

  public formattedRevenueSold: string = '';
  public formattedRevenueActual: string = '';
  public formattedTotalDoanhThuChart3: string = '';
  public formattedTotalThucThuChart3: string = '';


  startDate: Date | null = null;
  endDate: Date | null = null;
  today: Date = new Date();

  ngOnInit(): void {
    this.getlisthead();
    this.getlistlslist();
    this.durationMethod = TypeDuration.DAY;
    this.onMethodChange(this.durationMethod);
    this.listmonth = [...this.fullyearmonth];
  }
  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }

  //Hàm xử lý khi thay đổi cửa hàng
  onStoreChange(number: number) {
    this.duration.Head = number ?? null;
    this.dashboardInput.Dashboard = this.listMethodEnum;
    this.dashboardInput.Parameter = this.duration;
    this.onMethodChange(this.durationMethod);
  }

  //Hàm xử lý khi thay đổi hình thức
  onMethodChange(number: number) {
    this.durationMethod = number;
    const currentMonth = new Date().getMonth() + 1;
    const currentQuarter = Math.ceil((currentMonth + 1) / 3);
    this.selectedMonth = currentMonth;
    this.selectedQuater = currentQuarter;
    this.listMethodEnum = [];

    if (number == TypeDuration.DAY) {
      this.isSelectedMonth = false;
      this.isSelectedYear = false;
      this.listMethodEnum.push(DashboardEnum.RevenueDay, DashboardEnum.InboundDay);
    } else if (number == TypeDuration.MONTH) {

      this.isSelectedMonth = true;
      this.isSelectedYear = false;
      this.listMethodEnum.push(DashboardEnum.RevenueMonth, DashboardEnum.InboundMonth);
    } else if (number == TypeDuration.QUARTER) {
      this.isSelectedMonth = false;
      this.isSelectedYear = false;
      this.listMethodEnum.push(DashboardEnum.RevenueQuarter, DashboardEnum.InboundQuarter);
    } else if (number == TypeDuration.YEAR) {
      this.isSelectedMonth = false;
      this.isSelectedYear = true;
      this.listMethodEnum.push(DashboardEnum.RevenueYear, DashboardEnum.InboundYear);
    }

    if (this.duration.Head != null) {
      this.listMethodEnum.push(
        DashboardEnum.RevenueStore,
        DashboardEnum.RevenuePercentageVehicle,
        DashboardEnum.IIPercentageVehicle,
        DashboardEnum.IIVehicle
      );
    } else {
      this.listMethodEnum.push(
        DashboardEnum.RevenueAllStore,
        DashboardEnum.RevenuePercentageVehicle,
        DashboardEnum.IIAllStore,
        DashboardEnum.IIVehicle
      );
    }


    this.dashboardInput.Dashboard = this.listMethodEnum;
    this.dashboardInput.Parameter = this.duration;

    const newDate = new Date();
    this.endDate = PSDate.setHours(newDate, 0, 0, 0, 0);

    if (this.durationMethod == TypeDuration.MONTH) {
      delete this.dashboardInput.Parameter.FromDate;
      delete this.dashboardInput.Parameter.ToDate;
      delete this.dashboardInput.Parameter.Quarter;

      this.dashboardInput.Parameter.Month = this.selectedMonth;
      this.dashboardInput.Parameter.Year = this.currentYear;
      this.methodChange(this.dashboardInput);
    } else if (this.durationMethod == TypeDuration.QUARTER) {
      delete this.dashboardInput.Parameter.FromDate;
      delete this.dashboardInput.Parameter.ToDate;
      delete this.dashboardInput.Parameter.Month;

      this.dashboardInput.Parameter.Quarter = this.selectedQuater;
      this.dashboardInput.Parameter.Year = this.currentYear;
      this.methodChange(this.dashboardInput);
    } else if (this.durationMethod == TypeDuration.YEAR) {
      delete this.dashboardInput.Parameter.FromDate;
      delete this.dashboardInput.Parameter.ToDate;
      delete this.dashboardInput.Parameter.Month;
      delete this.dashboardInput.Parameter.Quarter;

      this.dashboardInput.Parameter.Year = this.currentYear;
      this.methodChange(this.dashboardInput);
    } else {
      delete this.dashboardInput.Parameter.Month;
      delete this.dashboardInput.Parameter.Quarter;
      delete this.dashboardInput.Parameter.Year;
      this.onEndDateChange(this.endDate);

    }

  }

  // Hàm để xử lý gọi API dashboard 2 chart cùng block 1 lúc
  methodChange(param: DashboardInputDTO) {
    // if (this.durationMethod == TypeDuration.MONTH || this.durationMethod == TypeDuration.QUARTER) {
    //   this.onMonthYearChange(this.selectedYear, 'year');
    // }
    this.callDashboardGroup(param.Parameter);
  }


  // Hàm để disable ngày bắt đầu và kết thúc
  public disabledStartDates = (date: Date): boolean => {
    return date > new Date(new Date().setDate(new Date().getDate() - 7));
  };
  public disabledEndDates = (date: Date): boolean => {
    return date > new Date();
  };

  //Hàm xử lý khi thay đổi ngày bắt đầu
  onStartDateChange(date: any) {
    if (!date) return;

    const newDate = new Date(date);
    this.startDate = PSDate.setHours(newDate, 0, 0, 0, 0);

    const newEndDate = new Date(this.startDate);
    newEndDate.setDate(newEndDate.getDate() + 7);
    this.endDate = PSDate.setHours(newEndDate, 0, 0, 0, 0);

    this.callDashboardGroup({
      FromDate: this.startDate,
      ToDate: this.endDate
    });
  }


  //Hàm xử lý khi thay đổi ngày kết thúc
  onEndDateChange(date: any) {
    if (!date) return;

    const newDate = new Date(date);
    this.endDate = PSDate.setHours(newDate, 0, 0, 0, 0);

    const newStartDate = new Date(this.endDate);
    newStartDate.setDate(newStartDate.getDate() - 7);
    this.startDate = PSDate.setHours(newStartDate, 0, 0, 0, 0);

    this.callDashboardGroup({
      FromDate: this.startDate,
      ToDate: this.endDate
    });
  }


  //Hàm xử lý khi thay đổi tháng, quý, năm
  onMonthYearChange(number: number, string: 'month' | 'year' | 'quater') {
    if (string === 'month') {
      this.dashboardInput.Parameter.Month = number;
      this.callDashboardGroup({});
    } else if (string === 'quater') {
      this.dashboardInput.Parameter.Quarter = number;
      this.callDashboardGroup({});
    } else if (string === 'year') {
      if (number === this.currentYear) {
        const currentQuarter = Math.ceil((this.currentMonth + 1) / 3);
        this.listmonth = this.fullyearmonth.filter(m => m <= this.currentMonth);
        this.listquarter = this.fullQuarter.filter(q => q <= currentQuarter);
        this.selectedMonth = this.currentMonth;
        this.selectedQuater = currentQuarter;
        this.dashboardInput.Parameter.Year = number;
        this.dashboardInput.Parameter.Month = this.currentMonth;
        this.dashboardInput.Parameter.Quarter = currentQuarter;
        if (this.durationMethod == TypeDuration.MONTH) {
          delete this.dashboardInput.Parameter.Quarter;
        } else if (this.durationMethod == TypeDuration.QUARTER) {
          delete this.dashboardInput.Parameter.Month;
        }
        this.callDashboardGroup({});
      } else {
        this.listmonth = [...this.fullyearmonth];
        this.listquarter = [...this.fullQuarter];
        this.dashboardInput.Parameter.Year = number;
        this.dashboardInput.Parameter.Month = this.currentMonth;
        const currentQuarter = Math.ceil((this.currentMonth + 1) / 3);
        this.dashboardInput.Parameter.Quarter = currentQuarter;
        if (this.durationMethod == TypeDuration.MONTH) {
          delete this.dashboardInput.Parameter.Quarter;
        } else if (this.durationMethod == TypeDuration.QUARTER) {
          delete this.dashboardInput.Parameter.Month;
        }
        this.callDashboardGroup({});
      }

    }
  }

  // Hàm để gọi API lấy dữ liệu dashboard cho từng phần
  private callDashboardGroup(parameter: any) {
    const parts = [
      this.listMethodEnum.slice(0, 2),
      this.listMethodEnum.slice(2, 4),
      this.listMethodEnum.slice(4, 6),
    ];

    for (const part of parts) {
      const input = {
        ...this.dashboardInput,
        Dashboard: part,
        Parameter: {
          ...this.dashboardInput.Parameter,
          ...parameter,
        },
      };

      this.GetListDashboard(input);
    }

    this.getMotorbikeOverview({
      ...this.dashboardInput.Parameter,
      ...parameter,
    });
  }
  public formatCurrencyVN(value: number): string {
    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(2).replace(/\.00$/, '') + ' tỷ';
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(0) + 'tr';
    } else {
      return value.toLocaleString('vi-VN') + '₫';
    }
  }

  public labelFormatter = (e: any): string => {
    const value = e.value;

    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(0) + ' tỷ';
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(0) + 'tr';
    } else {
      return value.toString();
    }
  };

  //Hàm xử lý nội dung nhãn của biểu đồ tròn
  public labelContentdonut = (e: any): string => {
    const title = e.category;
    const percentage = e.dataItem.Percentage;
    return `${title} \n (${percentage}%)`;
  };

  //Hàm xử lý nội dung nhãn của biểu đồ cột
  public labelContentcolumn = (e: AxisLabelContentArgs): string => {
    const value = e.value;

    if (value >= 1_000_000_000) {
      return `${Math.floor(value / 1_000_000_000)} tỷ`;
    } else if (value >= 1_000_000) {
      return `${Math.floor(value / 1_000_000)}tr`;
    } else if (value >= 1_000) {
      return `${Math.floor(value / 1_000)} ₫`;
    } else {
      return value.toString();
    }
  };

  // Hàm xử lý các nhóm biểu đồ dựa trên ID
  private dashboardHandlers: { [key: number]: (data: any[]) => void } = {
    // Chart group 1
    [DashboardEnum.RevenueDay]: this.handleChartGroup1.bind(this),
    [DashboardEnum.RevenueMonth]: this.handleChartGroup1.bind(this),
    [DashboardEnum.RevenueQuarter]: this.handleChartGroup1.bind(this),
    [DashboardEnum.RevenueYear]: this.handleChartGroup1.bind(this),
    [DashboardEnum.InboundDay]: this.handleChartGroup1.bind(this),
    [DashboardEnum.InboundMonth]: this.handleChartGroup1.bind(this),
    [DashboardEnum.InboundQuarter]: this.handleChartGroup1.bind(this),
    [DashboardEnum.InboundYear]: this.handleChartGroup1.bind(this),

    // Chart group 2
    [DashboardEnum.RevenueStore]: this.handleChartGroup2.bind(this),
    [DashboardEnum.RevenueAllStore]: this.handleChartGroup2.bind(this),
    [DashboardEnum.RevenuePercentageVehicle]: this.handleChartGroup2.bind(this),

    // Chart group 3
    [DashboardEnum.IIAllStore]: this.handleChartGroup3.bind(this),
    [DashboardEnum.IIPercentageVehicle]: this.handleChartGroup3.bind(this),
    [DashboardEnum.IIVehicle]: this.handleChartGroup3.bind(this),
  };


  // Hàm xử lý nhóm chart 1 và 2
  private handleChartGroup1(data: any[]) {
    const chart1Source = data.find(d =>
      [
        DashboardEnum.RevenueDay,
        DashboardEnum.RevenueMonth,
        DashboardEnum.RevenueQuarter,
        DashboardEnum.RevenueYear
      ].includes(d.Type)
    );

    const chart2Source = data.find(d =>
      [
        DashboardEnum.InboundDay,
        DashboardEnum.InboundMonth,
        DashboardEnum.InboundQuarter,
        DashboardEnum.InboundYear
      ].includes(d.Type)
    );

    //DATA CHART 1
    if (chart1Source) {
      this.chart1 = [...chart1Source.ListData];
      this.titleChart1 = chart1Source.Title;
    }
    //DATA CHART 2
    if (chart2Source) {
      this.chart2 = [...chart2Source.ListData];
      this.titleChart2 = chart2Source.Title;
    }
  }


  // Hàm xử lý nhóm chart 3 và 4
  private handleChartGroup2(data: any[]) {
    const chart3Source = data.find(d =>
      [
        DashboardEnum.RevenueStore,
        DashboardEnum.RevenueAllStore
      ].includes(d.Type)
    );

    const chart4Source = data.find(d =>
      d.Type === DashboardEnum.RevenuePercentageVehicle
    );

    //DATA CHART 3
    if (chart3Source) {
      this.chart3_doanhthu = chart3Source.ListData.map((item: any) => {
        const doanhthu = item.ListData.find((d: any) => d.Type === 1);
        return {
          Title: item.Title,
          Value: doanhthu?.Value ?? 0
        };
      });

      this.chart3_thucthu = chart3Source.ListData.map((item: any) => {
        const thucthu = item.ListData.find((d: any) => d.Type === 2);
        return {
          Title: item.Title,
          Value: thucthu?.Value ?? 0
        };
      });


      this.titleChart3 = chart3Source.Title;
      this.totalDoanhThuChart3 = this.chart3_doanhthu.reduce((sum, item) => sum + (item.Value || 0), 0);
      this.totalThucThuChart3 = this.chart3_thucthu.reduce((sum, item) => sum + (item.Value || 0), 0);
      this.formattedTotalDoanhThuChart3 = this.formatCurrencyVN(this.totalDoanhThuChart3);
      this.formattedTotalThucThuChart3 = this.formatCurrencyVN(this.totalThucThuChart3);

    }

    //DATA CHART 4
    if (chart4Source) {
      this.chart4 = [...chart4Source.ListData];
      this.titleChart4 = chart4Source.Title;
    }
  }


  // Hàm xử lý nhóm chart 5 và 6
  private handleChartGroup3(data: any[]) {
    const chart5Source = data.find(d =>
      [
        DashboardEnum.IIAllStore,
        DashboardEnum.IIPercentageVehicle
      ].includes(d.Type)
    );

    const chart6Source = data.find(d =>
      d.Type === DashboardEnum.IIVehicle
    );


    const listData5 = chart5Source.ListData ?? [];
    const listData6 = chart6Source.ListData ?? [];

    // DATA CHART 5
    this.chart5_nhaphang = listData5.map(item => {
      const nhapHang = item.ListData.find(d => d.Type === 1);
      return {
        Title: item.Title,
        Value: nhapHang?.Value ?? 0
      };
    });

    this.chart5_tondaban = listData5.map(item => {
      const tonKhodaban = item.ListData.find(d => d.Type === 2);
      return {
        Title: item.Title,
        Value: tonKhodaban?.Value ?? 0
      };
    });

    this.chart5_tonchuaban = listData5.map(branch => {
      const tonchuaban = branch.ListData.find(d => d.Type === 3);
      return {
        Title: branch.Title,
        Value: tonchuaban?.Value ?? 0
      };
    });

    this.chart5_pieChart = listData5.map((item: any): DashboardDTO => {
      const nhapHang = item.ListData.find((d: any) => d.Type === 1);
      const tonKho = item.ListData.find((d: any) => d.Type === 2);
      return {
        ...item,
        Value: tonKho.Percentage ?? 0,
        Percentage: nhapHang.Percentage ?? 0,
      };
    });

    // DATA CHART 6
    this.chart6_nhaphang = listData6.map((item: any): DashboardDTO => {
      const nhapHang = item.ListData.find((d: any) => d.Type === 1);
      return {
        ...item,
        Value: nhapHang.Value ?? 0,
      };
    });

    this.chart6_tondaban = listData6.map((item: any): DashboardDTO => {
      const tondaban = item.ListData.find((d: any) => d.Type === 2);
      return {
        ...item,
        Value: tondaban.Value ?? 0,
      };
    });

    this.chart6_tonchuaban = listData6.map(branch => {
      const tonchuaban = branch.ListData.find(d => d.Type === 3);
      return {
        Title: branch.Title,
        Value: tonchuaban.Value ?? 0
      };
    });

    this.titleChart5 = chart5Source.Title ?? '';
    this.titleChart6 = chart6Source.Title ?? '';
    this.typechart5 = chart5Source.Type ?? null;

    // Tổng
    this.totalInboundChart5 = listData5.reduce(
      (sum, branch) => sum + (branch.ListData.find(d => d.Type === 1).Value ?? 0), 0
    );

    this.totalInStockChart5 = listData5.reduce(
      (sum, branch) =>
        sum +
        (branch.ListData.find(d => d.Type === 2).Value ?? 0) +
        (branch.ListData.find(d => d.Type === 3).Value ?? 0),
      0
    );
  }


  //#region call API
  private getlisthead() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListHead().subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listHead = res.ObjectReturn;
        this.listHead.unshift({ Code: null, BriefName: 'Tất cả' } as LSHeadCusDTO)
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
  private getlistlslist() {
    this.subLoader.loader(true);
    var temp = this.coreapi.GetListLSList(LSListTypeDataEnum.DurationMethod).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.listpaymentmethod = res.ObjectReturn;
        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy danh sách hình thức : ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách hình thức : ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }
  private getMotorbikeOverview(param: ParameterDTO) {
    this.subLoader.loader(true);
    var temp = this.dashboardapi.GetMotorbikeOverview(param).subscribe((res) => {
      if (res.StatusCode == 0) {
        this.overview = res.ObjectReturn;
        this.formattedRevenueSold = this.formatCurrencyVN(this.overview.RevenueSold);
        this.formattedRevenueActual = this.formatCurrencyVN(this.overview.RevenueActual);

        this.subLoader.loader(false);
      } else {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy tổng quan tình hình hoạt động : ${res.ErrorString}`);
      }
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy tổng quan tình hình hoạt động : ${err.message}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private GetListDashboard(param: DashboardInputDTO) {
    this.subLoader.loader(true);

    const temp = this.dashboardapi.GetListDashboard(param).subscribe({
      next: (res) => {
        if (res.StatusCode === 0) {
          this.dashboard = res.ObjectReturn;

          // Xác định handler từ ID đầu tiên (giả sử mảng luôn có ít nhất 1 ID)
          const firstId = param.Dashboard[0];
          // console.log(firstId);
          const handler = this.dashboardHandlers[firstId];

          if (handler) {
            handler(this.dashboard);
          } else {
            // console.warn("Chưa định nghĩa handler cho dashboard ID:", firstId);
          }

          this.subLoader.loader(false);
        } else {
          this.subLoader.loader(false);
          this.notification.onError(`Lỗi lấy Dashboard : ${res.ErrorString}`);
        }
      },
      error: (err) => {
        this.subLoader.loader(false);
        this.notification.onError(`Lỗi lấy Dashboard : ${err.message}`);
      }
    });

    this.arrUnsubscribe.push(temp);
  }


}


