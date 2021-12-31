import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';

import { TermsAndConditionsKrPageRoutingModule } from './terms-and-conditions-kr-routing.module';

import { TermsAndConditionsKrPage } from './terms-and-conditions-kr.page';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TermsAndConditionsKrPageRoutingModule,
    SharedModule,
    TranslateModule,
    ReactiveFormsModule
  ],
  declarations: [TermsAndConditionsKrPage]
})
export class TermsAndConditionsKrPageModule {}