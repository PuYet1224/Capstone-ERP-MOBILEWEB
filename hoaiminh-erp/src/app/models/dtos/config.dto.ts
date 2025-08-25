import { BehaviorSubject } from 'rxjs';
import { StaffDTO } from './user.dto';
import { LSHeadCusDTO } from './e-dtos/ls-head.dto';
import { TokenDTO } from './token.dto';
import { FunctionPermissionDTO } from './function-permission.dto';

export class ConfigDTO {
    static token: TokenDTO;
    static userinfo: StaffDTO
    static head: LSHeadCusDTO
    static dllpackage: string;
    static refreshingTokens: boolean = false;
    static refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
}