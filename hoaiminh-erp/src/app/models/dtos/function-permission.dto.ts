import { PsArray } from "src/app/services/utilities/ps-array";
import { PermissionEnum } from "../enums/permission.enum";
import { PermissionDLLDTO } from "./permission-dll.dto";

export class FunctionPermissionDTO {
  // call function.master = true/false
  // chức năng phân theo vai trò
  public static master: boolean = false;
  public static creator: boolean = false;
  public static approver: boolean = false;
  public static viewer: boolean = false;
  public static datapermission: any[] = [];

  public static set(e: PermissionDLLDTO) {
    if (!e || !e.ActionPermission) {
      this.master = false;
      this.creator = false;
      this.approver = false;
      this.viewer = false;
      this.datapermission = [];
      return;
    }

    this.master = e.ActionPermission.some(s => s.ActionType == PermissionEnum.master);
    this.creator = e.ActionPermission.some(s => s.ActionType == PermissionEnum.creator);
    this.approver = e.ActionPermission.some(s => s.ActionType == PermissionEnum.approver);
    this.viewer = e.ActionPermission.some(s => s.ActionType == PermissionEnum.viewer);

    if (PsArray.any(e.ActionPermission)) {
      this.datapermission = e.ActionPermission[0].DataPermission
    }
  }
}
