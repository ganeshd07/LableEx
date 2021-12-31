import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CustomsCommodityDetailsPageRoutingModule } from './customs-commodity-details-routing.module';

import { CustomsCommodityDetailsPage } from './customs-commodity-details.page';
import { SharedModule } from 'src/app/shared/shared.module';
import { SearchCommodityItemComponent } from './components/search-commodity-item/search-commodity-item.component';
import { TranslateModule } from '@ngx-translate/core';
import { TranslatePipe } from '@ngx-translate/core'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    TranslateModule,
    CustomsCommodityDetailsPageRoutingModule,
    SharedModule
  ],
  declarations: [
    CustomsCommodityDetailsPage,
    SearchCommodityItemComponent
  ],
  entryComponents: [
    SearchCommodityItemComponent
  ],
  providers: [TranslatePipe],
  exports: [
    SearchCommodityItemComponent
  ]
})
export class CustomsCommodityDetailsPageModule { }
