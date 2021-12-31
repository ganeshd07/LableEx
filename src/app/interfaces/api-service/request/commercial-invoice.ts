import { Amount } from '../common/amount';

export interface CommercialInvoice {
    shipmentPurpose: string;
    termsOfSale?: string;
    specialInstructions?: string;
    comments?: string[];
    freightCharge?: Amount;
    taxesOrMiscellaneousCharge?: Amount;
    taxesOrMiscellaneousChargeType?: string;
    packingCosts?: Amount;
    handlingCosts?: Amount;
    paymentTerms?: string;
    customerReference?: string;
}
