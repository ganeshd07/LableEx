import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MyShipmentsPage } from './my-shipments.page';
import { UrlSerializer, ChildrenOutletContexts, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

fdescribe('MyShipmentsPage', () => {
  let component: MyShipmentsPage;
  let fixture: ComponentFixture<MyShipmentsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [MyShipmentsPage],
      imports: [
        RouterTestingModule,
        IonicModule.forRoot(),
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
        ChildrenOutletContexts
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyShipmentsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('Should set the BackButton Url when Navigate to MyShipment page', () => {
    fixture.detectChanges();
    sessionStorage.setItem(SessionItems.PREVIOUSURL, '/shipping/sender-details');
    component.ngDoCheck();
    expect(component.backNavPath).toEqual('/shipping/sender-details');
  });
});
