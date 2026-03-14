import { LSTypeOfPartnerEnum } from "../../enums/e-status/ls-type-of-status.enum";
import { ProcessStatusEnum } from "../../enums/process-status.enum";

export class LSTypeOfPartnerDTO {
    Code: number = 0;
    Partner: number = 0;
    TypeData: LSTypeOfPartnerEnum = LSTypeOfPartnerEnum.Supplier;
    ID: string = '';
    Name: string = '';
    Phone: string = '';
    IsHonda: boolean;
    Fax: string = '';
    Email: string = '';
    Occupation: number;
    PartnerConfig: string = '';
    Status: ProcessStatusEnum = ProcessStatusEnum.NEW;
    CreatedBy: string = '';
    CreateTime: Date | string;
    LastModifiedBy: string = '';
    LastModifiedTime: Date | string;
}

export class LSTypeOfPartnerCusDTO extends LSTypeOfPartnerDTO {
    StatusName: string = '';
}
