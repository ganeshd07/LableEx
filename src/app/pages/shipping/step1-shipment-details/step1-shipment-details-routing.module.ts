import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Step1ShipmentDetailsPage } from './step1-shipment-details.page';

const routes: Routes = [
  {
    path: '',
    component: Step1ShipmentDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Step1ShipmentDetailsPageRoutingModule {}
