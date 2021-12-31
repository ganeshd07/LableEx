import { EmailRecipient } from './email-recipient';
import { ProcessingParameters } from './processing-parameters';

export interface EmailNotificationDetail {
    personalMessage: string;
    recipients: EmailRecipient[];
    processingParameters?: ProcessingParameters;
}
