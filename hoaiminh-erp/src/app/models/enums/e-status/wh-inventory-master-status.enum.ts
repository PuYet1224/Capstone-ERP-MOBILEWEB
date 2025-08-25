export enum InventoryMasterStatusEnum {
  NEW = 1,
  DOING = 2,
  DONE = 3,
  CANCLE = 4
}

export const InventoryMasterStatusConfig: Record<InventoryMasterStatusEnum, any> = {
  [InventoryMasterStatusEnum.NEW]: { id: InventoryMasterStatusEnum.NEW, text: 'Đang lập kế hoạch', active: true },
  [InventoryMasterStatusEnum.DOING]: { id: InventoryMasterStatusEnum.DOING, text: 'Đang kiểm kê', active: true },
  [InventoryMasterStatusEnum.DONE]: { id: InventoryMasterStatusEnum.DONE, text: 'Hoàn tất', active: false },
  [InventoryMasterStatusEnum.CANCLE]: { id: InventoryMasterStatusEnum.CANCLE, text: 'Huỷ kiểm kê', active: false }
}