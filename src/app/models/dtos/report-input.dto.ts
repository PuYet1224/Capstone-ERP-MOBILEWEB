import { SYSDataDTO } from "./e-dtos/sys-data.dto";
import { ParameterDTO } from "./parameter.dto";

export class ReportInputDTO {
    Report: SYSDataDTO;
    Parameter: ParameterDTO = new ParameterDTO()
}