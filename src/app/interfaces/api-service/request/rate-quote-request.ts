import { RateRequestControlParameters } from './rate-request-control-parameters';
import { RequestedShipment } from './requested-shipment';

export interface RateQuoteRequest {
    rateRequestControlParameters: RateRequestControlParameters;
    requestedShipment: RequestedShipment;
    carrierCodes: string[];
    returnLocalizedDateTime: boolean;
    webSiteCountryCode: string;
}
