import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RateAndDeliveryOptionPageRoutingModule } from './rate-and-delivery-option-routing.module';
import { RateAndDeliveryOptionPage } from './rate-and-delivery-option.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedShippingModule } from '../shared-shipping.module';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    RateAndDeliveryOptionPageRoutingModule,
    SharedModule,
    SharedShippingModule
  ],
  declarations: [
    RateAndDeliveryOptionPage
  ]
})
export class RateAndDeliveryOptionPageModule {}
