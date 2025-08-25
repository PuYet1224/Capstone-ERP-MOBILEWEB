export class HREmployeeDTO {
  Code: number = 0;
}

export class HREmployeeCusDTO extends HREmployeeDTO {
  FullName?: string = '';
  PositionName?: string = '';
  DepartmentName?: string = '';
}