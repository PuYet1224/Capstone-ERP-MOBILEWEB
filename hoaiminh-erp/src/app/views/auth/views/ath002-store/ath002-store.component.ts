import { Component, OnInit } from '@angular/core';
import { AuthApiService } from '../../services/auth-api.service';
import { LSHeadCusDTO } from 'src/app/models/dtos/e-dtos/ls-head.dto';
import { PSArray } from 'src/app/services/utilities/ps-array';
import { ConfigDTO } from 'src/app/models/dtos/config.dto';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PsCache } from 'src/app/services/utilities/ps-cache';

@Component({
  selector: 'ath002-store',
  templateUrl: './ath002-store.component.html',
  styleUrls: ['./ath002-store.component.scss']
})

export class Ath002StoreComponent implements OnInit {
  constructor(
    private api: AuthApiService
  ) { }

  ngOnInit(): void {
    this.getListHead();
  }

  public listHead: LSHeadCusDTO[] = [];

  public getListHead() {
    let temp = this.api.GetHead().subscribe(res => {
      if (res.StatusCode == 0) {
        this.listHead = res.ObjectReturn;
      }
    })
  }
}
