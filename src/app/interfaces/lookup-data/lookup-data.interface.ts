import { CityListResponse } from 'src/app/interfaces/api-service/response/city-list-response.interface';
import { CountryDetailResponse } from 'src/app/interfaces/api-service/response/country-detail-response.interface';
import { CountryDialingPrefixesResponse } from 'src/app/interfaces/api-service/response/country-dialing-prefixes-response.interface';
import { Currency } from 'src/app/interfaces/api-service/response/currency';
import { ConfigList } from 'src/app/interfaces/api-service/response/configlist';
import { CommodityManufactureResponse } from 'src/app/interfaces/api-service/response/commodity-manufacture-response.interface';
import { ManufactureCountriesList } from '../api-service/response/manufacture-countries-list.interface';
import { CreateShipmentResponse } from '../api-service/response/create-shipment-response';
import { SenderRecipientInfoResponse } from '../api-service/response/sender-recipient-info-response';
import { KeyTexts } from '../api-service/response/key-texts';
import { SystemCommodity } from '../api-service/response/system-commodity';
import { ApiResponse } from '../api-service/response/api-response';
import { Country } from '../api-service/response/country';
import { IAddressDataList } from '../mock-data/address-data-list.interface';
import { KeyTextList } from '../api-service/common/key-text-list';

export interface ILookupData {
    senderCountries: Country[];
    senderCities: CityListResponse[];
    recipientCountries: Country[];
    recipientCities: CityListResponse[];
    selectedRecipientCountryDetails: CountryDetailResponse;
    selectedSenderCountryDetails: CountryDetailResponse;
    selectedCountryDialingPrefix: CountryDialingPrefixesResponse;
    currencyListUS: Currency[];
    currencyListLocal: ConfigList[];
    mergedCurrencyList: Currency[];
    shipmentPurpose: KeyTextList;
    listOfcountryOfManufactureUS: ManufactureCountriesList[];
    listOfcountryOfManufactureLocal: ConfigList[];
    mergedListOfcountryOfManufacture: any[];
    createShipmentError: any;
    createShipmentSuccess: CreateShipmentResponse;
    senderRecipientInfo: SenderRecipientInfoResponse;
    documentDescriptions: KeyTextList;
    uomListUS: KeyTextList;
    uomListLocal: ConfigList[];
    mergedUomList: KeyTexts[];
    shipmentFeedackSuccess: any;
    systemCommodityList: SystemCommodity[];
    ratesDiscountSuccess: ApiResponse;
    ratesDiscountError: any;
    defaultSenderDetails: IAddressDataList;
    recipientListDetails: IAddressDataList;
    pendingShipmentDetails?: any;
    confirmedShipmentDetails?: any;
    userCommodityList?: any[];
    mergedSubCategoryCommodityList?: SystemCommodity[]
}