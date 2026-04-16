import { Injectable } from '@angular/core';
import { KeyLocalStorageEnum } from 'src/app/models/enums/key-local-storage.enum';

@Injectable({
    providedIn: 'root'
})

export class PsCache {
    public setItem(key: KeyLocalStorageEnum, value: any) {
        var saveItem = { date: new Date(), value: value };
        localStorage.setItem(key, JSON.stringify(saveItem));
    }

    public getItem<T>(key: KeyLocalStorageEnum): T | null {
        var item = localStorage.getItem(key);
        return item ? localStorage.getItem(key) as T : null;
    }

    public removeItem(key: KeyLocalStorageEnum) {
        localStorage.removeItem(key);
    }

    public clear() {
        return localStorage.clear();
    }

    public parse(str: any) {
        if (!str) return null;
        return JSON.parse(str);
    }

    public parseValue(str: any) {
        if (!str) return null;
        const parsed = JSON.parse(str);
        return parsed ? parsed.value : null;
    }
}