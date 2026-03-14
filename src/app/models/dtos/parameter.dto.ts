import { LSListTypeOfListEnum } from "../enums/e-type/ls-list-type-of-list.enum";

export class ParameterDTO {
    Year?: number;
    Month?: number;
    Quarter?: number;
    FromDate?: Date;
    ToDate?: Date;
    Date?: Date;
    Head?: number;
    Type?: LSListTypeOfListEnum;
    DLLPackage?: string;
}