import { Amount } from '../common/amount';
import { CommercialInvoice } from './commercial-invoice';
import { Commodity } from './commodity';
import { Payment } from './payment';
import { ProcessingParameters } from './processing-parameters';

export interface CustomsClearanceDetail {
    documentContent?: string;
    dutiesPayment?: Payment;
    commodities: Commodity[];
    totalCustomsValue?: Amount;
    totalCustomsValueOfCommodities?: Amount;
    generateCommercialInvoice?: boolean;
    processingParameters?: ProcessingParameters;
    commercialInvoice?: CommercialInvoice;
    insuranceCharges?: number;
}
