import { ProcessingParameters } from './processing-parameters';
import { SmsDetail } from './sms-detail';

export interface EmailRecipient {
    emailAddress: string;
    emailNotificationRecipientType: string;
    smsDetail: SmsDetail;
    notificationEventType: string[];
    notificationType: string;
    notificationFormatType: string;
    locale?: string;
    processingParameters: ProcessingParameters;
}

