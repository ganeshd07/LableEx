import { Surcharge } from '../api-service/response/surcharge';

export interface IRatesForm {
    dayCxsFormat: string;
    dayOfWeek: string;
    date: string;
    time: string;
    serviceType: string;
    serviceName: string;
    serviceHint?: string;
    currency: string;
    totalNetChargeBeforeDiscount: number;
    totalNetChargeAfterDiscount: number;
    totalNetCharge: number;
    totalBaseCharge: number;
    vat?: number;
    surcharges: Surcharge[];
    discounts?: any[];
    totalDiscount: number;
    toggleBreakdown: boolean;
    tempDateDetails: string;
    saturdayDelivery: boolean;
}
