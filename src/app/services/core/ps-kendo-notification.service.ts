import { Injectable } from "@angular/core";
import { NotificationService, NotificationSettings } from "@progress/kendo-angular-notification";

@Injectable({
    providedIn: 'root'
})

export class PsKendoNotificationService {
    constructor(private notificationService: NotificationService) { }

    public onSuccess(content: string, hideAfter: number = 5000) {
        var state: NotificationSettings = {
            content: content,
            type: { style: 'success', icon: false },
            animation: { type: "slide", duration: 300 },
            position: { horizontal: "center", vertical: "top" },
            hideAfter: hideAfter
        }
        this.notificationService.show(state);
    }

    public onError(content: string, hideAfter: number = 5000) {
        var state: NotificationSettings = {
            content: content,
            type: { style: 'error', icon: false },
            animation: { type: "slide", duration: 300 },
            position: { horizontal: "center", vertical: "top" },
            hideAfter: hideAfter
        }
        this.notificationService.show(state);
    }

    public onWarning(content: string, hideAfter: number = 5000) {
        var state: NotificationSettings = {
            content: content,
            type: { style: 'warning', icon: false },
            animation: { type: "slide", duration: 300 },
            position: { horizontal: "center", vertical: "top" },
            hideAfter: hideAfter
        }
        this.notificationService.show(state);
    }

    public onInfo(content: string, hideAfter: number = 5000) {
        var state: NotificationSettings = {
            content: content,
            type: { style: 'info', icon: false },
            animation: { type: "slide", duration: 300 },
            position: { horizontal: "center", vertical: "top" },
            hideAfter: hideAfter
        }
        this.notificationService.show(state);
    }

    public onDefault(content: string, hideAfter: number = 5000) {
        var state: NotificationSettings = {
            content: content,
            type: { style: 'none', icon: false },
            animation: { type: "slide", duration: 300 },
            position: { horizontal: "center", vertical: "top" },
            hideAfter: hideAfter
        }
        this.notificationService.show(state);
    }
}