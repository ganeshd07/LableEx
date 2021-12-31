import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OtpLoginPageRoutingModule } from './otp-login-routing.module';

import { OtpLoginPage } from './otp-login.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from '../../../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    OtpLoginPageRoutingModule,
    TranslateModule.forChild(),
    SharedModule,
    ReactiveFormsModule
  ],
  declarations: [OtpLoginPage]
})
export class OtpLoginPageModule {}
