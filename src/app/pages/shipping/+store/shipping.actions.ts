import { createAction, props } from '@ngrx/store';
import { ICommodity } from 'src/app/interfaces/shipping-app/commodity';
import { ICustomsInfo } from 'src/app/interfaces/shipping-app/customs-info';
import { IRateQuote } from 'src/app/interfaces/shipping-app/rate-quote';
import { IRecipient } from 'src/app/interfaces/shipping-app/recipient';
import { ISender } from 'src/app/interfaces/shipping-app/sender';
import { IShipmentDetails } from 'src/app/interfaces/shipping-app/shipment-details';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import { IPayment } from 'src/app/interfaces/shipping-app/payment';
import { ISpecialServices } from 'src/app/interfaces/shipping-app/special-services';
import { CountryTypes } from 'src/app/types/enum/country-type.enum';
import { Currency } from 'src/app/interfaces/api-service/response/currency';
import { CommodityManufactureResponse } from 'src/app/interfaces/api-service/response/commodity-manufacture-response.interface';
import { ShippingInfo } from './shipping.state';
import { SenderRecipientInfoResponse } from 'src/app/interfaces/api-service/response/sender-recipient-info-response';
import { KeyTexts } from 'src/app/interfaces/api-service/response/key-texts';
import { ApiResponse } from 'src/app/interfaces/api-service/response/api-response';
import { CommercialInvoice } from 'src/app/interfaces/api-service/request/commercial-invoice';
import { IAddressDataList } from 'src/app/interfaces/mock-data/address-data-list.interface';
import { KeyTextList } from 'src/app/interfaces/api-service/common/key-text-list';
import { Country } from 'src/app/interfaces/api-service/response/country';
import { AddressTypes } from 'src/app/types/enum/address-type.enum';
import { SystemCommodity } from 'src/app/interfaces/api-service/response/system-commodity';

export const loadShippings = createAction('[Shipping] Load Shippings');
export const loadShippingsSuccess = createAction('[Shipping] Load Shippings Success', props<{ data: any }>());
export const loadShippingsFailure = createAction('[Shipping] Load Shippings Failure', props<{ error: any }>());

// TODO: This is for demo purposes only, it's subject to change
export const saveSenderAddressAction = createAction('[Shipping] Save Sender Address', props<{ senderDetails: ISender }>());
export const saveRecipientDetailsAction = createAction('[Shipping] Save Recipient Details',
    props<{ recipientDetailsList: IRecipient[] }>());

export const saveUserAccountAction = createAction('[Shipping] Save User Account', props<{ userAccount: IUser }>());
export const saveUserAccountActionSuccess = createAction('[Shipping] Save User Account Success', props<{ data: any }>());
export const saveUserAccountActionFailure = createAction('[Shipping] Save User Account Failure', props<{ error: any }>());

export const addCommodityAction = createAction('[Shipping] Add item to customs commodity list', props<{ commodity: ICommodity }>());
export const updateSelectedRate = createAction('[Shipping] Update selected rate', props<{ rateDetails: IRateQuote }>());
export const updateCustomsDetailsAction = createAction('[Shipping] Update customsDetails', props<{ customsDetails: ICustomsInfo }>());

export const updateShipmentDetailsAction = createAction('[Shipping] Update shipmentDetails', props<{ shipmentDetails: IShipmentDetails }>());

export const saveRecipientAddressSelectedAction = createAction('[Recipient Address Selected] Recipient Address Selected', props<{ selectedRecipient: IRecipient }>());

export const saveMergedCurrencyListAction = createAction('[Shipping] Save Merged Currency List', props<{ mergedCurrencyList: Currency[] }>());
export const saveMergedCountryOfManufactureListAction = createAction('[Shipping] Save Merged Country of Manufacture List', props<{ mergedListOfcountryOfManufacture: CommodityManufactureResponse[] }>());

export const resetNewShippingAction = createAction('[Shipping] New Shipment');
export const savePaymentsDetailsAction = createAction('[Shipping] Save Payment details', props<{ paymentDetails: IPayment, specialServiceInfo: ISpecialServices }>());

// Get Sender Country Actions
export const getSenderCountriesBegin = createAction('[Shipping] Sender GET Countries Begin', props<{ countryType: CountryTypes }>());
export const getSenderCountriesSuccess = createAction('[Shipping] Sender GET Countries Success', props<{ data: Country[] }>());
export const getSenderCountriesFailure = createAction('[Shipping] Sender GET Countries Failure', props<{ error: any }>());

// Get Recipient Country Actions
export const getRecipientCountriesBegin = createAction('[Shipping] Recipient GET Countries Begin', props<{ countryType: CountryTypes }>());
export const getRecipientCountriesSuccess = createAction('[Shipping] Recipient GET Countries Success', props<{ data: Country[] }>());
export const getRecipientCountriesFailure = createAction('[Shipping] Recipient GET Countries Failure', props<{ error: any }>());

// Get Selected Recipient Country Details Actions
export const getSelectedRecipientCountryDetailsBegin = createAction('[Shipping] Recipient GET Selected Country Details Begin', props<{ countryCode: any }>());
export const getSelectedRecipientCountryDetailsSuccess = createAction('[Shipping] Recipient GET Selected Country Details Success', props<{ data: any }>());
export const getSelectedRecipientCountryDetailsFailure = createAction('[Shipping] Recipient GET Selected Country Details Failure', props<{ error: any }>());

// Get Recipient City List Actions
export const getRecipientCityListBegin = createAction('[Shipping] Recipient GET City List Begin', props<{ countryCode: any, postalCode: any }>());
export const getRecipientCityListSuccess = createAction('[Shipping] Recipient GET City List Success', props<{ data: any }>());
export const getRecipientCityListFailure = createAction('[Shipping] Recipient GET City List Failure', props<{ error: any }>());

// Get Country details Actions
export const getSelectedSenderCountryDetailsBegin = createAction('[Shipping] Get Sender Country Details Begin', props<{ countryCode: string }>());
export const getSelectedSenderCountryDetailsSuccess = createAction('[Shipping] Get Sender Country Details Success', props<{ data: any }>());
export const getSelectedSenderCountryDetailsFailure = createAction('[Shipping] Get Sender Country Details Failure', props<{ error: any }>());

// Get Sender Cities Actions
export const getSenderCityListBegin = createAction('[Shipping] Get Cities List Begin', props<{ countryCode: string, postalCode: string }>());
export const getSenderCityListSuccess = createAction('[Shipping] Get Cities List Success', props<{ data: any }>());
export const getSenderCityListFailure = createAction('[Shipping] Get Cities List Failure', props<{ error: any }>());

// Get Country Dialing Prefixes Actions
export const getCountryDialingPrefixesBegin = createAction('[Shipping] Get Country Dialing Prefixes begin');
export const getCountryDialingPrefixesSuccess = createAction('[Shipping] Get Country Dialing Prefixes Success', props<{ data: any }>());
export const getCountryDialingPrefixesFailure = createAction('[Shipping] Get Country Dialing Prefixes Failure', props<{ data: any }>());

// edit and Delete in Customs-Details
export const deleteCoustomsdetailsBegin = createAction('[Shipping] delete item to customs commodity list', props<{ id: number }>());
export const updateCustomsDetailsBegin = createAction('[shipping] update item to customs detals', props<{ id: number, commodity: ICommodity }>());

// Get Currency List US API Actions
export const getCurrencyListUSApiBegin = createAction('[Shipping] Get Currency List US API begin');
export const getCurrencyListUSApiSuccess = createAction('[Shipping] Get Currency List US API Success', props<{ data: any }>());
export const getCurrencyListUSApiFailure = createAction('[Shipping] Get Currency List US API Failure', props<{ data: any }>());

//Get Currency List Local API Actions
export const getCurrencyListLocalApiBegin = createAction('[Shipping] Get Currency List Local API begin', props<{ countryCode: string, configType: string }>());
export const getCurrencyListLocalApiSuccess = createAction('[Shipping] Get Currency List Local API Success', props<{ data: any }>());
export const getCurrencyListLocalApiFailure = createAction('[Shipping] Get Currency List Local API Failure', props<{ data: any }>());

// Get Items shipmentpurpose Actions
export const getShipmentPurposeBegin = createAction('[Shipping] GET Shipmentpupose details Begin', props<{ senderCountryCode: string, recipientCountryCode: string, serviceType: string }>());
export const getShipmentPurposeSuccess = createAction('[Shipping] GET Shipmentpurpose details Success', props<{ shipmentPurposeList: any }>());
export const getShipmentPurposeFailure = createAction('[Shipping] GET Shipmentpurpose details  Failure', props<{ error: any }>());

// Get Country of Manufacture LOCAL Actions
export const getCountryOfManufactureLocalApiBegin = createAction('[Shipping] GET Country of Manufacture LOCAL API Begin', props<{ countryCode: string, configType: string }>());
export const getCountryOfManufactureLocalApiSuccess = createAction('[Shipping] GET Country of Manufacture LOCAL API Success', props<{ data: any }>());
export const getCountryOfManufactureLocalApiFailure = createAction('[Shipping] GET Country of Manufacture LOCAL API Failure', props<{ data: any }>());

// Get Country of Manufacture US Actions
export const getCountryOfManufactureUSApimBegin = createAction('[Shipping] GET Country of Manufacture US APIM Begin', props<{ countryType: string }>());
export const getCountryOfManufactureUSApimSuccess = createAction('[Shipping] GET Country of Manufacture US APIM Success', props<{ data: any }>());
export const getCountryOfManufactureUApimFailure = createAction('[Shipping] GET Country of Manufacture US APIM Failure', props<{ data: any }>());

// Get Sender-Recipient Info Actions
export const getSenderRecipientInfoBegin = createAction('[Shipping] GET Sender-Recipient Info Begin', props<{ senderCountryCode: string, recipientCountryCode: string }>());
export const getSenderRecipientInfoSuccess = createAction('[Shipping] GET Sender-Recipient Info Success', props<{ senderRecipientInfo: SenderRecipientInfoResponse }>());
export const getSenderRecipientInfoFailure = createAction('[Shipping] GET Sender-Recipient Info  Failure', props<{ error: any }>());

// Get Document Descriptions Actions
export const getDocumentDescriptionsBegin = createAction('[Shipping] GET Document Descriptions Begin', props<{ senderCountryCode: string, recipientCountryCode: string, setAdvanced: boolean }>());
export const getDocumentDescriptionsSuccess = createAction('[Shipping] GET Document Descriptions Success', props<{ documentDescriptions: KeyTextList }>());
export const getDocumentDescriptionsFailure = createAction('[Shipping] GET Document Descriptions  Failure', props<{ error: any }>());

// Get Items US API Unit of measure Actions
export const getUomListUSApiBegin = createAction('[Shipping] GET UOM List US API begin');
export const getUomListUSApiSuccess = createAction('[Shipping] GET UOM List US API Success', props<{ data: KeyTextList }>());
export const getUomListUSApiFailure = createAction('[Shipping] GET UOM List US API Failure', props<{ data: any }>());

//Get UOM List Local API Actions
export const getUomListLocalApiBegin = createAction('[Shipping] GET UOM List Local API begin', props<{ countryCode: string, configType: string }>());
export const getUomListLocalApiSuccess = createAction('[Shipping] GET UOM List Local API Success', props<{ data: any }>());
export const getUomListLocalApiFailure = createAction('[Shipping] GET UOM List Local API Failure', props<{ data: any }>());

export const saveMergedUomListAction = createAction('[Shipping] Save Merged UOM List', props<{ mergedUomList: KeyTexts[] }>());

// Post create shipment Actions
export const postCreateShipmentBegin = createAction('[Shipping] POST Create Shipment Begin', props<{ shipmentDetails: ShippingInfo }>());
export const postCreateShipmentSuccess = createAction('[Shipping] POST Create Shipment Success', props<{ data: any }>());
export const postCreateShipmentFailure = createAction('[Shipping] POST Create Shipment Failure', props<{ error: any }>());

//Post Shipment Feedback Actions
export const postShipmentFeedbackBegin = createAction('[Shipping] POST Shipment Feedback Begin', props<{ shipmentId: string, score: string, comment: string, }>());
export const postShipmentFeedbackSuccess = createAction('[Shipping] POST Shipment Feedback Success', props<{ data: any }>());
export const postShipmentFeedbackFailure = createAction('[Shipping] POST Shipment Feedback  Failure', props<{ error: any }>());

//Get System Commodity List Actions
export const getSystemCommodityListBegin = createAction('[Shipping] GET System Commodity List Begin', props<{ category: string }>());
export const getSystemCommodityListSuccess = createAction('[Shipping] GET System Commodity List Success', props<{ data: any }>());
export const getSystemCommodityListFailure = createAction('[Shipping] GET System Commodity List Failure', props<{ error: any }>());
export const removeSystemCommodityListOnSelection = createAction('[Shipping] Remove System Commodity List On Selection');

//Get User Commodity List Actions
export const getUserCommodityListBegin = createAction('[Shipping] GET User Commodity List Begin', props<{ uid: string, category: string }>());
export const getUserCommodityListSuccess = createAction('[Shipping] GET User Commodity List Success', props<{ data: any }>());
export const getUserCommodityListFailure = createAction('[Shipping] GET User Commodity List Failure', props<{ error: any }>());

// Get Local API Rates Discount By CountryCode
export const getRatesDiscountByCountryBegin = createAction('[Shipping] GET Rates Discount By Country Begin', props<{ countryCode: string }>());
export const getRatesDiscountByCountrySuccess = createAction('[Shipping] GET Rates Discount By Country Success', props<{ data: ApiResponse }>());
export const getRatesDiscountByCountryFailure = createAction('[Shipping] GET Rates Discount By Country Failure', props<{ error: any }>());

//update currency display value
export const updateCurrencyDisplayValue = createAction('[Shipping] Update currency Display Value', props<{ displayValue: string }>());

//update payment and commercial invoice details
export const updatePaymentsDetailsAction = createAction('[Shipping] Update Payment Details', props<{ paymentDetails: IPayment }>());

//update sender mobile number
export const updateSenderMobileNumberAction = createAction('[Shipping] Update Sender Phone Details', props<{ phoneNumber: string }>());

//Get Default Sender Details
export const getDefaultSenderDetailsBegin = createAction('[Shipping] GET Default Sender Details begin', props<{ uid: string, addressType: string }>());
export const getDefaultSenderDetailsSuccess = createAction('[Shipping] GET Default Sender Details Success', props<{ data: IAddressDataList }>());
export const getDefaultSenderDetailsFailure = createAction('[Shipping] GET Default Sender Details Failure', props<{ data }>());

//Get Default Recipient Details
export const getRecipientListDetailsBegin = createAction('[Shipping] GET Recipient List Details begin', props<{ uid: string, addressType: string }>());
export const getRecipientListDetailsSuccess = createAction('[Shipping] GET Recipient List Details Success', props<{ data: IAddressDataList }>());
export const getRecipientListDetailsFailure = createAction('[Shipping] GET Recipient List Details Failure', props<{ data }>());

//Get Pending Shipment Details
export const getPendingShipmentDetailsBegin = createAction('[Shipping] GET Pending Shipment Details begin', props<{ uid: string, status: string }>());
export const getPendingShipmentDetailsSuccess = createAction('[Shipping] GET Pending Shipment Details Success', props<{ data }>());
export const getPendingShipmentDetailsFailure = createAction('[Shipping] GET Pending Shipment Details Failure', props<{ data }>());

//Get Confirmed Shipment Details
export const getConfirmedShipmentDetailsBegin = createAction('[Shipping] GET Confirmed Shipment Details begin', props<{ uid: string, status: string }>());
export const getConfirmedShipmentDetailsSuccess = createAction('[Shipping] GET Confirmed Shipment Details Success', props<{ data }>());
export const getConfirmedShipmentDetailsFailure = createAction('[Shipping] GET Confirmed Shipment Details Failure', props<{ data }>());

//Post sender address details
export const postSenderAddressDetailsBegin = createAction('[Shipping] POST Sender Address Details begin', props<{ senderAddressDetails: any, addressType: AddressTypes, userId: string }>());
export const postSenderAddressDetailsSuccess = createAction('[Shipping] POST Sender Address Detailss Success', props<{ partyId: string }>());
export const postSenderAddressDetailsFailure = createAction('[Shipping] POST Sender Address Details Failure', props<{ data }>());

//Update sender address details
export const updateSenderAddressDetailsBegin = createAction('[Shipping] UPDATE Sender Address Details begin', props<{ senderAddressDetails: any, partyId: string, userId: string }>());
export const updateSenderAddressDetailsSuccess = createAction('[Shipping] UPDATE Sender Address Detailss Success', props<{ partyId: string }>());
export const updateSenderAddressDetailsFailure = createAction('[Shipping] UPDATE Sender Address Details Failure', props<{ data }>());

//Save Merged Sub Category commodity list
export const saveMergedSubCategoryCommodityListAction = createAction('[Shipping] Save Merged Sub Category Commodity List', props<{ mergedSubCategoryCommodityList }>());
