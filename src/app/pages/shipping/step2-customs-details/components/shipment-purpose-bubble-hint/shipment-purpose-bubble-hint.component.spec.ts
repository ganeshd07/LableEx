import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ShipmentPurposeBubbleHintComponent } from './shipment-purpose-bubble-hint.component';

describe('ShipmentPurposeBubbleHintComponent', () => {
  let component: ShipmentPurposeBubbleHintComponent;
  let fixture: ComponentFixture<ShipmentPurposeBubbleHintComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShipmentPurposeBubbleHintComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentPurposeBubbleHintComponent);
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