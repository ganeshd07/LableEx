import { Amount } from '../common/amount';
import { Discount } from './discount';
import { Surcharge } from './surcharge';

export interface ShipmentLegRateDetail {
    rateScale: string;
    totalBaseCharge: Amount[];
    totalNetCharge: Amount[];
    taxes: any[];
    surcharges: Surcharge[];
    discounts: Discount[];
}
