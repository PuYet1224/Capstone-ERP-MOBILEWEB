import { Component, Input, OnInit } from '@angular/core';
import { BreadCrumbItemCusInterface } from '../../models/dtos/bread-crumb-item-cus.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { PSArray } from 'src/app/services/utilities/ps-array';

@Component({
    selector: 'ps-toolbar-top',
    templateUrl: './ps-toolbar-top.component.html',
    styleUrls: ['./ps-toolbar-top.component.scss']
})

export class PsToolbarTopComponent implements OnInit {
    public items: Array<BreadCrumbItemCusInterface> = [];

    constructor(private route: ActivatedRoute, private router: Router) { }


    ngOnInit() {
        this.fetchRouteData(this.route);
    }

    fetchRouteData(route: ActivatedRoute) {
        route.data.subscribe((data: BreadCrumbItemCusInterface) => {
            if (Object.keys(data).length === 0 || !data?.text) {
                return;
            }

            this.items.unshift(data);

            const parentRoute = route.parent;
            if (parentRoute) {
                this.fetchRouteData(parentRoute);
            }
        });
    }

    onMenuClickItem(item: BreadCrumbItemCusInterface) {
        if (PSArray.any(item.Links))
            this.router.navigate(item.Links)
    }
}