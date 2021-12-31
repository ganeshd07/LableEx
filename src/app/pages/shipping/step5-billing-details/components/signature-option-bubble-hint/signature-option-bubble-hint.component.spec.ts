import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SignatureOptionBubbleHintComponent } from './signature-option-bubble-hint.component';

fdescribe('SignatureOptionBubbleHintComponent', () => {
  let component: SignatureOptionBubbleHintComponent;
  let fixture: ComponentFixture<SignatureOptionBubbleHintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignatureOptionBubbleHintComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SignatureOptionBubbleHintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should dismiss model popup when click on close icon', () => {
    fixture.detectChanges();
    spyOn(component.modalCtrl, 'dismiss');
    component.closeNavigation();
    expect(component.modalCtrl.dismiss).toHaveBeenCalled();
  });
});
