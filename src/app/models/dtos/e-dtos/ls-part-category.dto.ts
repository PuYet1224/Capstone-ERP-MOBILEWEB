export class LSPartCategoryDTO {
  Code: number = 0;
  Category: string;
  Description: string = '';
  OrderBy: number;
  TypeData: number = 1;
  CreateBy: string;
  CreateTime: string | Date;
  LastModifiedBy: string = '';
  LastModifiedTime: Date | string = new Date();
}

export class LSPartCategoryCusDTO extends LSPartCategoryDTO {
  IsModify: boolean = true;
}
