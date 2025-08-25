export class DashboardDTO {
    Title: string;
    Type: number;
    Value: number = 0;
    Color: string;
    Percentage: number;
    ListData: DashboardDTO[];
}