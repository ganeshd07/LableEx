import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { Step5BillingDetailsPageRoutingModule } from './step5-billing-details-routing.module';
import { Step5BillingDetailsPage } from './step5-billing-details.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedShippingModule } from '../shared-shipping.module';
import { PaymentOptionsModalComponent } from '../../shipping/step5-billing-details/components/payment-options-modal/payment-options-modal.component';
import { TranslateModule } from '@ngx-translate/core';
import { SignatureOptionBubbleHintComponent } from './components/signature-option-bubble-hint/signature-option-bubble-hint.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Step5BillingDetailsPageRoutingModule,
    SharedModule,
    TranslateModule,
    SharedShippingModule,
    ReactiveFormsModule
  ],
  declarations: [Step5BillingDetailsPage, PaymentOptionsModalComponent, SignatureOptionBubbleHintComponent],
  entryComponents: [PaymentOptionsModalComponent],
  exports: [PaymentOptionsModalComponent, SignatureOptionBubbleHintComponent]
})
export class Step5BillingDetailsPageModule { }
