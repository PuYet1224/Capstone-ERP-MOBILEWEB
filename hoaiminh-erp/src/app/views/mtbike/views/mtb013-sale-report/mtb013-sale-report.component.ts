import { Component, OnInit } from '@angular/core';
import { PSGetConfigService } from 'src/app/services/core/ps-get-config.service';

@Component({
  selector: 'mtb013-sale-report',
  templateUrl: './mtb013-sale-report.component.html',
  styleUrls: ['./mtb013-sale-report.component.scss'],
})

export class Mtb013SaleReportComponent implements OnInit {
  constructor(
    private config: PSGetConfigService,
  ) { }
  public dll_pakage: any
  ngOnInit(): void {
    this.dll_pakage = this.getDefaultDLLPackage();
  }
  private getDefaultDLLPackage() {
    return this.config.GetDLL();
  }
}

