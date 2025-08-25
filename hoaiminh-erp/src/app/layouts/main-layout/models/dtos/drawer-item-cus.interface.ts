import { DrawerItem } from "@progress/kendo-angular-layout/drawer/models/drawer-item.interface";

export interface DrawerItemCusInterface extends DrawerItem {
  imageUrl?: string;
  url?: string;
  opend?: boolean;
  type?: 'module' | 'function' | string;
}