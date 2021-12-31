import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RateAndDeliveryOptionPage } from './rate-and-delivery-option.page';

const routes: Routes = [
  {
    path: '',
    component: RateAndDeliveryOptionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RateAndDeliveryOptionPageRoutingModule {}
