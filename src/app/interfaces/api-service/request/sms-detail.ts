import { ProcessingParameters } from './processing-parameters';

export interface SmsDetail {
    phoneNumber: string;
    phoneNumberCountryCode: string;
    processingParameters?: ProcessingParameters;
}
