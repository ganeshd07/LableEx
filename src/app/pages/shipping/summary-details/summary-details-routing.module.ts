import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SummaryDetailsPage } from './summary-details.page';

const routes: Routes = [
  {
    path: '',
    component: SummaryDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SummaryDetailsPageRoutingModule {}
