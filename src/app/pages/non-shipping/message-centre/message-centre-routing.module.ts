import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MessageCentrePage } from './message-centre.page';

const routes: Routes = [{ path: '', component: MessageCentrePage }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MessageCentrePageRoutingModule { }
