import { IPackageDetails } from './package-details';
import { IRateQuote } from './rate-quote';
import { ISpecialServices } from './special-services';

export interface IShipmentDetails {
    packageDetails: IPackageDetails[];
    totalNumberOfPackages: number;
    totalWeight: number;
    serviceType: string;
    serviceName: string;
    packagingType: string;
    serviceCode: string;
    advancedPackageCode: string;
    totalCustomsOrInvoiceValue: number;
    customsOrInvoiceValueCurrency: string;
    carriageDeclaredValue: number;
    carriageDeclaredValueCurrency: string;
    displayDate: string;
    shipDate: Date;
    selectedRate: IRateQuote;
    firstAvailableShipDate: Date;
    lastAvailableShipDate: Date;
    availableShipDates: Date[];
    selectedPackageOption: null;
    specialServiceInfo: ISpecialServices;
    currencyDisplayValue?: string;
}
