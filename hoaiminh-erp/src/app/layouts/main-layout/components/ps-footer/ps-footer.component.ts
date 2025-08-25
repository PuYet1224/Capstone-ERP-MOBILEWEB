import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'ps-footer',
    templateUrl: './ps-footer.component.html',
    styleUrls: ['./ps-footer.component.scss']
})
export class PsFooterComponent implements OnInit {
    private timer: any;
    current_time: string = '';
    public ngExpanded: boolean = true;

    constructor() { }

    ngOnInit() {
        this.update_time();
        this.timer = setInterval(() => {
            this.update_time();
        }, 1000);
    }

    ngOnDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    update_time(): void {
        var now_date = new Date();
        var week = ['Chủ Nhật', 'Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy'];
        this.current_time = `${now_date.getDay() != 0 ? 'Thứ ' : ''} ${week[now_date.getDay()]}, 
            ngày ${now_date.getDate() >= 10 ? '' : '0'}${now_date.getDate()} 
            tháng ${now_date.getMonth() + 1 >= 10 ? '' : '0'}${now_date.getMonth() + 1} 
            năm ${now_date.getFullYear()}`;
    }
}