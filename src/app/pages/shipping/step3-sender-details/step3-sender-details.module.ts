import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Step3SenderDetailsPageRoutingModule } from './step3-sender-details-routing.module';

import { Step3SenderDetailsPage } from './step3-sender-details.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedShippingModule } from '../shared-shipping.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    IonicModule,
    ReactiveFormsModule,
    Step3SenderDetailsPageRoutingModule,
    SharedModule,
    SharedShippingModule
  ],
  declarations: [Step3SenderDetailsPage]
})
export class Step3SenderDetailsPageModule { }
