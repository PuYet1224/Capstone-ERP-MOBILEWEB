import { NgModule } from '@angular/core';
import { LabelModule } from '@progress/kendo-angular-label';
import { FormsModule } from '@angular/forms';
import { ViewsRouting } from './views.routing';
import { ViewsComponent } from './views.component';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    LabelModule,
    FormsModule,
    ViewsRouting,
    CommonModule
  ],
  declarations: [
    ViewsComponent
  ],
  exports: []
})
export class ViewsModule { }
