import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Step5BillingDetailsPage } from './step5-billing-details.page';

const routes: Routes = [
  {
    path: '',
    component: Step5BillingDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Step5BillingDetailsPageRoutingModule {}
