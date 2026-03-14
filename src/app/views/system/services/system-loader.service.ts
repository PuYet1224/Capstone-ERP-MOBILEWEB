
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class SystemLoaderService {
    private loaderSubject = new BehaviorSubject<boolean>(false);
    public loader$: Observable<boolean> = this.loaderSubject.asObservable();

    private activeCount: number = 0;

    constructor() { }

    public loader(load: boolean): void {
        if (load)
            this.activeCount++;
        else
            this.activeCount = Math.max(0, this.activeCount - 1);

        this.updateLoaderState();
    }

    public reset(): void {
        this.activeCount = 0;
        this.updateLoaderState();
    }

    private updateLoaderState(): void {
        this.loaderSubject.next(this.activeCount > 0);
    }
}