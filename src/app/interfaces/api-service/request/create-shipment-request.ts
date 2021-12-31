import { SpecialServicesRequested } from './special-services-requested';
import { RequestedPackageLineItem } from './requested-package-line-item';
import { Payment } from './payment';
import { ResponsibleParty } from './responsible-party';
import { CustomsClearanceDetail } from './customs-clearance-detail';
import { UserProfileRequest } from './user-profile-request';

export interface CreateShipmentRequest {
    user: UserProfileRequest;
    createDate?: string;
    serviceType?: string;
    specialServicesRequested?: SpecialServicesRequested;
    packagingType: string;
    pickupType: string;
    shippingChargesAmount: string;
    status: string;
    totalPackageCount: string;
    totalWeight: string;
    shipper: ResponsibleParty;
    recipient: ResponsibleParty;
    requestedPackageLineItems: RequestedPackageLineItem[];
    shippingChargesPayment: Payment;
    customsClearanceDetail: CustomsClearanceDetail;
}
