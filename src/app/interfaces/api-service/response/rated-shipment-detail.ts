import { Amount } from '../common/amount';
import { ShipmentLegRateDetail } from './shipment-leg-rate-detail';
import { ShipmentRateDetail } from './shipment-rate-detail';

export interface RatedShipmentDetail {
    rateType: string;
    ratedWeightMethod: string;
    totalBaseCharge: Amount[];
    totalNetCharge: Amount[];
    totalVatCharge: Amount[];
    totalNetFedExCharge: Amount[];
    totalDutiesAndTaxes: Amount[];
    totalNetChargeWithDutiesAndTaxes: Amount[];
    shipmentLegRateDetails: ShipmentLegRateDetail[];
    ancillaryFeesAndTaxes: any[];
    totalDutiesTaxesAndFees: Amount[];
    totalAncillaryFeesAndTaxes: Amount[];
    shipmentRateDetail: ShipmentRateDetail;
}
