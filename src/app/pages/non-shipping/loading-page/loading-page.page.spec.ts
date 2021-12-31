import { async, tick, ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { LoadingPagePage } from './loading-page.page';
import { Router } from '@angular/router';

fdescribe('LoadingPagePage', () => {
  let component: LoadingPagePage;
  let fixture: ComponentFixture<LoadingPagePage>;
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);
  let originalTimeOut;
  beforeEach(async(() => {
    originalTimeOut = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    TestBed.configureTestingModule({
      declarations: [LoadingPagePage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingPagePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  afterEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeOut;
  });

  fit('should create', fakeAsync(() => {
    expect(component).toBeTruthy();
  }));

  fit('should have call ngOnInit', () => {
    spyOn(component, 'goToMessageCenterPage');
    component.ngOnInit();
    expect(component.goToMessageCenterPage).toHaveBeenCalled();
  });

  fit('should navigate to message-center page', fakeAsync(() => {
    fixture.detectChanges();
    tick(4000);
    component.goToMessageCenterPage();
    flush();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/', 'message-centre']);
  }));

});