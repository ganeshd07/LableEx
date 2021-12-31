import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NotificationModal } from './notification-modal';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ], 
  declarations: [NotificationModal],
  entryComponents: [NotificationModal]
})
export class NotificationModalPageModule { }
