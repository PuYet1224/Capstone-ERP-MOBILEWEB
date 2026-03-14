import { SALOrderInvoiceTypeDataEnum } from "../../enums/e-type/sal-order-invoice-type-data.enum";
import { SALOrderInvoiceVATTypeEnum } from "../../enums/e-type/sal-order-invoice-vat-type.enum";

class SALOrderInvoiceDTO {
  Code: number = 0;
  Head: number;
  OrderMaster: number;
  InvoiceNo: string = '';
  InvoiceSerial: string = '';
  EffDate: Date;
  VATAmount: number;
  DiscountPercent: number;
  DiscountAmount: number;
  DiscountReason: string = '';
  TotalAmount: number = 0;
  TypeData: SALOrderInvoiceTypeDataEnum;
  VATCustomer: number;
  VATCustomerName: string = '';
  VATCellPhone: string = '';
  VATPassport: string = '';
  VATEmail: string = '';
  VATCompanyName: string = '';
  VATCompanyTax: string = '';
  VATBRUName: string = '';
  VATBRUCode: string = '';
  VATAddress: string = '';
  VATNote: string = '';
  Status: any = 1;
  Signature: string = '';
  CreatedTime: Date;
  CreatedBy: string = '';
  LastModifiedTime: Date;
  LastModifiedBy: string = '';
  VATType: SALOrderInvoiceVATTypeEnum = SALOrderInvoiceVATTypeEnum.Personal;
}

export class SALOrderInvoiceCusDTO extends SALOrderInvoiceDTO {
  OrderInvoice: number = 0;
  NumOfReceipt: number = 0;
  StatusName: string = '';
}