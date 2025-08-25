export class PSDate {
  public static addDays = function (date: Date, d) {
    var newDate = new Date(date)
    newDate.setTime(newDate.getTime() + (d * 24 * 60 * 60 * 1000));
    return newDate;
  }

  public static addHours = function (date: Date, h) {
    var newDate = new Date(date)
    newDate.setTime(newDate.getTime() + (h * 60 * 60 * 1000));
    return newDate;
  }

  public static addMinutes = function (date: Date, m) {
    var newDate = new Date(date)
    newDate.setTime(newDate.getTime() + (m * 60 * 1000));
    return newDate;
  }

  public static subtractDays = function (date: Date, d) {
    var newDate = new Date(date)
    newDate.setTime(newDate.getTime() - (d * 24 * 60 * 60 * 1000));
    return newDate;
  }

  public static subtractHours = function (date: Date, h) {
    var newDate = new Date(date)
    newDate.setTime(newDate.getTime() - (h * 60 * 60 * 1000));
    return newDate;
  }

  public static subtractMinutes = function (date: Date, m) {
    var newDate = new Date(date)
    newDate.setTime(newDate.getTime() - (m * 60 * 1000));
    return newDate;
  }

  public static getDaysDiff(date1: Date | string, date2: Date | string): number {
    return Math.abs(new Date(date1).valueOf() - new Date(date2).valueOf()) / (1000 * 60 * 60 * 24);
  }

  public static getDaysLeft(start: Date | string, end: Date | string): number {
    return (new Date(end).valueOf() - new Date(start).valueOf()) / (1000 * 60 * 60 * 24);
  }

  public static setHours(date: Date, hours: number, min?: number, sec?: number, ms?: number) {
    date.setHours(hours, min, sec, ms);
    return this.addHours(date, -(new Date().getTimezoneOffset() / 60));
  }

  public static getYears(max: number = null) {
    const years: number[] = [];
    for (let year = max != null ? max : 2099; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  }

  public static getDays(month: number, year: number): number[] {
    const lastDay = new Date(year, month, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  }

  public static adjustToMonday(date: Date): Date {
    const day = date.getDay();
    const adjustedDate = new Date(date);

    if (day === 6) {
      adjustedDate.setDate(date.getDate() + 2);
    } else if (day === 0) {
      adjustedDate.setDate(date.getDate() + 1);
    }

    return adjustedDate;
  }
}