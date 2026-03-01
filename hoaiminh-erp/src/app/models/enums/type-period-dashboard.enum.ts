export enum TypePeriodDashboardEnum {
    DAY = 1,
    MONTH = 2,
    QUARTER = 3,
    YEAR = 4,
    TODAY = 5,
}
export const TypePeriodDashboardEnumConfig: Record<TypePeriodDashboardEnum, { Code: number; Name: string }> = {
    [TypePeriodDashboardEnum.DAY]: { Code: TypePeriodDashboardEnum.DAY, Name: 'Ngày' },
    [TypePeriodDashboardEnum.MONTH]: { Code: TypePeriodDashboardEnum.MONTH, Name: 'Tháng' },
    [TypePeriodDashboardEnum.QUARTER]: { Code: TypePeriodDashboardEnum.QUARTER, Name: 'Quý' },
    [TypePeriodDashboardEnum.YEAR]: { Code: TypePeriodDashboardEnum.YEAR, Name: 'Năm' },
    [TypePeriodDashboardEnum.TODAY]: { Code: TypePeriodDashboardEnum.YEAR, Name: 'Hôm nay' },
};
