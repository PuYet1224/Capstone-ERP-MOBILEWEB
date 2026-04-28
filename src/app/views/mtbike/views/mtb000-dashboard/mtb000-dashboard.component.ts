import { Component, OnInit } from "@angular/core";
import { PSCoreApiService } from "src/app/services/ps-core-api.service";
import { ConfigCacheService } from "src/app/services/core/config-cache.service";
import { Subscription } from "rxjs";
import { LSHeadCusDTO } from "src/app/models/dtos/e-dtos/ls-head.dto";
import { ListDTO } from "src/app/models/dtos/e-dtos/list.dto";
import { LSListTypeDataEnum } from "src/app/models/enums/e-type/ls-list-type-data.enum";
import { DashboardDTO } from "src/app/models/dtos/dashboard.dto";
import { ParameterDTO } from "src/app/models/dtos/parameter.dto";
import { DashboardVehicleOverview } from "src/app/models/dtos/dashboard-vehicle-overview";
import { DashboardInputDTO } from "src/app/models/dtos/dashboard-input.dto";
import { DashboardEnum } from "src/app/models/enums/e-type/dashboard.enum";
import { PSDate } from "src/app/services/utilities/ps-date";
import { Router } from "@angular/router";
import { MtbikeApiService } from "../../services/mtbike-api.service";
import { SystemLoaderService } from "src/app/views/system/services/system-loader.service";
import { PsKendoNotificationService } from "src/app/services/core/ps-kendo-notification.service";
import { TypePeriodDashboardEnum } from "src/app/models/enums/type-period-dashboard.enum";


@Component({
  selector: 'mtb000-dashboard',
  templateUrl: './mtb000-dashboard.component.html',
  styleUrls: ['./mtb000-dashboard.component.scss'],

})

export class Mtb000DashboardComponent implements OnInit {
  constructor(
    private subLoader: SystemLoaderService,
    private notification: PsKendoNotificationService,
    private coreapi: PSCoreApiService,
    private configCache: ConfigCacheService,
    private mtbikeapi: MtbikeApiService,
    protected router: Router,
  ) {
    var last = new Date().getFullYear()
    this.listyear = PSDate.getYears(last);
  }

  public isOpenedFilter: boolean = false;
  private arrUnsubscribe: Subscription[] = [];
  public listHead: LSHeadCusDTO[] = [];
  public listpaymentmethod: ListDTO[] = [];
  public dashboard: DashboardDTO[] = [];
  public overview: DashboardVehicleOverview = new DashboardVehicleOverview();
  public TypePeriodDashboardEnum = TypePeriodDashboardEnum;
  public durationMethod: number = TypePeriodDashboardEnum.TODAY;
  public chartEnum = DashboardEnum;
  public duration: ParameterDTO = new ParameterDTO;
  public dashboardInput: DashboardInputDTO = new DashboardInputDTO();
  public listMethodEnum = [];
  public listmonth: number[] = [];
  public listyear: number[];
  public fullyearmonth: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  public fullQuarter = [1, 2, 3, 4];
  public listquarter: number[] = [];
  public currentYear = new Date().getFullYear();
  public currentMonth = new Date().getMonth() + 1;
  public selectedMonth: number = 1;
  public selectedYear: number = this.currentYear;
  public selectedQuater: number = 1;
  public isSelectedMonth: boolean = false;
  public isSelectedYear: boolean = false;

  public chart1: DashboardDTO[] = [];
  public chart2: DashboardDTO[] = [];
  public titleChart1: string;
  public titleChart2: string;
  public formattedRevenueSold: string = '';
  public formattedRevenueActual: string = '';

  public chart3_doanhthu: DashboardDTO[] = [];
  public chart3_thucthu: DashboardDTO[] = [];
  public chart4: DashboardDTO[] = [];
  public chart5_nhaphang: DashboardDTO[] = [];
  public chart5_tonchuaban: DashboardDTO[] = [];
  public chart5_tondaban: DashboardDTO[] = [];
  public chart6_nhaphang: DashboardDTO[] = [];
  public chart6_tonchuaban: any;
  public chart6_tondaban: DashboardDTO[] = [];
  public totalDoanhThuChart3: number = 0;
  public totalThucThuChart3: number = 0;
  public titleChart3: string;
  public titleChart4: string;
  public titleChart5: string;
  public typechart5: number;
  public chart5_pieChart: DashboardDTO[];
  public totalInboundChart5: number;
  public totalInStockChart5: number;
  public titleChart6: string;

  public formattedTotalDoanhThuChart3: string = '';
  public formattedTotalThucThuChart3: string = '';

  public formattedFromDate: string;
  public formattedToDate: string;
  public formattedYearmonth: string;
  public formattedYearquater: string;
  public formattedYear: string;
  public showToday: boolean = true;
  public showFromDateToDate: boolean = false;
  public showYearMonth: boolean = false;
  public showYearQuater: boolean = false;
  public showYear: boolean = false;
  public headName: string = 'Tất cả';
  startDate: Date | null = null;
  endDate: Date | null = null;
  public today: string;

  ngOnInit(): void {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    this.today = `${day}/${month}/${year}`;

    this.getlisthead();
    this.getlistlslist();
    this.durationMethod = TypePeriodDashboardEnum.TODAY;
    this.onMethodChange(this.durationMethod);
    this.onEndDateChange(this.endDate);
    this.applyFilter();
  }
  ngOnDestroy(): void {
    this.arrUnsubscribe.forEach((sub) => sub.unsubscribe());
    this.arrUnsubscribe = [];
  }

  onBack() {
    this.router.navigate(["/"]);
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
    this.listquarter = this.fullQuarter.filter(q => q <= currentQuarter);
    this.listmonth = this.fullyearmonth.filter(m => m <= currentMonth);
    this.selectedMonth = currentMonth;
    this.selectedQuater = currentQuarter;
    this.selectedYear = this.currentYear;
    this.listMethodEnum = [];

    if (number == TypePeriodDashboardEnum.DAY || number == TypePeriodDashboardEnum.TODAY) {
      this.listMethodEnum.push(DashboardEnum.RevenueDay, DashboardEnum.InboundDay);
    } else if (number == TypePeriodDashboardEnum.MONTH) {
      this.listMethodEnum.push(DashboardEnum.RevenueMonth, DashboardEnum.InboundMonth);
    } else if (number == TypePeriodDashboardEnum.QUARTER) {
      this.listMethodEnum.push(DashboardEnum.RevenueQuarter, DashboardEnum.InboundQuarter);
    } else if (number == TypePeriodDashboardEnum.YEAR) {
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
    this.startDate = new Date(this.endDate.getTime() - 7 * 24 * 60 * 60 * 1000);

    if (this.durationMethod == TypePeriodDashboardEnum.MONTH) {
      delete this.dashboardInput.Parameter.FromDate;
      delete this.dashboardInput.Parameter.ToDate;
      delete this.dashboardInput.Parameter.Quarter;

      this.dashboardInput.Parameter.Month = this.selectedMonth;
      this.dashboardInput.Parameter.Year = this.currentYear;
    } else if (this.durationMethod == TypePeriodDashboardEnum.QUARTER) {
      delete this.dashboardInput.Parameter.FromDate;
      delete this.dashboardInput.Parameter.ToDate;
      delete this.dashboardInput.Parameter.Month;

      this.dashboardInput.Parameter.Quarter = this.selectedQuater;
      this.dashboardInput.Parameter.Year = this.currentYear;
    } else if (this.durationMethod == TypePeriodDashboardEnum.YEAR) {
      delete this.dashboardInput.Parameter.FromDate;
      delete this.dashboardInput.Parameter.ToDate;
      delete this.dashboardInput.Parameter.Month;
      delete this.dashboardInput.Parameter.Quarter;

      this.dashboardInput.Parameter.Year = this.currentYear;
    } else {
      delete this.dashboardInput.Parameter.Month;
      delete this.dashboardInput.Parameter.Quarter;
      delete this.dashboardInput.Parameter.Year;
      this.onEndDateChange(this.endDate);
    }
  }

  //Hàm xử lý khi thay đổi ngày bắt đầu
  onStartDateChange(date: any) {
    if (!date) return;

    const newDate = new Date(date);
    this.startDate = PSDate.setHours(newDate, 0, 0, 0, 0);

    const newEndDate = new Date(this.startDate);
    newEndDate.setDate(newEndDate.getDate() + 7);
    this.endDate = PSDate.setHours(newEndDate, 0, 0, 0, 0);

    this.dashboardInput.Parameter.FromDate = this.startDate;
    this.dashboardInput.Parameter.ToDate = this.endDate;
  }


  //Hàm xử lý khi thay đổi ngày kết thúc
  onEndDateChange(date: any) {
    if (!date) return;

    const newDate = new Date(date);
    this.endDate = PSDate.setHours(newDate, 0, 0, 0, 0);

    const newStartDate = new Date(this.endDate);
    newStartDate.setDate(newStartDate.getDate() - 7);
    this.startDate = PSDate.setHours(newStartDate, 0, 0, 0, 0);

    this.dashboardInput.Parameter.FromDate = this.startDate;
    this.dashboardInput.Parameter.ToDate = this.endDate;

    if (this.durationMethod == TypePeriodDashboardEnum.TODAY) {
      delete this.dashboardInput.Parameter.FromDate;
    }
  }


  //Hàm xử lý khi thay đổi tháng, quý, năm
  onMonthYearChange(number: number, string: 'month' | 'year' | 'quater') {
    if (string === 'month') {
      this.dashboardInput.Parameter.Month = number;
    } else if (string === 'quater') {
      this.dashboardInput.Parameter.Quarter = number;
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
        if (this.durationMethod == TypePeriodDashboardEnum.MONTH) {
          delete this.dashboardInput.Parameter.Quarter;
        } else if (this.durationMethod == TypePeriodDashboardEnum.QUARTER) {
          delete this.dashboardInput.Parameter.Month;
        }
      } else {
        this.listmonth = [...this.fullyearmonth];
        this.listquarter = [...this.fullQuarter];
        this.selectedMonth = this.currentMonth;
        this.dashboardInput.Parameter.Year = number;
        this.dashboardInput.Parameter.Month = this.currentMonth;
        const currentQuarter = Math.ceil((this.currentMonth + 1) / 3);
        this.dashboardInput.Parameter.Quarter = currentQuarter;
        this.selectedQuater = currentQuarter;
        if (this.durationMethod == TypePeriodDashboardEnum.MONTH) {
          delete this.dashboardInput.Parameter.Quarter;
        } else if (this.durationMethod == TypePeriodDashboardEnum.QUARTER) {
          delete this.dashboardInput.Parameter.Month;
        }
      }

    }
  }

  applyFilter() {
    this.headName = this.listHead.find(h => h.Code === this.duration.Head)?.BriefName || 'Tất cả';

    if (this.durationMethod == TypePeriodDashboardEnum.TODAY) {
      this.showToday = true;
      this.showYearQuater = false;
      this.showYearMonth = false;
      this.showFromDateToDate = false;
      this.showYear = false;
    }
    else if (this.durationMethod == TypePeriodDashboardEnum.DAY) {
      this.showToday = false;
      this.showYearQuater = false;
      this.showYearMonth = false;
      this.showYear = false;

      this.showFromDateToDate = true;

      const fromDate = new Date(this.dashboardInput.Parameter.FromDate);
      const toDate = new Date(this.dashboardInput.Parameter.ToDate);

      const formatDate = (date: Date): string => {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };

      const formattedFromDate = formatDate(fromDate);
      const formattedToDate = formatDate(toDate);

      this.formattedFromDate = formattedFromDate;
      this.formattedToDate = formattedToDate;

    } else if (this.durationMethod == TypePeriodDashboardEnum.MONTH) {
      this.showToday = false;
      this.showFromDateToDate = false;
      this.showYearQuater = false;
      this.showYear = false;
      this.showYearMonth = true;

      const month = this.dashboardInput.Parameter.Month;
      const year = this.dashboardInput.Parameter.Year;
      this.formattedYearmonth = `Tháng ${month.toString().padStart(2, '0')}/${year}`;

    } else if (this.durationMethod == TypePeriodDashboardEnum.QUARTER) {
      this.showToday = false;
      this.showFromDateToDate = false;
      this.showYearMonth = false;
      this.showYear = false;

      this.showYearQuater = true;
      const quarter = this.dashboardInput.Parameter.Quarter;
      const year = this.dashboardInput.Parameter.Year;
      this.formattedYearquater = `Quý ${quarter} - ${year}`;
    } else if (this.durationMethod == TypePeriodDashboardEnum.YEAR) {
      this.showToday = false;
      this.showFromDateToDate = false;
      this.showYearMonth = false;
      this.showYearQuater = false;
      this.showYear = true;
      const year = this.dashboardInput.Parameter.Year;
      this.formattedYear = `Năm ${year}`;
    }

    this.callDashboardGroup(this.dashboardInput);
    this.isOpenedFilter = false;
  }


  // Hàm để gọi API lấy dữ liệu dashboard cho từng phần
  private callDashboardGroup(parameter: DashboardInputDTO) {
    const parts = [
      this.listMethodEnum.slice(0, 2),  // Revenue + Inbound time-series
      this.listMethodEnum.slice(2, 4),  // RevenueStore/All + RevenuePercentageVehicle
      this.listMethodEnum.slice(4, 6),  // IIAllStore/Percentage + IIVehicle
    ];

    this.getMotorbikeOverview({
      ...parameter.Parameter,
    });
    for (const part of parts) {
      if (part.length === 0) continue;
      const input = {
        ...this.dashboardInput,
        Dashboard: part,
        Parameter: {
          ...parameter.Parameter,
        },
      };

      this.GetListDashboard(input);
    }
  }

  // Hàm để disable ngày bắt đầu và kết thúc
  public disabledStartDates = (date: Date): boolean => {
    return date > new Date(new Date().setDate(new Date().getDate() - 7));
  };
  public disabledEndDates = (date: Date): boolean => {
    return date > new Date();
  };

  public openFilterPopup(v: boolean) {
    this.isOpenedFilter = v;

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
  //Hàm xử lý nội dung nhãn của biểu đồ cột
  public labelFormatter = (e: any): string => {
    const value = e.value;

    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(0) + 'Tỷ';
    } else if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(0) + 'tr';
    } else if (value >= 1_000) {
      return (value / 1_000).toFixed(0) + 'K';
    }
    else {
      return value.toString();
    }
  };

  // Hàm xử lý các nhóm biểu đồ dựa trên ID
  // Hàm xử lý các nhóm biểu đồ dựa trên ID
  private dashboardHandlers: { [key: number]: (data: any[]) => void } = {
    // Chart 1 + 2 (Revenue + Inbound time-series)
    [DashboardEnum.RevenueDay]: this.handleChartTimeSeries.bind(this),
    [DashboardEnum.RevenueMonth]: this.handleChartTimeSeries.bind(this),
    [DashboardEnum.RevenueQuarter]: this.handleChartTimeSeries.bind(this),
    [DashboardEnum.RevenueYear]: this.handleChartTimeSeries.bind(this),
    [DashboardEnum.InboundDay]: this.handleChartTimeSeries.bind(this),
    [DashboardEnum.InboundMonth]: this.handleChartTimeSeries.bind(this),
    [DashboardEnum.InboundQuarter]: this.handleChartTimeSeries.bind(this),
    [DashboardEnum.InboundYear]: this.handleChartTimeSeries.bind(this),

    // Chart 3
    [DashboardEnum.RevenueStore]: this.handleChart3.bind(this),
    [DashboardEnum.RevenueAllStore]: this.handleChart3.bind(this),

    // Chart 4
    [DashboardEnum.RevenuePercentageVehicle]: this.handleChart4.bind(this),

    // Chart 5
    [DashboardEnum.IIAllStore]: this.handleChart5.bind(this),
    [DashboardEnum.IIPercentageVehicle]: this.handleChart5.bind(this),

    // Chart 6
    [DashboardEnum.IIVehicle]: this.handleChart6.bind(this),
  };

  // === Chart 1 + 2 (Revenue + Inbound time-series) ===
  private handleChartTimeSeries(data: any[]) {
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

    if (chart1Source) {
      this.chart1 = [...chart1Source.ListData];
      this.titleChart1 = chart1Source.Title;
    }
    if (chart2Source) {
      this.chart2 = [...chart2Source.ListData];
      this.titleChart2 = chart2Source.Title;
    }
  }

  // === Chart 3 ===
  private handleChart3(data: any[]) {
    const chartSource = data.find(d =>
      [DashboardEnum.RevenueStore, DashboardEnum.RevenueAllStore].includes(d.Type)
    );

    if (chartSource) {
      this.chart3_doanhthu = chartSource.ListData.map((item: any) => {
        const doanhthu = item.ListData.find((d: any) => d.Type === 1);
        return {
          Title: item.Title,
          Value: doanhthu?.Value ?? 0
        };
      });

      this.chart3_thucthu = chartSource.ListData.map((item: any) => {
        const thucthu = item.ListData.find((d: any) => d.Type === 2);
        return {
          Title: item.Title,
          Value: thucthu?.Value ?? 0
        };
      });

      this.titleChart3 = chartSource.Title;
      this.totalDoanhThuChart3 = this.chart3_doanhthu.reduce((sum, item) => sum + (item.Value || 0), 0);
      this.totalThucThuChart3 = this.chart3_thucthu.reduce((sum, item) => sum + (item.Value || 0), 0);
      this.formattedTotalDoanhThuChart3 = this.formatCurrencyVN(this.totalDoanhThuChart3);
      this.formattedTotalThucThuChart3 = this.formatCurrencyVN(this.totalThucThuChart3);
    }
  }

  // === Chart 4 ===
  private handleChart4(data: any[]) {
    const chartSource = data.find(d => d.Type === DashboardEnum.RevenuePercentageVehicle);

    if (chartSource) {
      this.chart4 = [...chartSource.ListData];
      this.titleChart4 = chartSource.Title;
    }
  }

  private handleChart5(data: any[]) {
    const chartSource = data.find(d =>
      [DashboardEnum.IIAllStore, DashboardEnum.IIPercentageVehicle].includes(d.Type)
    );

    if (!chartSource) return;
    const listData = chartSource.ListData ?? [];

    // DATA CHART 5
    this.chart5_nhaphang = listData.map(item => {
      const nhapHang = item.ListData.find(d => d.Type === 1);
      return { Title: item.Title, Value: nhapHang?.Value ?? 0 };
    });

    this.chart5_tondaban = listData.map(item => {
      const tonKhodaban = item.ListData.find(d => d.Type === 2);
      return { Title: item.Title, Value: tonKhodaban?.Value ?? 0 };
    });

    this.chart5_tonchuaban = listData.map(branch => {
      const tonchuaban = branch.ListData.find(d => d.Type === 3);
      return { Title: branch.Title, Value: tonchuaban?.Value ?? 0 };
    });

    this.chart5_pieChart = listData.map((item: any): DashboardDTO => {
      const nhapHang = item.ListData.find((d: any) => d.Type === 1);
      const tonKho = item.ListData.find((d: any) => d.Type === 2);
      return {
        ...item,
        Value: tonKho?.Percentage ?? 0,
        Percentage: nhapHang?.Percentage ?? 0,
      };
    });

    this.titleChart5 = chartSource.Title ?? '';
    this.typechart5 = chartSource.Type ?? null;

    // Tổng
    this.totalInboundChart5 = listData.reduce(
      (sum, branch) => sum + (branch.ListData.find(d => d.Type === 1)?.Value ?? 0),
      0
    );

    this.totalInStockChart5 = listData.reduce(
      (sum, branch) =>
        sum +
        (branch.ListData.find(d => d.Type === 2)?.Value ?? 0) +
        (branch.ListData.find(d => d.Type === 3)?.Value ?? 0),
      0
    );
  }

  private handleChart6(data: any[]) {
    const chartSource = data.find(d => d.Type === DashboardEnum.IIVehicle);

    if (!chartSource) return;
    const listData = chartSource.ListData ?? [];

    // DATA CHART 6
    this.chart6_nhaphang = listData.map((item: any): DashboardDTO => {
      const nhapHang = item.ListData.find((d: any) => d.Type === 1);
      return { ...item, Value: nhapHang?.Value ?? 0 };
    });

    this.chart6_tondaban = listData.map((item: any): DashboardDTO => {
      const tondaban = item.ListData.find((d: any) => d.Type === 2);
      return { ...item, Value: tondaban?.Value ?? 0 };
    });

    this.chart6_tonchuaban = listData.map(branch => {
      const tonchuaban = branch.ListData.find(d => d.Type === 3);
      return { Title: branch.Title, Value: tonchuaban?.Value ?? 0 };
    });

    this.titleChart6 = chartSource.Title ?? '';
  }


  //Hàm xử lý nội dung nhãn của biểu đồ tròn
  public labelContentdonut = (e: any): string => {
    const title = e.category;
    const percentage = e.dataItem.Percentage;
    return `${title} \n (${percentage}%)`;
  };


  //#region CALL API
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
    var temp = this.configCache.GetListLSList(LSListTypeDataEnum.DurationMethod).subscribe((data) => {
      this.listpaymentmethod = data;
      this.subLoader.loader(false);
    }, (err) => {
      this.subLoader.loader(false);
      this.notification.onError(`Lỗi lấy danh sách hình thức : ${err.message || err}`);
    });
    this.arrUnsubscribe.push(temp);
  }

  private getMotorbikeOverview(param: ParameterDTO) {
    this.subLoader.loader(true);
    var temp = this.mtbikeapi.GetMotorbikeOverview(param).subscribe((res) => {
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
    const temp = this.mtbikeapi.GetListDashboard(param).subscribe({
      next: (res) => {
        if (res.StatusCode === 0) {
          this.dashboard = res.ObjectReturn;

          // Xác định handler từ ID đầu tiên (giả sử mảng luôn có ít nhất 1 ID)
          const firstId = param.Dashboard[0];
          // console.log(firstId);
          const handler = this.dashboardHandlers[firstId];

          if (handler) {
            handler(this.dashboard);
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
