import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CustomsCommodityDetailsPage } from './customs-commodity-details.page';

const routes: Routes = [
  {
    path: '',
    component: CustomsCommodityDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CustomsCommodityDetailsPageRoutingModule {}
