import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { AccountPage } from './account';
import { AccountPageRoutingModule } from './account-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../shared/shared.module';
import { ShippingReducer, shippingFeatureKey } from '../shipping/+store/shipping.reducer';
import { StoreModule } from '@ngrx/store';
import { ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { ShippingEffects } from '../shipping/+store/shipping.effects';
import { LoginUserProfileService } from '../../providers/login-user-profile.service';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    AccountPageRoutingModule,
    TranslateModule.forChild(),
    SharedModule,
    ReactiveFormsModule,
    StoreModule.forFeature(shippingFeatureKey, ShippingReducer),
    EffectsModule.forFeature([ShippingEffects])
  ],
  declarations: [
    AccountPage,
  ],
  providers: [LoginUserProfileService]
})
export class AccountModule { }
