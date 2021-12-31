import { HttpClientModule, HttpClient } from '@angular/common/http';
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { ConfigModule, ConfigLoader, ConfigStaticLoader } from '@ngx-config/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { FormsModule } from '@angular/forms';
import { ReplacePipe } from './providers/directives/replace-pipe';
import { DatePipe } from '@angular/common';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import {
  SocialLoginModule,
  SocialAuthServiceConfig,
} from 'angularx-social-login';
import {
  GoogleLoginProvider,
  FacebookLoginProvider,
} from 'angularx-social-login';
import { CoreModule } from './core/core.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { globalInterceptorProvider } from './core/interceptors/global-http.interceptor';
import * as devConfig from '../assets/config/development';
import * as stagingConfig from '../assets/config/staging';
import * as prodConfig from '../assets/config/production';
import { NotificationModalPageModule } from './pages/modals/notification-modal/notification-modal.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AppReducer } from './+store/app.reducer';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ConfigState } from './types/enum/config-state.enum';

// This will fetch the json files containing the languages on runtime
export function LanguageLoader(httpClient: HttpClient) {
  return new TranslateHttpLoader(httpClient, '../../assets/i18n/', '_labelex.json');
}

export function configFactory(): ConfigLoader {
  let config: any;
  if (environment.state === ConfigState.DEV) {
    if (window.location.origin.includes(environment.local_dev_url)) {
      devConfig.config.LOCAL.HOST = environment.dev_host_url;
    } else {
      devConfig.config.LOCAL.HOST = window.location.origin;
    }
    config = devConfig.config;
  } else if (environment.state === ConfigState.UAT) {
    if (window.location.origin.includes(environment.local_dev_url)) {
      stagingConfig.config.LOCAL.HOST = environment.uat_host_url;
    } else {
      stagingConfig.config.LOCAL.HOST = window.location.origin;
    }
    config = stagingConfig.config;
  } else if (environment.state === ConfigState.PROD) {
    prodConfig.config.LOCAL.HOST = window.location.origin;
    config = prodConfig.config;
  }

  return new ConfigStaticLoader(config);
}

@NgModule({
  imports: [
    CoreModule,
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    SocialLoginModule,
    IonicModule.forRoot({ mode: 'md' }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (LanguageLoader),
        deps: [HttpClient]
      }
    }),
    ConfigModule.forRoot(
      {
        provide: ConfigLoader,
        useFactory: configFactory,
        deps: [HttpClient]
      }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    NotificationModalPageModule,
    StoreModule.forRoot(AppReducer, {}),
    EffectsModule.forRoot([]),
    !environment.production ? StoreDevtoolsModule.instrument() : []
  ],
  declarations: [
    AppComponent,
    ReplacePipe
  ],
  providers: [
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: GoogleLoginProvider.PROVIDER_ID,
            provider: new GoogleLoginProvider(!environment.production ? stagingConfig.config.GOOGLE.CLIENT_ID : prodConfig.config.GOOGLE.CLIENT_ID)
          },
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider(!environment.production ? stagingConfig.config.FACEBOOK.APP_ID : prodConfig.config.FACEBOOK.APP_ID)
          },
        ],
      } as SocialAuthServiceConfig,
    },
    globalInterceptorProvider,
    DatePipe
  ],
  exports: [CoreModule],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
