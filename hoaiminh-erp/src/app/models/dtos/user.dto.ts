import { BaseDTO } from './base.dto';

export default class Urder extends BaseDTO {
    Code: number;
    StaffID: string;
    LastName: string;
    MiddleName: string;
    FirstName: string;
    FullName: string;
    BriefName: string;
    ImageURL: string;
    FirstViews: string;
}

export class StaffDTO {
    defaultURL: string = ''
    email: string = ""
    fullName: string = ""
    phoneNumber: string = ""
    staffID: number = null
    userName: string = ""
}