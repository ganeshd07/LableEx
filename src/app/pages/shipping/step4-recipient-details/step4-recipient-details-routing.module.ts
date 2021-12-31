import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Step4RecipientDetailsPage } from './step4-recipient-details.page';

const routes: Routes = [
  {
    path: '',
    component: Step4RecipientDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Step4RecipientDetailsPageRoutingModule {}
