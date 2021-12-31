import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { Router } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import { TestBed, async } from '@angular/core/testing';
import { MenuController, Platform } from '@ionic/angular';
import { AppComponent } from './app.component';
import { UserData } from './providers/user-data';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { LanguageLoader } from './app.module';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LocalizationConfigService } from '../../src/app/core/providers/localization-config.service';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from '@ngx-config/core';
import * as testConfig from '../assets/config/mockConfigForTest';
import { BrowserService } from './core/providers/browser.service';
import { PageAnalyticsService } from './providers/page-analytics.service';
import { SessionItems } from './types/enum/session-items.enum';

fdescribe('AppComponent', () => {
  let eventsSpy,
    menuSpy,
    routerSpy,
    activatedRouteSpy,
    userDataSpy,
    swUpdateSpy,
    platformReadySpy,
    platformSpy,
    app,
    fixture;

  beforeEach(async(() => {
    eventsSpy = jasmine.createSpyObj('Events', ['subscribe']);
    menuSpy = jasmine.createSpyObj('MenuController', ['toggle', 'enable']);
    routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl']);
    activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['navigateByUrl']);
    userDataSpy = jasmine.createSpyObj('UserData', [SessionItems.ISLOGGEDIN, 'logout']);
    swUpdateSpy = jasmine.createSpyObj('SwUpdate', ['available', 'activateUpdate']);
    platformReadySpy = Promise.resolve();
    platformSpy = jasmine.createSpyObj('Platform', { ready: platformReadySpy });

    const mockConfig = testConfig.config;
    class configServiceStub {
      settings: any = mockConfig;
      getSettings(prop: string) {
        return this.settings[prop];
      }
      init() {
        this.settings = mockConfig;
      }
    }
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        }),
        HttpClientModule
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: ConfigService, useClass: configServiceStub },
        LocalizationConfigService,
        BrowserService,
        // { provide: Events, useValue: eventsSpy },
        { provide: MenuController, useValue: menuSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteSpy },
        { provide: UserData, useValue: userDataSpy },
        // { provide: StatusBar, useValue: statusBarSpy },
        // { provide: SplashScreen, useValue: splashScreenSpy },
        { provide: SwUpdate, useValue: swUpdateSpy },
        { provide: Platform, useValue: platformSpy },
        PageAnalyticsService
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    app = fixture.debugElement.componentInstance;
  });

  fit('should create app', () => {
    expect(app).toBeTruthy();
  });

  fit('should remove isFromSummary item from session on app load.', () => {
    sessionStorage.setItem(SessionItems.ISFROMSUMMARY, 'true');
    sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
    app.validateSummarySession();
    expect(sessionStorage.getItem(SessionItems.ISFROMSUMMARY)).toBeFalsy;
    expect(sessionStorage.getItem(SessionItems.MOBILENUMBER)).toBeFalsy;
  });
});
