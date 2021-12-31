import { NavigationStepperComponent } from './components/navigation-stepper/navigation-stepper.component';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecentlyShippedComponent } from './my-shipments/components/recently-shipped/recently-shipped.component';
import { PendingShipmentsComponent } from './my-shipments/components/pending-shipments/pending-shipments.component';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [NavigationStepperComponent, RecentlyShippedComponent, PendingShipmentsComponent],
  imports: [
    CommonModule,
    IonicModule,
    TranslateModule.forChild(),
    SharedModule
  ],
  exports: [NavigationStepperComponent, RecentlyShippedComponent, PendingShipmentsComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedShippingModule { }
