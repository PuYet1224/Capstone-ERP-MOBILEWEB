export enum TypeDuration {
    DAY = 1,
    MONTH = 2,
    QUARTER = 3,
    YEAR = 4
}
export const TypeDurationConfig: Record<TypeDuration, { Code: number; Name: string }> = {
    [TypeDuration.DAY]: { Code: TypeDuration.DAY, Name: 'Ngày' },
    [TypeDuration.MONTH]: { Code: TypeDuration.MONTH, Name: 'Tháng' },
    [TypeDuration.QUARTER]: { Code: TypeDuration.QUARTER, Name: 'Quý' },
    [TypeDuration.YEAR]: { Code: TypeDuration.YEAR, Name: 'Năm' },
};
