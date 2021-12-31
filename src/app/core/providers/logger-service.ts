import { Injectable } from '@angular/core';
import { LogLevel } from '../../types/enum/log-level.enum';
import { Logger } from '../../models/logger.model';
import { environment } from '../../../environments/environment';
import { throwError } from 'rxjs';
import { DatePipe } from '@angular/common';
import { Category, LogLevel as TypesciptLogLevel } from 'typescript-logging';
import { NotificationService } from './notification-service';
import { NotificationConstants } from '../../types/constants/notification-message.constants';
import { ToastPosition } from '../../types/enum/toast-position.enum';
/**
 * This is a typescript-logging service to be used in LABELEX application
 * It provides a flexible logging and control.
 * 
 * Author: Marlon Micael J. Cuevas
 * Date Created: Apr 21, 2020 
 */

@Injectable()
export class LoggerService {

    constructor(private datePipe: DatePipe, private notif: NotificationService) { }

    private environmentLogLevel: LogLevel = environment.logger;
    private logger: Logger = new Logger();
    private category: Category;

    /**
     * Checks if the logging service will be triggered. 
     * 
     * @param level 
     */
    private loggerChecker(level): boolean {
        let isLog = false;
        if (level >= this.environmentLogLevel &&
            this.environmentLogLevel !== LogLevel.OFF) {
            isLog = true;
        }
        return isLog;
    }

    /**
     * Provides the actual logging of the message.
     * 
     * @param category - category type in category-config.ts
     * @param level - Loglevel under typescript-logging
     * @param optionalParams - set of string/numbers/any object to output to console
     */
    private writeToLog(category: Category,
        level: TypesciptLogLevel,
        optionalParams: any[]) {
        this.logger.level = level;
        this.logger.additionalInfo = optionalParams;

        if (this.loggerChecker(level)) {
            let compiledString = this.buildLogString();
            if (level === TypesciptLogLevel.Info) {
                category.info(compiledString, category);
            } else if (level === TypesciptLogLevel.Warn) {
                category.warn(compiledString, category);
            } else if (level === TypesciptLogLevel.Debug) {
                category.debug(compiledString, category);
            } else if (level === TypesciptLogLevel.Fatal) {
                category.fatal(compiledString, new Error(NotificationConstants.ERROR_PRINTSTACKTRACE), category);
                this.notif.showToastMessage(compiledString, ToastPosition.BOTTOM, NotificationConstants.DEFAULT_FATAL_MESSAGE);
            } else {
                category.error(compiledString, new Error(NotificationConstants.ERROR_PRINTSTACKTRACE), category);
                this.notif.showToastMessage(compiledString, ToastPosition.BOTTOM, NotificationConstants.DEFAULT_ERROR_MESSAGE);
                // throw new Error(NotificationConstants.ERROR_PRINTSTACKTRACE);
            }
        }
    }

    /**
     * Builds the log string to be displayed
     */
    private buildLogString(): string {
        let logString = '';
        if (this.logger.additionalInfo.length) {
            logString = this.formatParams(this.logger.additionalInfo);
        }

        return logString;
    }

    /**
     * Formats the params object to string output
     * 
     * @param params - any object/string/number
     */
    private formatParams(params: any[]): string {
        let additionalInfo: string = params.join(',');

        if (params.some(p => typeof p == 'object')) {
            additionalInfo = '';
            for (let item of params) {
                additionalInfo += JSON.stringify(item) + ',';
            }
        }
        return additionalInfo;
    }

    /**
     * Debug level logging (this does not output to browser's console)
     * This appears in typescript-logging extension
     * 
     * @param category - category type in category-config.ts
     * @param optionalParams - set of string/numbers/any object to output to console
     */
    debug(category: Category, ...optionalParams: any[]) {
        this.writeToLog(category, TypesciptLogLevel.Debug, optionalParams);
    }

    /**
     * Info level logging (this is the default logging to use)
     * 
     * @param category - category type in category-config.ts
     * @param optionalParams - set of string/numbers/any object to output to console
     */
    info(category: Category, ...optionalParams: any[]) {
        this.writeToLog(category, TypesciptLogLevel.Info, optionalParams);
    }

    /**
     * Warning level logging
     * 
     * @param category - category type in category-config.ts
     * @param optionalParams - set of string/numbers/any object to output to console
     */
    warn(category: Category, ...optionalParams: any[]) {
        this.writeToLog(category, TypesciptLogLevel.Warn, optionalParams);
    }

    /**
     * Error level logging
     * 
     * @param category - category type in category-config.ts
     * @param optionalParams - set of string/numbers/any object to output to console
     */
    error(category: Category, ...optionalParams: any[]) {
        this.writeToLog(category, TypesciptLogLevel.Error, optionalParams);
    }

    /**
     * Fatal level logging
     * 
     * @param category - category type in category-config.ts
     * @param optionalParams - set of string/numbers/any object to output to console
     */
    fatal(category: Category, ...optionalParams: any[]) {
        this.writeToLog(category, TypesciptLogLevel.Fatal, optionalParams);
    }

    /**
     * Custom logging in case needed
     * 
     * @param category - category type in category-config.ts
     * @param typesciptLogLevel - Loglevel under typescript-logging
     * @param optionalParams - set of string/numbers/any object to output to console
     */
    log(category: Category, typesciptLogLevel: TypesciptLogLevel, ...optionalParams: any[]) {
        this.writeToLog(category, typesciptLogLevel, optionalParams);
    }

    /**
     * Handle HTTP Client errors (not being used yet)
     * 
     * @param error - http response error
     */
    handleError(error, category: Category) {
        let errorMessage;
        if (error.error instanceof ErrorEvent) {
            // client-side error
            errorMessage = `${NotificationConstants.DEFAULT_ERROR_MESSAGE}: ${error.error.message}`;
            this.error(category, error.error);
        } else {
            // server-side error
            errorMessage = `${NotificationConstants.ERROR_CODE_MESSAGE}: ${error.status}\n${NotificationConstants.DEFAULT_MESSAGE}: ${error.message}`;
            this.error(category, error);
        }
        return throwError(errorMessage);
    }
}
