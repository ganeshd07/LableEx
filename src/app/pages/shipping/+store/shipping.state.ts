import { ICustomsInfo } from 'src/app/interfaces/shipping-app/customs-info';
import { IPayment } from 'src/app/interfaces/shipping-app/payment';
import { IRecipient } from 'src/app/interfaces/shipping-app/recipient';
import { ISender } from 'src/app/interfaces/shipping-app/sender';
import { IShipmentDetails } from 'src/app/interfaces/shipping-app/shipment-details';
import { IShipmentResults } from 'src/app/interfaces/shipping-app/shipment-results';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import { ILookupData } from 'src/app/interfaces/lookup-data/lookup-data.interface';

export interface ShippingInfo {
    userAccount: IUser;
    shipmentDetails: IShipmentDetails;
    customsDetails: ICustomsInfo;
    senderDetails: ISender;
    recipientDetails: IRecipient[];
    paymentDetails: IPayment;
    shipmentConfirmation: IShipmentResults;
    lookupData?: ILookupData;    
}

export const initialState: ShippingInfo = {
    userAccount: null,
    shipmentDetails: null,
    customsDetails: null,
    senderDetails: null,
    recipientDetails: null,
    paymentDetails: null,
    shipmentConfirmation: null
};
