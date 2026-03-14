
export class PsArray {
  public static isNullOrEmpty<T>(arr?: Array<T>): boolean {
    return arr == null || arr == undefined || arr.length == 0;
  }

  public static any<T>(arr: Array<T>, predicate?: (item: T) => boolean): boolean {
    if (arr == null || arr == undefined || arr.length == 0) {
      return false;
    }
    else {
      if (predicate != undefined)
        return arr.some(predicate);
      else
        return true;
    }
  }

  public static count<T>(arr: Array<T>, predicate?: (item: T) => boolean): number {
    if (this.isNullOrEmpty(arr)) {
      return 0;
    } else {
      return predicate ? arr.filter(predicate).length : arr.length;
    }
  }

  public static areEqual(arr1: number[], arr2: number[]): boolean {
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    if (set1.size !== set2.size)
      return false;

    for (let val of set1) {
      if (!set2.has(val)) return false;
    }

    return true;
  }
}