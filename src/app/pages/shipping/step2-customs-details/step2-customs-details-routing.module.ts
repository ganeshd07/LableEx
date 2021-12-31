import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Step2CustomsDetailsPage } from './step2-customs-details.page';

const routes: Routes = [
  {
    path: '',
    component: Step2CustomsDetailsPage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Step2CustomsDetailsPageRoutingModule {}
