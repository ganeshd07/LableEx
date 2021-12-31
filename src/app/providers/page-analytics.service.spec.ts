import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Injector } from '@angular/core';
import { TestBed, async, getTestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { AppComponent } from '../app.component';
import { LanguageLoader } from '../app.module';
import { BrowserService } from '../core/providers/browser.service';
import { LocalizationConfigService } from '../core/providers/localization-config.service';
import { PageAnalyticsService } from './page-analytics.service';
import { routes } from '../app-routing.module';

fdescribe('PageAnalyticsService', () => {
  let service: PageAnalyticsService;
  let injector: Injector;
  let router: Router;

  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes(routes),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        }),
      ],
      providers: [
        PageAnalyticsService,
        LocalizationConfigService,
        BrowserService        
      ]
    });

    injector = getTestBed();
    service = injector.get(PageAnalyticsService);
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;

    router = injector.get(Router);
    router.initialNavigation();
  });

  fit('should be created', async(() => {
    expect(service).toBeTruthy();
  }));

  fit('should be able to call registerPageView()', async(() => {
    spyOn(service, 'registerPageViews');
    component.ngOnInit();
    fixture.detectChanges();
    expect(service.registerPageViews).toHaveBeenCalled();
  }));

  fit('should be able to call publishPageView()', async(() => {
    expect(service.publishPageView).toBeDefined();
  }));
});