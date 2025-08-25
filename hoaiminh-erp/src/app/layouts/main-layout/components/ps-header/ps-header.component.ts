import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { PSHeaderService } from '../../services/ps-header.service';
import { PSCache } from 'src/app/services/utilities/ps-cache';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';
import { PSArray } from 'src/app/services/utilities/ps-array';
import { Router } from '@angular/router';
import { PSKendoNotificationService } from 'src/app/services/core/ps-kendo-notification.service';
import { AuthService } from 'src/app/services/auth/auth.service';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { TextBoxComponent } from '@progress/kendo-angular-inputs';
import { ConfigDTO } from 'src/app/models/dtos/config.dto';
import { LSHeadCusDTO } from 'src/app/models/dtos/e-dtos/ls-head.dto';
import { LayoutApiService } from 'src/app/services/layout/layout-api.service';
import { SYSModuleCusDTO } from 'src/app/models/dtos/e-dtos/sys-module.dto';
import { PSObject } from 'src/app/services/utilities/ps-object';
import { ActionHeaderItemEnum } from '../../models/enums/action-header-item.enum';

@Component({
    selector: 'ps-header',
    templateUrl: './ps-header.component.html',
    styleUrls: ['./ps-header.component.scss']
})

export class PsHeaderComponent implements OnInit, AfterViewInit, OnChanges {
    @Input() data: SYSModuleCusDTO[] = [];
    @Output() selectModule = new EventEmitter<any>();

    @ViewChild("newpassword") public tbnewpassword: TextBoxComponent;
    @ViewChild("renewpassword") public tbrenewpassword: TextBoxComponent;
    @ViewChild("password") public tbpassword: TextBoxComponent;

    public listHead: { Head: number, HeadName: string }[] = [];
    public headActive: { Head: number, HeadName: string } = { Head: 0, HeadName: "" };
    public showHeadPopup: boolean = false;
    public ngExpanded: boolean = true;
    public dataactive: SYSModuleCusDTO = new SYSModuleCusDTO();
    public dataAction: any[] = []
    public showPasswordPopup: boolean = false;
    private changePasswordForm: UntypedFormGroup;

    constructor(private PSHeaderService: PSHeaderService,
        private cache: PSCache,
        public router: Router,
        private notification: PSKendoNotificationService,
        private auth: AuthService,
        private sysapi: LayoutApiService,
        private formBuilder: UntypedFormBuilder,
        private header: PSHeaderService,
    ) {
        this.dataAction = PSHeaderService.dataActionHeader;
    }

    ngOnInit(): void {
        //Lấy head được chọn trên cache
        var temp = this.cache.getItem(KeyLocalStorageEnum.HEAD_OBJECT);
        var cacheHead = this.cache.parseValue(temp);
        this.headActive = cacheHead;

        this.GetEmployeeAccount();
        this.onInitForm();
    }

    ngAfterViewInit(): void {
        if (this.showPasswordPopup) {
            this.tbnewpassword.input.nativeElement.type = "password";
            this.tbrenewpassword.input.nativeElement.type = "password";
            this.tbpassword.input.nativeElement.type = "password";
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] && !PSArray.isNullOrEmpty(this.data)) {
            var modulecache = this.cache.getItem(KeyLocalStorageEnum.MODULE_ACTIVE)
            var module = modulecache != null ? this.cache.parseValue(modulecache) : null;
            var moduleactive = module == null ? this.data[0].ModuleID : module.ModuleID;
            this.onSelectModule(this.data.find(f => f.ModuleID == moduleactive));
        }
    }

    private onInitForm() {
        this.changePasswordForm = this.formBuilder.group({
            newpassword: ['', [Validators.required]],
            renewpassword: ['', [Validators.required]],
            password: ['', [Validators.required]]
        });
    }

    get f() {
        return this.changePasswordForm.controls
    }

    public onToggle() {
        this.PSHeaderService.expanded.emit();
        this.ngExpanded = !this.ngExpanded;
    }

    public onSelectModule(e: SYSModuleCusDTO) {
        if (!PSObject.isNullOfUndefined(e) && e.Code != this.dataactive.Code) {
            this.dataactive = e;
            this.selectModule.emit(this.dataactive);
        }
    }

    public selectHead(obj: { Head: number, HeadName: string }) {
        this.cache.setItem(KeyLocalStorageEnum.HEAD_OBJECT, obj)
        this.headActive = obj;
        this.showHeadPopup = false;
        ConfigDTO.head = this.headActive as LSHeadCusDTO;
        this.header.headChange.next(this.headActive);
    }

    public onChangeHead() {
        if (PSArray.any(this.listHead))
            this.showHeadPopup = true;
        else {
            var temp = this.cache.getItem(KeyLocalStorageEnum.HEAD_LIST);
            this.listHead = this.cache.parseValue(temp);
            // console.log(this.listHead.map((x, i) => ({ index: i, value: x })));

            this.showHeadPopup = true;
        }
    }

    private logout() {
        this.auth.logout();
    }

    public onItemActionClick(e) {
        switch (e.Key) {
            case ActionHeaderItemEnum.LOGOUT:
                this.logout();
                break;

            case ActionHeaderItemEnum.SETTING:
                this.showChangePassword();
                break;

            default:
                break;
        }
    }

    private GetEmployeeAccount() {
        var temp = this.sysapi.GetEmployeeAccount().subscribe(res => {
            if (res.StatusCode == 0) {
                this.dataAction[0].FullName = res.ObjectReturn.FullName;
                this.dataAction[0].PositionName = res.ObjectReturn.PositionName;
                this.dataAction[0].DepartmentName = res.ObjectReturn.DepartmentName;
                this.dataAction[0].ImageThumb = res.ObjectReturn.ImageThumb;
            } else {
                this.notification.onError(`Lỗi cập nhật thông tin trạng thái kỳ kiểm kê: ${res.ErrorString}`);
            }
        }, (err) => {
            this.notification.onError(`Lỗi cập nhật thông tin trạng thái kỳ kiểm kê: ${err.message}`);
        })
    }

    private showChangePassword() {
        this.showPasswordPopup = true;
    }
}