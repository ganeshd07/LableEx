import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RecipientAddressBookPageRoutingModule } from './recipient-address-book-routing.module';
import { RecipientAddressBookPage } from './recipient-address-book.page';
import { SharedModule } from '../../../shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    RecipientAddressBookPageRoutingModule,
    TranslateModule
  ],
  declarations: [RecipientAddressBookPage]
})
export class RecipientAddressBookPageModule {}
