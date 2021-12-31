import { TestBed, async, ComponentFixture, getTestBed, fakeAsync, tick } from '@angular/core/testing';

import { ModalController, AngularDelegate, IonicModule } from '@ionic/angular';

import { ConfigService } from '@ngx-config/core';
import * as testConfig from '../../../../../../../assets/config/mockConfigForTest';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Observable, Observer } from 'rxjs';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LanguageLoader } from '../../../../../../app.module';
import { DisplayQrCodeComponent } from './display-qr-code.component';

fdescribe('DisplayQrCodeComponent', () => {
  let component: DisplayQrCodeComponent;
  let fixture: ComponentFixture<DisplayQrCodeComponent>;
  const mockConfig = testConfig.config;
  let ADDRESS_API: string;
  let qrCodeAPI: string;

  beforeEach(async(() => {

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
      declarations: [
        DisplayQrCodeComponent
      ],
      providers: [
        ModalController,
        TranslateService,
        AngularDelegate,
        { provide: ConfigService, useClass: configServiceStub }
      ],
      imports: [
        HttpClientTestingModule,
        IonicModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        })
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisplayQrCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    ADDRESS_API = mockConfig.LOCAL.API_ISLAND.pendingShipmentQrCode;
    qrCodeAPI = component.util.joinStrings('', mockConfig.LOCAL.HOST, ADDRESS_API);
  });

  afterEach(() => {
    fixture.destroy();
  });

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should create QR code URL using reference number.', () => {
    component.referenceNumber = 'HK0407914310';
    fixture.detectChanges();
    component.ngOnInit();
    expect(component.qrCodeURL).toEqual(qrCodeAPI + '?refNumber=HK0407914310');
  });

  fit('should close modal on close button click.', () => {
    spyOn(component.modalController, 'dismiss');
    fixture.detectChanges();
    component.ngOnInit();
    component.closeModal();
    expect(component.modalController.dismiss).toHaveBeenCalled();
  });
});
