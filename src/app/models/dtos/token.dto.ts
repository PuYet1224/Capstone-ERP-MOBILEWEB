import { BaseDTO } from './base.dto';

export class TokenDTO extends BaseDTO {
    access_token: string;
    expires_in: number;
    time_expired: Date;
    token_type: string;
    refresh_token: string;
    is_mock?: boolean;
    username?: string;
    clearData?: Function = () => {
        this.access_token = "";
        this.expires_in = 0;

        this.token_type = "";
        this.refresh_token = "";
    }
}