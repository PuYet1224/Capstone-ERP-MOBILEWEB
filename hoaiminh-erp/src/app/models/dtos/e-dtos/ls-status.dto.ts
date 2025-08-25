export class LSStatusDTO {
    Code: number = 0;
    StatusName: string;
    TypeOfStatus: number;
    TypeData: number;
    ParentID: number = 0;
    Remark: string = '';
    CreatedBy: string = '';
    CreateTime: string | Date;
    LastModifiedBy: string = '';
    LastModifiedTime: Date | string;
}

export class LSStatusCusDTO extends LSStatusDTO {
    IsActive: boolean;
    ListStatus: LSStatusDTO[] = [];
}