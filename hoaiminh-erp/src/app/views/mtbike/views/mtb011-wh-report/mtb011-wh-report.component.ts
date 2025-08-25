import { Component, OnInit } from '@angular/core';
import { PSGetConfigService } from 'src/app/services/core/ps-get-config.service';

@Component({
  selector: 'mtb011-wh-report',
  templateUrl: './mtb011-wh-report.component.html',
  styleUrls: ['./mtb011-wh-report.component.scss'],
})
export class Mtb011WhReportComponent implements OnInit {
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
