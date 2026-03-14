export enum WHIOMasterStatusEnum {
  NEW = 1, //14 
  SENT = 2,
  PENDING = 3, //16
  RECEIVING = 4, //17
  DONE = 5, //18
}

export const IOStatusConfig: Record<WHIOMasterStatusEnum, any> = {
  [WHIOMasterStatusEnum.NEW]: { id: WHIOMasterStatusEnum.NEW, text: 'Đang tạo nháp', active: false },
  [WHIOMasterStatusEnum.SENT]: { id: WHIOMasterStatusEnum.SENT, text: 'Đang đề nghị', active: true },
  [WHIOMasterStatusEnum.PENDING]: { id: WHIOMasterStatusEnum.PENDING, text: 'Chờ giao nhận', active: true },
  [WHIOMasterStatusEnum.RECEIVING]: { id: WHIOMasterStatusEnum.RECEIVING, text: 'Đang giao nhận', active: true },
  [WHIOMasterStatusEnum.DONE]: { id: WHIOMasterStatusEnum.DONE, text: 'Hoàn tất', active: false },
}