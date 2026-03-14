export class PSObject {
  public static isNullOfUndefined(obj: any): boolean {
    return obj == null || obj == undefined;
  }
}