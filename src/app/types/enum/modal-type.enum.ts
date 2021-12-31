/**
 * Modal types to use with notification modals
 * This is a custom modal type to define the design to be used.
 * This is tied up to CSS classes defined in notification-modal.scss
 * 
 * Author: Marlon Micael J. Cuevas
 * Date Created: May 13, 2020 
 */
export enum ModalType {
    INFO = 'modal-info',
    WARN = 'modal-warn',
    ERROR = 'modal-error',
    FATAL = 'modal-fatal',
}