import { NgModule, Optional, SkipSelf, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GlobalErrorHandler } from './providers/global-error-handler';
import { AuthGuardService } from './guards/auth-guard.service';
import { NotificationService } from './providers/notification-service';
import { LoggerService } from './providers/logger-service';
import { LocalizationConfigService } from './providers/localization-config.service';
import { MockDataService } from './providers/mock-data.service';
import { RightNavMenuComponent } from './components/right-nav-menu/right-nav-menu.component';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import * as apim from './providers/apim';
import * as local from './providers/local';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserService } from './providers/browser.service';
import { PageAnalyticsService } from '../providers/page-analytics.service';
import { LoaderService } from './providers/loader.service';

@NgModule({
  declarations: [
    RightNavMenuComponent
  ],
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule,
    IonicModule,
    SharedModule,
    FormsModule
  ],
  providers: [
    LoaderService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    },
    AuthGuardService,
    NotificationService,
    LoggerService,
    LocalizationConfigService,    
    MockDataService,
    BrowserService,
    PageAnalyticsService,
    apim.AuthenticationService,
    apim.APIMAvailabilityService,
    apim.APIMCommodityService,
    apim.APIMCountryService,
    apim.APIMGlobalTradeService,
    apim.APIMNotificationService,
    apim.APIMPaymentService,
    apim.RatesService,
    apim.APIMShipmentService,
    apim.APIMUserService,
    local.LocalAuthenticationService,
    local.LocalAddressService,
    local.LocalCommodityService,
    local.LocalRatesService,
    local.CurrencyUomComConfigurationService,
    local.CreateShipmentService,
    local.ShipmentFeedbackService,
    local.MessageCentreService
  ],
  exports: [
    RightNavMenuComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('Core Module has been loaded already. Core module should be imported in AppModule only');
    }
  }
}
