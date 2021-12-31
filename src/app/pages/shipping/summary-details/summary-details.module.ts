import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SummaryDetailsPageRoutingModule } from './summary-details-routing.module';

import { SummaryDetailsPage } from './summary-details.page';

import { SharedModule } from 'src/app/shared/shared.module';
import { SharedShippingModule } from '../shared-shipping.module';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    TranslateModule,
    SharedShippingModule,
    SummaryDetailsPageRoutingModule
  ],
  declarations: [SummaryDetailsPage]
})
export class SummaryDetailsPageModule {}
