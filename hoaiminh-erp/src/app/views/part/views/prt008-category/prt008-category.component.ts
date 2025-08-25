import { Component } from "@angular/core";
import { LSPartCategoryTypeDataEnum } from "src/app/models/enums/e-type/ls-part-category-type-data.enum";

@Component({
  selector: 'prt008-category',
  templateUrl: './prt008-category.component.html',
  styleUrls: ['./prt008-category.component.scss'],
})
export class Prt008CategoryComponent {
  public LSPartCategoryTypeDataEnum = LSPartCategoryTypeDataEnum;
}
