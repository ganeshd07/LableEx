import { Injectable, NgZone } from '@angular/core';
import { AlertController, ToastController, ModalController } from '@ionic/angular';
import { ToastOptions, AlertOptions } from '@ionic/core';
import { ToastPosition } from '../../types/enum/toast-position.enum';
import { NotificationModal } from '../../pages/modals/notification-modal/notification-modal';
import { ModalType } from '../../types/enum/modal-type.enum';
import { TranslateService } from '@ngx-translate/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '@ngx-config/core';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

/**
 * This is a notification service to be used in LABELEX application
 * This simplifies the alert and toast creation.
 *
 * Author: Marlon Micael J. Cuevas
 * Date Created: Apr 20, 2020
 */

@Injectable()
export class NotificationService {

    private defaultHeader = 'Notification';
    private defaultSubHeader = '';
    private defaultButtons = ['OK'];
    private defaultDuration = 2000;
    private defaultPosition = ToastPosition.BOTTOM;

    constructor(
        private alertCtrl: AlertController,
        private toastCtrl: ToastController,
        private modalCtrl: ModalController,
        private translate: TranslateService,
        public zone: NgZone,
        private readonly config: ConfigService
    ) { }

    /**
     * Default Alert Box Parameters
     *
     */
    private alertParams: AlertOptions = {
        header: this.defaultHeader,
        subHeader: this.defaultSubHeader,
        message: 'Message',
        buttons: ['OK']
    };

    /**
     * Error Alert Box Parameters
     *
     */
    private errorAlertParams: AlertOptions = {
        header: this.defaultHeader,
        subHeader: this.defaultSubHeader,
        message: 'Message',
        buttons: ['OK'],
        cssClass: 'error-alert-popup'
    };

    /**
     * Default Toast Message Parameters
     *
     */
    private toastParams: ToastOptions = {
        header: this.defaultHeader,
        message: 'Message',
        position: this.defaultPosition,
        duration: this.defaultDuration,
    };

    /**
     * Default Toast Message Parameters
     *
     */
    private toastNoHeaderParams: ToastOptions = {
        message: 'Message',
        position: this.defaultPosition,
        duration: this.defaultDuration,
    };
    /**
     * Sets the alert box parameters
     *
     * @param message - Alert mesage
     * @param header - Alert header (optional)
     * @param subHeader - Alert subheader (optional)
     * @param buttons - Alert button/s (optional)
     */
    async showAlertMessage(message: string, header?: string, subHeader?: string, buttons?: string[]) {
        this.alertParams.header = (header) ? header : this.defaultHeader;
        this.alertParams.subHeader = (subHeader) ? subHeader : this.defaultSubHeader;
        this.alertParams.message = message;
        this.alertParams.buttons = (buttons) ? buttons : this.defaultButtons;

        const alert = await this.alertCtrl.create(this.alertParams);
        await alert.present();
    }

    /**
     * Sets the error alert box parameters
     *
     * @param message - Alert mesage
     * @param header - Alert header (optional)
     * @param subHeader - Alert subheader (optional)
     * @param buttons - Alert button/s (optional)
     */
    async showErrorAlertMessage(message: string, header?: string, subHeader?: string, buttons?: string[]) {
        this.errorAlertParams.header = (header) ? header : this.defaultHeader;
        this.errorAlertParams.subHeader = (subHeader) ? subHeader : this.defaultSubHeader;
        this.errorAlertParams.message = message;
        this.errorAlertParams.buttons = (buttons) ? buttons : this.defaultButtons;

        const alert = await this.alertCtrl.create(this.errorAlertParams);
        await alert.present();
    }

    /**
     * Sets the HTTP error alert box parameters
     *
     * @param error - HTTP Error Response
     * @param isAPIMRequest - If APIM Request
     * @param isLocalAPIRequest - If Local APIM Request
     */
    async showHTTPErrorAlertMessage(error: HttpErrorResponse, isAPIMRequest: boolean, isLocalAPIRequest: boolean) {
        let errorMessage = '';
        if (error.status === 400 || error.status === 500) {
            if (isLocalAPIRequest) {
                if (error.error.details) {
                    if (error.error.details[0].description) {
                        errorMessage = error.error.details[0].description;
                    }
                    else {
                        errorMessage = error.error.details[0].message;
                    }
                } else if (error.error.message) {
                    errorMessage = error.error.message;
                } else {
                    errorMessage = this.translate.instant('apiErrorMessages.genericError');
                }
            } else if (isAPIMRequest) {
                if (error.error.errors) {
                    errorMessage = error.error.errors[0].message;
                } else if (error.error.userMessage) {
                    errorMessage = error.error.userMessage;
                } else if (error.error.errorMessage) {
                    errorMessage = error.error.errorMessage;
                } else {
                    errorMessage = this.translate.instant('apiErrorMessages.genericError');
                }
            }
            else{
                errorMessage = this.translate.instant('apiErrorMessages.genericError');
            }
        }
        else if ((error.status === 404)) {
            errorMessage = this.translate.instant('apiErrorMessages.error404');
        }
        else {
            errorMessage = this.translate.instant('apiErrorMessages.genericError');
        }

        this.errorAlertParams.header = this.translate.instant('apiErrorMessages.header') + ' (' + error.status + ')';
        this.errorAlertParams.subHeader = '';
        this.errorAlertParams.message = errorMessage;
        this.errorAlertParams.buttons = [this.translate.instant('apiErrorMessages.buttonOk')];

        if (error.status !== 0) {
            const alert = await this.alertCtrl.create(this.errorAlertParams);
            await alert.present();
        }
    }

    /**
     * Sets the toast message parameters
     *
     * @param message - Toast message
     * @param position - Toast position (optional)
     * @param header - Toast header (optional)
     * @param duration - Duration of toast (milliseconds) (optional)
     */
    async showToastMessage(message: string, position?: ToastPosition, header?: string, duration?: number) {
        this.toastParams.header = (header) ? header : this.defaultHeader;
        this.toastParams.message = message;
        this.toastParams.duration = (duration) ? duration : this.defaultDuration;
        this.toastParams.position = (position) ? position : this.defaultPosition;

        const toast = await this.toastCtrl.create(this.toastParams);
        await toast.present();
    }

    /**
     * Sets the toast message parameters
     *
     * @param message - Toast message
     * @param position - Toast position (optional)
     * @param header - Toast header (optional)
     * @param duration - Duration of toast (milliseconds) (optional)
     */
    async showToastMessageNoHeader(message: string, position?: ToastPosition, duration?: number) {
        this.toastNoHeaderParams.message = message;
        this.toastNoHeaderParams.duration = (duration) ? duration : this.defaultDuration;
        this.toastNoHeaderParams.position = (position) ? position : this.defaultPosition;

        const toast = await this.toastCtrl.create(this.toastNoHeaderParams);
        await toast.present();
    }

    /**
     * Creates the modal dialog and redirect to a modal component
     *
     * @param message - Actual message string
     * @param logLevel - LogLevel in typescript-logging
     * @param cssClass - (Optional) css class to be used in the modal, if no param is provided, it will use modal-custom by default
     * Define css in either app.scss or in notification-modal.scss as some css tags will only work in the app.scss
     */
    private async showModalLog(message: string, modalType: ModalType, cssClass?: string) {
        const modal = await this.modalCtrl.create({
            component: NotificationModal,
            cssClass: (cssClass) ? cssClass : 'modal-custom',
            componentProps: {
                message,
                modalType,
            }
        });
        return await modal.present();
    }

    /**
     * Triggers the info notification modal dialog
     */
    showInfoModal(message: string, cssClass?: string) {
        this.showModalLog(message, ModalType.INFO, cssClass);
    }

    /**
     * Triggers the warn notification modal dialog
     */
    showWarnModal(message: string, cssClass?: string) {
        this.showModalLog(message, ModalType.WARN, cssClass);
    }

    /**
     * Triggers the error notification modal dialog
     */
    showErrorModal(message: string, cssClass?: string) {
        this.showModalLog(message, ModalType.ERROR, cssClass);
    }

    /**
     * Triggers the fatal notification modal dialog
     */
    showFatalModal(message: string, cssClass?: string) {
        this.showModalLog(message, ModalType.FATAL, cssClass);
    }

    // Temporary notifier for error alert
    // TODO: removed when custom error notifier/alert becomes available
    showError(message: string): void {
        this.zone.run(() => {
            alert(message);
        });
    }

    async showBubbleHintMessage(message: string) {
        const applyArialFont = this.checkArialFontAllowed();
        const cssClass = applyArialFont ? 'bubble-Hint-model bubble-Hint-model-arial' : 'bubble-Hint-model';
        const alert = await this.alertCtrl.create({
            header: this.defaultHeader,
            subHeader: '',
            message,
            buttons: ['x'],
            cssClass: cssClass
        });
        await alert.present();
    }

    checkArialFontAllowed() {
        return this.config.getSettings('ARIAL_FONT_LANGUAGE_LIST').includes(sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)) ? true : false;
    }
}
