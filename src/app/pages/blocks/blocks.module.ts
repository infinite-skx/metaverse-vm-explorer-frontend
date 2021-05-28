import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlocksRoutingModule, routedComponents } from './blocks-routing.module'



@NgModule({
  imports: [
    CommonModule,
    BlocksRoutingModule
  ],
  declarations: [
    ...routedComponents,
  ],
})
export class BlocksModule { }
