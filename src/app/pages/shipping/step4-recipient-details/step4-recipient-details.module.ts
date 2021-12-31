import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Step4RecipientDetailsPageRoutingModule } from './step4-recipient-details-routing.module';

import { Step4RecipientDetailsPage } from './step4-recipient-details.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedShippingModule } from '../shared-shipping.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    IonicModule,
    ReactiveFormsModule,
    Step4RecipientDetailsPageRoutingModule,
    SharedModule,
    SharedShippingModule
  ],
  declarations: [Step4RecipientDetailsPage]
})
export class Step4RecipientDetailsPageModule { }
