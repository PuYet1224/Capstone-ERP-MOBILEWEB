import { Component } from '@angular/core';
import { LSPartCategoryTypeDataEnum } from 'src/app/models/enums/e-type/ls-part-category-type-data.enum';

@Component({
  selector: 'mtb014-category',
  templateUrl: './mtb014-category.component.html',
  styleUrls: ['./mtb014-category.component.scss'],
})

export class Mtb014CategoryComponent {
  constructor() { }
  public LSPartCategoryTypeDataEnum = LSPartCategoryTypeDataEnum;
}

