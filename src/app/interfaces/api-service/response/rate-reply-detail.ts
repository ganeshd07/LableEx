import { Commit } from './commit';
import { Message } from './message';
import { RatedShipmentDetail } from './rated-shipment-detail';

export interface RateReplyDetail {
    serviceType: string;
    serviceSubOptionDetail: {};
    serviceName: string;
    packagingType: string;
    commit: Commit;
    customerMessages: Message[];
    ratedShipmentDetails: RatedShipmentDetail[];
    anonymouslyAllowable: boolean;
    operationalDetail: {};
    saturdayDelivery: boolean;
}
