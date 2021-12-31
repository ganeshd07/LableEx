import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { RouterTestingModule } from '@angular/router/testing';
import { MessageCentrePage } from './message-centre.page';
import { Router } from '@angular/router';
import { HtmlSanitizer } from 'src/app/providers/directives/html-sanitizer.pipe';
import { MessageCentreService } from 'src/app/core/providers/local';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { ConfigService } from '@ngx-config/core';
import { Observable, Observer } from 'rxjs';
import { MessageCentreResponse } from 'src/app/interfaces/api-service/response/message-centre-response.interface';
import { AppSupportedCountry } from 'src/app/types/enum/app-supported-country.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { OAuthEnum } from 'src/app/types/enum/oauth-enum.enum';

fdescribe('MessageCentrePage', () => {
  let component: MessageCentrePage;
  let fixture: ComponentFixture<MessageCentrePage>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
  const mockConfig = testConfig.config;

  const mockMessageCentreServiceResponse: MessageCentreResponse[] = [
    {
      messageId: 100140,
      category: 'SPECIAL_OFFER',
      countryCode: 'HK',
      endDate: 'Mar-26-2022 23:59',
      pin: true,
      startDate: 'Mar-23-2021 00:00',
      messageDescs: [
        {
          messageDescId: 100181,
          description: 'Test',
          locale: 'zh_HK',
          title: 'Test'
        }
      ]
    },
    {
      messageId: 100081,
      category: 'NEWS',
      countryCode: 'HK',
      endDate: 'Mar-22-2022 00:00',
      pin: true,
      startDate: 'Mar-10-2021 00:00',
      isExpanded: true,
      messageDescs: [
        {
          messageDescId: 100080,
          description: 'Update update Update update',
          locale: 'zh_HK',
          title: 'Update update Update update'
        }
      ]
    }
  ];
  class ConfigServiceStub {
    settings: any = mockConfig;
    getSettings(prop: string) {
      return this.settings[prop];
    }
    init() {
      this.settings = mockConfig;
    }
  }
  
  beforeEach(async(() => {
    sessionStorage.setItem(OAuthEnum.LOCAL_STORE_KEY, 'Basic asdf12as');
    class MessageCentreServiceStub {
      getMessageCentreList(countryCode: string, language: string) {
        return Observable.create((observer: Observer<any>) => {
          observer.next(mockMessageCentreServiceResponse);
        });
      }
    }

    TestBed.configureTestingModule({
      declarations: [
        MessageCentrePage,
        HtmlSanitizer
      ],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        }),
        HttpClientTestingModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ConfigService, useClass: ConfigServiceStub },
        HtmlSanitizer,
        { provide: MessageCentreService, useClass: MessageCentreServiceStub }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MessageCentrePage);
    component = fixture.componentInstance;
    fixture.detectChanges();

  }));

  afterEach(fakeAsync(() => {
    flush();
  }))

  fit('should create', fakeAsync(() => {
    tick();
    flush();
    expect(component).toBeTruthy();
  }));

  fit('should navigate to shipment details page', fakeAsync(() => {
    fixture.detectChanges();
    component.goToLoginPage();
    tick();
    flush();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'login']);
  }));

  fit('should display backButton', fakeAsync(() => {
    fixture.detectChanges();
    sessionStorage.setItem(SessionItems.MESSAGECENTRE, 'true');
    sessionStorage.setItem(SessionItems.PREVIOUSURL, '/shipping/shipment-details');
    component.displayBackButton();
    tick();
    flush();
    expect(component.showBackButton).toEqual(true);
    expect(component.backNavPath).toEqual('/shipping/shipment-details');
  }));

  fit('should do ngDoCheck', fakeAsync(() => {
    spyOn(component, 'getMessageCentreList');
    component.selectedLanguage = 'zh_hk';
    sessionStorage.setItem(SessionItems.SELECTEDLANGUAGE, 'en_hk');
    component.ngDoCheck();
    tick();
    flush();
    expect(component.selectedLanguage).toEqual(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE));
    expect(component.getMessageCentreList).toHaveBeenCalled();
  }));

  fit('should toggle message detail based on index', fakeAsync(() => {
    let index = 0;
    component.messageCenterList = mockMessageCentreServiceResponse;

    const dummyElement = document.createElement('ion-card-subtitle');
    dummyElement.id = 'cardContent0';
    dummyElement.className = 'closed';
    document.getElementById = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);
    component.toggleMessageDetail(index);
    expect(dummyElement.className).toEqual('expanded');
    expect(component.messageCenterList[index].isExpanded).toBe(true);

    index = 1;
    const dummyElement2 = document.createElement('ion-card-subtitle');
    dummyElement2.id = 'cardContent1';
    dummyElement2.className = 'expanded';
    document.getElementById = jasmine.createSpy('HTML Element').and.returnValue(dummyElement2);
    component.toggleMessageDetail(index);
    tick();
    flush();
    expect(dummyElement2.className).toEqual('closed');
    expect(component.messageCenterList[index].isExpanded).toBe(false);
  }));

});
