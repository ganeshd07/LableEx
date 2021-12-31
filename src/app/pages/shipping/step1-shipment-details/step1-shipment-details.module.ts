import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Step1ShipmentDetailsPageRoutingModule } from './step1-shipment-details-routing.module';
import { Step1ShipmentDetailsPage } from './step1-shipment-details.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedShippingModule } from '../shared-shipping.module';
import { PackagingTypeOptionsComponent } from './components/packaging-type-options/packaging-type-options.component';
import { ShipmentOriginComponent } from './components/shipment-origin/shipment-origin.component';
import { ShipmentDestinationComponent } from './components/shipment-destination/shipment-destination.component';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule,
    Step1ShipmentDetailsPageRoutingModule,
    SharedModule,
    SharedShippingModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule
  ],
  declarations: [
    Step1ShipmentDetailsPage,
    PackagingTypeOptionsComponent,
    ShipmentOriginComponent,
    ShipmentDestinationComponent
  ],
  exports: [
    PackagingTypeOptionsComponent,
    ShipmentDestinationComponent,
    ShipmentOriginComponent
  ]
})
export class Step1ShipmentDetailsPageModule {}
