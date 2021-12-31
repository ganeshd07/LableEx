import { CustomsClearanceDetail } from './customs-clearance-detail';
import { EmailNotificationDetail } from './email-notification-detail';
import { Origin } from './origin';
import { RequestedPackageLineItem } from './requested-package-line-item';
import { ResponsibleParty } from './responsible-party';
import { Payment } from './payment';
import { SpecialServicesRequested } from './special-services-requested';
import { VariableHandlingChargeDetail } from './variable-handling-charge-detail';

export interface RequestedShipment {
    edtRequestType?: string;
    rateRequestedType?: string[];
    shipper: ResponsibleParty;
    recipients: ResponsibleParty[];
    shipTimestamp?: string;
    pickupType: string;
    serviceType: string;
    packagingType?: string;
    shippingChargesPayment?: Payment;
    specialServicesRequested?: SpecialServicesRequested;
    customsClearanceDetail: CustomsClearanceDetail;
    blockInsightVisibility?: boolean;
    requestedPackageLineItems: RequestedPackageLineItem[];
    totalWeight?: number;
    totalPackageCount?: number;
    origin?: Origin;
    emailNotificationDetail?: EmailNotificationDetail;
    preferredCurrency?: string;
    variableHandlingChargeDetail?: VariableHandlingChargeDetail;
    shippingLabelType?: string;
    groupShipment?: boolean;
    expressShipment?: boolean;
    groundShipment?: boolean;
    documentShipment?: boolean;
}
