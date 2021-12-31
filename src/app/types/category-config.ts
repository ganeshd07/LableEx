import { Category, CategoryServiceFactory, CategoryConfiguration, LogLevel } from 'typescript-logging';
import { LoggingCategory } from './enum/logging-category.enum';

/**
 * This is the category to be used for logging services in LABELEX application
 * Please put all categories of logging as needed.
 * 
 * Author: Marlon Micael J. Cuevas
 * Date Created: Apr 29, 2020 
 */

CategoryServiceFactory.setDefaultConfiguration(new CategoryConfiguration(LogLevel.Info));

/**
 * Create categories by component/page for logger service
 * 
 */
export const markerMain = new Category(LoggingCategory.MAIN);

export const markerHome = new Category(LoggingCategory.HOME, markerMain);
export const markerLogin = new Category(LoggingCategory.LOGIN, markerMain);
export const markerSenderDetails = new Category(LoggingCategory.SENDER_DETAILS, markerMain);
export const markerRecipientDetails = new Category(LoggingCategory.RECIPIENT_DETAILS, markerMain);
export const markerShipmentDetails = new Category(LoggingCategory.SHIPMENT_DETAILS, markerMain);

export const markerHttpReqService = new Category(LoggingCategory.HTTP_INTERCEPTOR, markerMain);
