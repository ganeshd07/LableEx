import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OtpVerificationPageRoutingModule } from './otp-verification-routing.module';

import { OtpVerificationPage } from './otp-verification.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule } from '@ngx-translate/core';
import { TranslatePipe } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OtpVerificationPageRoutingModule,
    TranslateModule.forChild(),
    SharedModule,
    ReactiveFormsModule
  ],
  providers: [TranslatePipe],
  declarations: [OtpVerificationPage]
})
export class OtpVerificationPageModule {}
