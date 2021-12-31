import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';

import { NavigationStepperComponent } from './navigation-stepper.component';

fdescribe('NavigationStepperComponent', () => {
  let component: NavigationStepperComponent;
  let fixture: ComponentFixture<NavigationStepperComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavigationStepperComponent ],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot({
          loader: {
              provide: TranslateLoader,
              useFactory: LanguageLoader,
              deps: [HttpClient]
          }
        }),
        HttpClientTestingModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavigationStepperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  fit('should create', () => {
    expect(component).toBeTruthy();
  });
});
