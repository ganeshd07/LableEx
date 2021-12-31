import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ShippingRoutingModule } from './shipping-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from '@ngrx/store';
import { ShippingReducer, shippingFeatureKey } from './+store/shipping.reducer';
import { ReactiveFormsModule } from '@angular/forms';
import { EffectsModule } from '@ngrx/effects';
import { ShippingEffects } from './+store/shipping.effects';

@NgModule({
    imports: [
        CommonModule,
        IonicModule,
        ReactiveFormsModule,
        ShippingRoutingModule,
        TranslateModule.forChild(),
        StoreModule.forFeature(shippingFeatureKey, ShippingReducer),
        EffectsModule.forFeature([ShippingEffects])
    ]
})
export class ShippingModule { }
