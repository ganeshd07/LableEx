import { Amount } from '../common/amount';
import { Surcharge } from './surcharge';


export interface ShipmentRateDetail {
    rateZone: string;
    dimDivisor: number;
    fuelSurchargePercent: number;
    totalSurcharges: Amount;
    totalFreightDiscount: Amount;
    freightDiscount: any[];
    surCharges: Surcharge[];
}
