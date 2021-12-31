import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerService } from './logger-service';
import { markerHttpReqService } from '../../types/category-config';
import { NotificationService } from './notification-service';
import { Error } from '../../interfaces/api-service/response/error';
import { NotificationConstants } from '../../types/constants/notification-message.constants';
import { ConfigService } from '@ngx-config/core';

/**
 * @description This is a global error handler class that handles all
 * the error types from client-side to server-side.
 * 
 * NOTE: NO NEED TO CATCH ERROR VIA SUBSCRIBE(); 
 * Any http error handling is being catched via 
 * global http interceptor, any unhandled client/server errors 
 * must be placed here.
 * 
 * Therefore, any additional error handling must ONLY be added
 * within this class which would be uniformly applied to all 
 * the classes including the notifications except for success
 * or info messages.
 * 
 * @author: Roan Villaflores
 * Date Created: May 04, 2020
 * 
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
    protected APIM_HOST_URI = '';

    constructor(
        private injector: Injector,
        private readonly config: ConfigService
    ) {
        this.APIM_HOST_URI = this.config.getSettings('APIM').HOST;
    }

    handleError(error: Error | HttpErrorResponse): void {
        // service dependency injections
        const logger = this.injector.get(LoggerService);
        const notifier = this.injector.get(NotificationService);

        if (error instanceof HttpErrorResponse) {
            /**
             * All SERVER-SIDE ERRORS must be handled here
             */
            let isAPIMRequest: boolean = (error.url.startsWith(this.APIM_HOST_URI));
            switch (error.status) {
                case 400: // Bad Request
                    if (isAPIMRequest) {
                        let errorObject: Error = error.error.errors[0];
                        logger.error(markerHttpReqService, `ERROR - CODE: ${errorObject.code}, MESSAGE: ${errorObject.message}`);
                    } else {
                        // for non-apim errors
                        logger.error(markerHttpReqService, `ERROR - STATUS: ${error.status}, MESSAGE: ${error.message}`);
                    }
                    break;
                case 404: // Requested Resource Not Found
                    // TODO: create route to navigate in page 404  
                    logger.error(markerHttpReqService, `ERROR - STATUS: ${error.status}, MESSAGE: REQUEST NOT FOUND.`);
                    break;
                case 405: // Method Not Allowed
                    // TODO: create route to navigate in page 405 
                    if (isAPIMRequest) {
                        let apimErrorObj = error.error;
                        logger.error(markerHttpReqService, `ERROR - STATUS: ${error.status}, MESSAGE: ${apimErrorObj.message}`);
                    } else {
                        logger.error(markerHttpReqService, `ERROR - STATUS: ${error.status}, MESSAGE: REQUEST METHOD NOT SUPPORTED.`);
                    }
                    break;
                case 500: // Internal Server Error
                    // TODO: do more error handling here, like navigating during login failure (after login feature becomes available)
                    logger.error(markerHttpReqService, `ERROR - STATUS: ${error.status}, MESSAGE: REQUEST FAILED, URL: ${error.url} IS UNREACHABLE!`);
                    break;
                default:
                    // other generic error message
                    logger.error(markerHttpReqService, `ERROR - STATUS: ${error.status}, MESSAGE: ${error.message}`);
            }
        } else {
            /**
             * CLIENT-SIDE ERROR logger & notifier
             */
            // Placed all the notification service calls here.
            logger.error(markerHttpReqService, `${error}`);
            notifier.showAlertMessage(`Error: ${error.message}`, NotificationConstants.DEFAULT_ERROR_MESSAGE);
        }
    }
}
