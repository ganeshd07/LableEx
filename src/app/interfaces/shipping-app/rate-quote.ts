import { Surcharge } from '../api-service/response/surcharge';

export interface IRateQuote {
    dayOfWeek: string;
    dateOfArrival: string;
    timeOfArrival: string;
    totalNetCharge: number;
    totalBaseCharge: number;
    surchargeList: Surcharge[];
    volumeDiscount: number;
    currency: string;
    saturdayDelivery: boolean;    
}
