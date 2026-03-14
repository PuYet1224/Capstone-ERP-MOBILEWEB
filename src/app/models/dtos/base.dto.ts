import { PSObject } from "src/app/services/utilities/ps-object";

export class BaseDTO {

    constructor(opt?: any) {
        if (!PSObject.isNullOfUndefined(opt)) {
            let that = this;
            for (let key in opt) {
                that[key] = opt[key];
            }
        }
    }
}
