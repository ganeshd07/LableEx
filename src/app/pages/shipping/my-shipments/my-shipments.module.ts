import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MyShipmentsPageRoutingModule } from './my-shipments-routing.module';

import { MyShipmentsPage } from './my-shipments.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedShippingModule } from '../shared-shipping.module';
import { TranslateModule } from '@ngx-translate/core';
import { DisplayQrCodeComponent } from './components/pending-shipments/components/display-qr-code.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MyShipmentsPageRoutingModule,
    SharedShippingModule,
    SharedModule,
    TranslateModule.forChild()
  ],
  declarations: [MyShipmentsPage, DisplayQrCodeComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MyShipmentsPageModule { }
