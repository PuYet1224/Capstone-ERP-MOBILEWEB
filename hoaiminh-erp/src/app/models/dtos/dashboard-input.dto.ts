import { DashboardEnum } from "../enums/e-type/dashboard.enum";
import { ParameterDTO } from "./parameter.dto";

export class DashboardInputDTO {
    Dashboard: DashboardEnum[];
    Parameter: ParameterDTO
}