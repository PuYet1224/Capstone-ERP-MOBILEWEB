export enum WHIOMasterTypeOfMasterEnum {
    Internal = 1,
    Supplier = 2,
    AfterStock = 3,
    Other = 4
}

export const WHIOMasterTypeOfMasterConfig: Record<WHIOMasterTypeOfMasterEnum, { id: number; text: string; active: boolean }> = {
    [WHIOMasterTypeOfMasterEnum.Internal]: { id: WHIOMasterTypeOfMasterEnum.Internal, text: 'Điều chuyển nội bộ', active: true },
    [WHIOMasterTypeOfMasterEnum.Supplier]: { id: WHIOMasterTypeOfMasterEnum.Supplier, text: 'Từ nhà cung cấp', active: true },
    [WHIOMasterTypeOfMasterEnum.AfterStock]: { id: WHIOMasterTypeOfMasterEnum.AfterStock, text: 'Điều chỉnh sau kiểm kê', active: true },
    [WHIOMasterTypeOfMasterEnum.Other]: { id: WHIOMasterTypeOfMasterEnum.Other, text: 'Khác', active: true }
};
