import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { Step2CustomsDetailsPageRoutingModule } from './step2-customs-details-routing.module';

import { Step2CustomsDetailsPage } from './step2-customs-details.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedShippingModule } from '../shared-shipping.module';
import { DocumentsComponent } from './components/documents/documents.component';
import { ItemsComponent } from './components/items/items.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ShipmentPurposeBubbleHintComponent } from './components/shipment-purpose-bubble-hint/shipment-purpose-bubble-hint.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    Step2CustomsDetailsPageRoutingModule,
    SharedModule,
    SharedShippingModule
  ],
  exports: [DocumentsComponent, ItemsComponent, ShipmentPurposeBubbleHintComponent],
  declarations: [Step2CustomsDetailsPage, DocumentsComponent, ItemsComponent, ShipmentPurposeBubbleHintComponent]
})
export class Step2CustomsDetailsPageModule { }
