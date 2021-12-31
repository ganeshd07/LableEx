import { State } from './state.interface';

export interface CountryDetailResponse {
    countryName: string;
    countryCode: string;
    domesticShippingAllowed?: boolean;
    domesticShippingUsesInternationalServices?: boolean;
    maxCustomsValue?: number;
    numberOfCommercialInvoices?: number;
    postalAware: boolean;
    regionCode?: string;
    currencyCode?: string;
    domesticCurrencyCode?: string;
    anyPostalAwareness?: boolean;
    customsValueRequired?: boolean;
    minCustomsValue?: number;
    documentProductApplicable?: boolean;
    states?: State[];
}
