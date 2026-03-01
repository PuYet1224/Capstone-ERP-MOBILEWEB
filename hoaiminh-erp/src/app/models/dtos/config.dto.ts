import { BehaviorSubject } from 'rxjs';
import { HREmployeeCusDTO } from './e-dtos/hr-employee.dto';
import { LSHeadCusDTO } from './e-dtos/ls-head.dto';
import { TokenDTO } from './token.dto';

export class ConfigDTO {
    static token: TokenDTO;
    static userinfo: HREmployeeCusDTO
    static head: LSHeadCusDTO
    static dllpackage: string;
    static refreshingTokens: boolean = false;
    static refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
}