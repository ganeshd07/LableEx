import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MessageCentrePageRoutingModule } from './message-centre-routing.module';

import { MessageCentrePage } from './message-centre.page';
import { TranslateModule } from '@ngx-translate/core';
import { SharedModule } from 'src/app/shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MessageCentrePageRoutingModule,
    TranslateModule.forChild(),
    SharedModule
  ],
  declarations: [MessageCentrePage]
})
export class MessageCentrePageModule { }
