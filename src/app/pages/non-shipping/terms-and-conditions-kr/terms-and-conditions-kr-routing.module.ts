import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TermsAndConditionsKrPage } from './terms-and-conditions-kr.page';

const routes: Routes = [
  {
    path: '',
    component: TermsAndConditionsKrPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TermsAndConditionsKrPageRoutingModule {}
