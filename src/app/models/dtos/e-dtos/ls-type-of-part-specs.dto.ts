export class LSTypeOfPartSpecsDTO {
    Code: number = 0;
    TypeOfPart: number;
    TypeOfPartSpecs: string = '';
    Description: string = '';
    TypeData: number;
    CreatedBy: string = '';
    CreateTime: Date | string;
    LastModifiedBy: string = '';
    LastModifiedTime: Date | string;
}

export class LSTypeOfSpecsCusDTO extends LSTypeOfPartSpecsDTO {}
