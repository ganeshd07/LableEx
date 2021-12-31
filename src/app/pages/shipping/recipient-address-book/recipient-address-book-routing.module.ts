import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RecipientAddressBookPage } from './recipient-address-book.page';

const routes: Routes = [
  {
    path: '',
    component: RecipientAddressBookPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipientAddressBookPageRoutingModule {}
