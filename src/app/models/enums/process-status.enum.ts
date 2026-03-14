export enum ProcessStatusEnum {
  NEW = 1,
  SENT = 2,
  NOTAPPROVED = 3,
  APPROVED = 4,
  STOP = 5,
  RETURN = 6
}

export const ProcessStatusConfig: Record<ProcessStatusEnum, any> = {
  [ProcessStatusEnum.NEW]: { id: ProcessStatusEnum.NEW, text: 'Tạo mới', active: true },
  [ProcessStatusEnum.SENT]: { id: ProcessStatusEnum.SENT, text: 'Gửi duyệt', active: true },
  [ProcessStatusEnum.NOTAPPROVED]: { id: ProcessStatusEnum.NOTAPPROVED, text: 'Không duyệt', active: true },
  [ProcessStatusEnum.APPROVED]: { id: ProcessStatusEnum.APPROVED, text: 'Duyệt', active: false },
  [ProcessStatusEnum.STOP]: { id: ProcessStatusEnum.STOP, text: 'Ngưng áp dụng', active: false },
  [ProcessStatusEnum.RETURN]: { id: ProcessStatusEnum.RETURN, text: 'Trả về', active: false },
}