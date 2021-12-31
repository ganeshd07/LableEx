import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { NotificationConstants } from '../../../types/constants/notification-message.constants';
import { ModalType } from '../../../types/enum/modal-type.enum';
import { IonIconType } from '../../../types/enum/ionic-icon.enum';

/**
 * This is a notification modal for info/warn/error/fatal loggings
 * Depending on the logger level, it will display a specific UI(icon, additional classes can be added in the future).
 * 
 * Author: Marlon Micael J. Cuevas
 * Date Created: May 5, 2020 
 */

@Component({
  selector: 'page-notificationmodal',
  templateUrl: './notification-modal.html',
  styleUrls: ['./notification-modal.scss']
})
export class NotificationModal implements OnInit {

  /**
   * These params came from notification-service.ts and should be same as componentProps from showModalLog method
   * 
   * @param message         - Actual message to be displayed
   * @param modalType       - Modal type to be used
   * @param modalTitle      - Specifies the title text of the modal
   * @param ionIcon         - Ionic icon to be displayed beside the modalTitle, refer to IonIconType
   * @param customCssClass  - custom CSS to be defined per each modal type
   * 
   */
  message: string;
  modalType: ModalType;
  modalTitle: string;
  ionIcon: IonIconType;
  customCssClass: string;

  constructor(public modalController: ModalController) {
  }

  ngOnInit() {

    /**
     * This sets the modal title, the background class
     * (additional classes can be defined in the future if needed) and ionic icon to be used
     * 
     * Add a separate variable to define another class and declare the same in the html file
     */
    if (this.modalType == ModalType.INFO) {
      this.modalTitle = NotificationConstants.DEFAULT_INFORMATION_MESSAGE;
      this.customCssClass = ModalType.INFO;
      this.ionIcon = IonIconType.INFO_CIRCLE;
    } else if (this.modalType == ModalType.WARN) {
      this.modalTitle = NotificationConstants.DEFAULT_WARNING_MESSAGE;
      this.customCssClass = ModalType.WARN;
      this.ionIcon = IonIconType.WARNING;
    }
    else if (this.modalType == ModalType.ERROR) {
      this.modalTitle = NotificationConstants.DEFAULT_ERROR_MESSAGE;
      this.customCssClass = ModalType.ERROR;
      this.ionIcon = IonIconType.ALERT;
    }
    else if (this.modalType == ModalType.FATAL) {
      this.modalTitle = NotificationConstants.DEFAULT_FATAL_MESSAGE;
      this.customCssClass = ModalType.FATAL;
      this.ionIcon = IonIconType.CLOSE_CIRCLE;
    }
  }

  /**
   * Closes the modal presented.
   * 
   */
  dismiss() {
    this.modalController.dismiss({
      'dismissed': true
    });
  }
}
