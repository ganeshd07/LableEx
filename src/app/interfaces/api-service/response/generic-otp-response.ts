import { OtpPhoneResponse } from './otp-phone-response';

export interface GenericOtpResponse {
    txId: string;
    authType: string;
    otpEmailDeliveryRes: string;
    otpPhoneDeliveryRes: OtpPhoneResponse;
    status: string;
    message: string;
    error?: string;
}
