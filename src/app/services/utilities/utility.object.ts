export class Ps_UtilObjectService {
  //hàm kiểm tra giá trị
  public static hasValue(value: any): boolean {
    return !(value === undefined || value === null);
  }
  //hàm kiểm tra giá trị mảng
  public static hasListValue(value: any): boolean {
    return !(value === undefined || value === null || value === <any>[] || value.length === 0) && Array.isArray(value);
  }
  //hàm kiểm tra giá trị chuỗi
  public static hasValueString(value: any): boolean {
    return !(value === undefined || value === null || value === "" || value.length === 0 ||
      (typeof value === 'string' && (value.trim() === "" || value.trim().length === 0)));
  }
  //hàm kiểm tra ngày hợp lệ
  public static isValidDate(value: any): boolean {
    return (
      this.hasValueString(value) && isNaN(value)
      && (value instanceof Date || new Date(value) instanceof Date)
    )
      && (
        !isNaN(value.valueOf()) || !isNaN(new Date(value).valueOf())
      )
  }
  //hàm kiểm tra ngày hợp lệ value có kiểu là ngày hoặc chuỗi
  public static isValidDate2(value: Date | string): boolean {
    // var rs1 = hasValueString(value)
    // var rs2 = isNaN(value)
    // var rs21 = Number.isNaN(value)
    var rs22 = isNaN(+value)
    var rs23 = Number.isNaN(+value)
    // var rs3 = value instanceof Date
    // var rs4 = new Date(value) instanceof Date
    // var rs5 = Number.isNaN(value.valueOf())
    // var rs6 = Number.isNaN(new Date(value).valueOf())

    //nếu là Date hoặc string
    if (value instanceof Date || typeof value === 'string')//dùng Number.isNaN(+) để check có phải khác số VÀ có
      return (
        this.hasValueString(value) && isNaN(+value)
        && (value instanceof Date || new Date(value) instanceof Date)
      )
        && (
          // !Number.isNaN(value.valueOf()) || !Number.isNaN(new Date(value).valueOf())
          !isNaN(+value.valueOf()) || !isNaN(new Date(value).valueOf())
        )
    else
      return false
  }
  //hàm chuyển ngày thành chuỗi
  public static parseDateToString = function (key, value, dateArr: string[] = []) {
    if (this.isValidDate(value)) {
      if (dateArr.findIndex(s => s == key) != -1) {
        var date = new Date(value)
        date.setHours(0)
        date.setMinutes(0)
        date.setSeconds(0)
        return date.toDateString()
      }
    }
    return value;
  }
  //hàm chuyển ngày giờ địa phương thành chuỗi
  public static parseLocalDateTimeToString = function (key, value, dateArr: string[] = [], dateTimeArr: string[] = []) {
    if (this.isValidDate(value)) {

      if (dateTimeArr.findIndex(s => s == key) != -1)
        return new Date(value).toDateString() + " " + new Date(value).toLocaleTimeString([], { hour12: false })
      else if (dateArr.findIndex(s => s == key) != -1) {
        var date = new Date(value)
        date.setHours(0)
        date.setMinutes(0)
        date.setSeconds(0)
        return date.toDateString()
      }
    }
    return value;
  }
  //hàm chuyển giở địa phương thành chuỗi
  public static parseLocalTimeToString = function (key, value, timeArr: string[] = []) {
    if (this.isValidDate(value)) {
      if (timeArr.findIndex(s => s == key) != -1)
        return new Date(value).toLocaleTimeString([], { hour12: false })
    }
    return value;
  }
  //hàm lấy tên file từ chuỗi blob


  //hàm download file excel từ response dạng blob
  /**
   * 
   * @param res response của api xuất trả về
   * @param getfileName tên file muốn xuất
   * @param typeExport 0: xlsx | 1: docx  
   */

  //hàm thêm ngày

  //hàm thêm giờ

  //hàm thêm phút

  //hàm trừ ngày

  //hàm trừ giờ

  //hàm trừ phút

  //hàm tìm số ngày chênh lệch giữa 2 ngày

  //hàm tìm số ngày còn lại giữa 2 ngày

  //hàm sao chép từ fromObj sang toObj nếu trường p tồn tại
  public static copyProperty(fromObj, toObj, props?: string[]) {
    for (const p in this.hasListValue(props) ? props : fromObj) {
      toObj[p] = (p in toObj ? fromObj : toObj)[p];
    }
  }
  //hàm sao chép từ fromObj sang toObj, nếu trường p ko tồn tại thì tạo p trong toObj
  public static copyPropertyForce(fromObj, toObj, props?: string[]) {
    for (const p in this.hasListValue(props) ? props : fromObj)
      toObj[p] = fromObj[p];
  }
  //hàm sao chép từ fromObj sang toObj ngoại trừ các trường
  public static copyPropertyExcept(fromObj, toObj, props: string[]) {
    for (const p in fromObj) {
      toObj[p] = (!(p in props) && p in toObj ? fromObj : toObj)[p];
    }
  }
  //hàm callback thoát khỏi RegEx để dùng cho replaceAll
  public static escapeRegExp(string) {
    return string.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
  }
  //hàm thay tất cả chuỗi 
  public static replaceAll(str, find, replace) {
    return str.replaceAll(new RegExp(this.escapeRegExp(find), 'g'), replace);
  }
  //hàm yêu cầu directive @Input phải được truyền giá trị vào
  public static Required(target: object, propertyKey: string) {
    Object.defineProperty(target, propertyKey, {
      get() {
        throw new Error(`Attribute ${propertyKey} is required on class ${target.constructor.name}`);
      },
      set(value) {
        Object.defineProperty(target, propertyKey, {
          value,
          writable: true,
          configurable: true,
        });
      },
      configurable: true
    });
  }

  /**
   * Hàm so sách 2 chuỗi
   * @param text trường dữ liệu string muốn so sánh với keyword
   * @param keyword keyword
   * @returns true | false
   */
  public static containsString(text: string, keyword: string): boolean {
    const normalizedText = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const normalizedTerm = keyword.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    return normalizedText.includes(normalizedTerm);
  }

  /**
   * Biểu thức chính quy để kiểm tra email
   * @param email cung cấp email cho hàm
   * @returns true | false
   */
  public static isValidEmail(email: string) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(String(email).toLowerCase());
  }

  public static isValidPhone(phone: string) {
    const regexPhone = /^(0|\+84)[1-9]\d{8,9}$/;
    return regexPhone.test(phone);
  }

  public static transformHtmlToString(html: string) {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  }

}