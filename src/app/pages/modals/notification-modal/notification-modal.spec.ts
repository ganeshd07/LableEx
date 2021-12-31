import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { NotificationConstants } from 'src/app/types/constants/notification-message.constants';
import { IonIconType } from 'src/app/types/enum/ionic-icon.enum';
import { ModalType } from 'src/app/types/enum/modal-type.enum';

import { NotificationModal } from './notification-modal';

fdescribe('NotificationModal', () => {
  let component: NotificationModal;
  let fixture: ComponentFixture<NotificationModal>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NotificationModal],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  fit('should create', () => {
    expect(component).toBeTruthy();
  });

  fit('should call modal dismiss function.', () => {
    spyOn(component.modalController, 'dismiss');
    fixture.detectChanges();
    component.dismiss();
    expect(component.modalController.dismiss).toHaveBeenCalled();
  });

  fit('should open info modal.', () => {
    fixture.detectChanges();
    component.modalType = ModalType.INFO;
    component.ngOnInit();
    expect(component.modalTitle).toEqual(NotificationConstants.DEFAULT_INFORMATION_MESSAGE);
    expect(component.customCssClass).toEqual(ModalType.INFO);
    expect(component.ionIcon).toEqual(IonIconType.INFO_CIRCLE);
  });

  fit('should open warn modal.', () => {
    fixture.detectChanges();
    component.modalType = ModalType.WARN;
    component.ngOnInit();
    expect(component.modalTitle).toEqual(NotificationConstants.DEFAULT_WARNING_MESSAGE);
    expect(component.customCssClass).toEqual(ModalType.WARN);
    expect(component.ionIcon).toEqual(IonIconType.WARNING);
  });

  fit('should open error modal .', () => {
    fixture.detectChanges();
    component.modalType = ModalType.ERROR;
    component.ngOnInit();
    expect(component.modalTitle).toEqual(NotificationConstants.DEFAULT_ERROR_MESSAGE);
    expect(component.customCssClass).toEqual(ModalType.ERROR);
    expect(component.ionIcon).toEqual(IonIconType.ALERT);
  });

  fit('should open fatal modal.', () => {
    fixture.detectChanges();
    component.modalType = ModalType.FATAL;
    component.ngOnInit();
    expect(component.modalTitle).toEqual(NotificationConstants.DEFAULT_FATAL_MESSAGE);
    expect(component.customCssClass).toEqual(ModalType.FATAL);
    expect(component.ionIcon).toEqual(IonIconType.CLOSE_CIRCLE);
  });
});