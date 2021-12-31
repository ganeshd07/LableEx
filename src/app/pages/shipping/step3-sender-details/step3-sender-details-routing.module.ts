import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Step3SenderDetailsPage } from './step3-sender-details.page';

const routes: Routes = [
  {
    path: '',
    component: Step3SenderDetailsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Step3SenderDetailsPageRoutingModule {}
