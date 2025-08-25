import { HRListOrderByEnum } from "../../enums/e-type/hr-list-order-by.enum";

export class CSLoyalCustomerDTO {
    Code: number = 0;
    CardNo: string;
    FirstName: string;
    MidleName: string;
    LastName: string;
    FullName: string = "";
    BirthDay: number;
    BirthMonth: number;
    BirthYear: number;
    BirthDate: Date | string;
    Gender: HRListOrderByEnum = HRListOrderByEnum.MALE;
    Province: number;
    District: number;
    Ward: number;
    Address: string = '';
    FullAddress: string = '';
    Cellphone1: string = '';
    Cellphone2: string = '';
    Cellphone3: string = '';
    Email: string = '';
    Occupation: number;
    FirstHead: number;
    CurrentPoint: number;
    CurrentDiscount: number;
    StartDiscountDate: Date | string;
    FinishDiscountDate: Date | string;
    TypeSMS: number;
    StatusID: number;
    TypeData: number;
    CreatedBy: string = '';
    CreateTime: string | Date;
    LastModifiedBy: string = '';
    LastModifiedTime: Date | string;
}

export class CSLoyalCustomerCusDTO extends CSLoyalCustomerDTO {
}