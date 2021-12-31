import { Injectable } from '@angular/core';
import { IRateQuote } from 'src/app/interfaces/shipping-app/rate-quote';
import { IShipmentDetails } from 'src/app/interfaces/shipping-app/shipment-details';
import { RateQuoteRequest } from 'src/app/interfaces/api-service/request/rate-quote-request';
import { ShippingInfo } from 'src/app/pages/shipping/+store/shipping.state';
import { ResponsibleParty } from 'src/app/interfaces/api-service/request/responsible-party';
import { ISender } from 'src/app/interfaces/shipping-app/sender';
import { IRecipient } from 'src/app/interfaces/shipping-app/recipient';
import { IPayment } from 'src/app/interfaces/shipping-app/payment';
import { Payment } from 'src/app/interfaces/api-service/request/payment';
import { IPackageDetails } from 'src/app/interfaces/shipping-app/package-details';
import { RequestedPackageLineItem } from 'src/app/interfaces/api-service/request/requested-package-line-item';
import { RateReplyDetail } from 'src/app/interfaces/api-service/response/rate-reply-detail';
import { DatePipe } from '@angular/common';
import { Dimension } from 'src/app/interfaces/api-service/common/dimension';
import { Surcharge } from 'src/app/interfaces/api-service/response/surcharge';
import { Config } from 'src/app/interfaces/api-service/response/config';
import { ISpecialServices } from 'src/app/interfaces/shipping-app/special-services';
import { IRatesForm } from 'src/app/interfaces/shipping-form/rates-form';
import { ICustomsInfo } from 'src/app/interfaces/shipping-app/customs-info';
import { CustomsType } from 'src/app/types/enum/customs-type.enum';
import { Commodity } from 'src/app/interfaces/api-service/request/commodity';
import { Amount } from 'src/app/interfaces/api-service/common/amount';
import { BillingOptionsUtil } from 'src/app/types/constants/billing-and-service-options.constants';
import { PackageSpecialServices } from 'src/app/interfaces/api-service/request/package-special-services';
import { Util } from '../../util.service';
import { Discount } from 'src/app/interfaces/api-service/response/discount';
import { isDefined } from '@angular/compiler/src/util';
import { SpecialServicesRequested } from 'src/app/interfaces/api-service/request/special-services-requested';
import { VatEnabledComputationCountries } from 'src/app/types/enum/vat-computation-countries.enum';
import { VatEnabledDisplayCountries } from 'src/app/types/enum/vat-display-countries.enum';
import { ServiceType } from 'src/app/types/enum/service-type.enum';
import { PackagingType } from 'src/app/types/enum/packaging-type.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { RatesRoundUpCountries } from 'src/app/types/enum/rates-roundup-countries.enum';
import { RatesRoundUpDecimalPlace } from 'src/app/types/enum/rates-roundup-decimal-place.enum';

/**
 * This class contains all data mappers of Rate APIM Services
 *
 * Author: Carlo Oseo
 * Date Created: June 11, 2020
 * Modified By: Roan Villaflores
 */
@Injectable({
    providedIn: 'root'
})
export class RatesDataMapper {
    countryCode = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    enableRoundUp = RatesRoundUpCountries[this.countryCode] ? true : false;
    roundUpDecimalPlace = RatesRoundUpDecimalPlace[this.countryCode];
    enableVATCompute = VatEnabledComputationCountries[this.countryCode] ? true : false;
    enableVATDisplay = VatEnabledDisplayCountries[this.countryCode] ? true : false;

    constructor(
        private datePipe: DatePipe,
        private util: Util
    ) { }

    /**
     * Maps the rate quotes response data to rate and delivery option page form.
     * When the mapping has been done, it will identify the best price and fastest delivery
     * date on the rate list.
     * @param rateReplyDetails - The response data from the APIM rate quotes V2.
     */
    public mapRateQuoteResponseToGUI(rateReplyDetails: RateReplyDetail[], discountConfig: Config[]): IRatesForm[] {
        const ratesOptions: IRatesForm[] = [];
        let hasDateDetail = false;
        if (rateReplyDetails) {
            for (const rateReplyDetail of rateReplyDetails) {
                const serviceType = rateReplyDetail.serviceType;
                const packagingType = rateReplyDetail.packagingType;
                const discounts = rateReplyDetail.ratedShipmentDetails[0].shipmentLegRateDetails[0].discounts;
                const currency = rateReplyDetail.ratedShipmentDetails[0].totalBaseCharge ? rateReplyDetail.ratedShipmentDetails[0].totalBaseCharge[0].currency : '';
                const totalBaseCharge = rateReplyDetail.ratedShipmentDetails[0].totalBaseCharge ? rateReplyDetail.ratedShipmentDetails[0].totalBaseCharge[0].amount : 0;
                const totalVatCharge = rateReplyDetail.ratedShipmentDetails[0].totalVatCharge ? rateReplyDetail.ratedShipmentDetails[0].totalVatCharge[0]?.amount : 0;
                const totalNetCharge = rateReplyDetail.ratedShipmentDetails[0].totalNetCharge ? rateReplyDetail.ratedShipmentDetails[0].totalNetCharge[0]?.amount : 0;
                let surcharges = rateReplyDetail.ratedShipmentDetails[0].shipmentLegRateDetails[0]?.surcharges;
                const saturdayDelivery = rateReplyDetail.saturdayDelivery;

                // UPDATE SURCHARGE ENTRIES AND REMOVE RESTRICTION ENTRIES
                surcharges = this.updateSurchargesEntries(surcharges);

                // COMPUTATION FOR TOTAL NET PRICE AND PRICES BREAKDOWN
                const OLD_VAT = totalVatCharge;
                const VAT_PERCENT = OLD_VAT / (totalNetCharge - OLD_VAT);

                const OLD_FUEL_SURCHARGE = this.getOldFuelSurcharge(surcharges);
                const DECLARED_VALUE_SURCHARGE = this.getDeclaredValueSurcharge(surcharges);
                const TOTAL_SURCHARGES = this.getTotalSurcharges(surcharges);

                const TOTAL_DISCOUNTS_FROM_US_API = this.getTotalDiscountsFromAPI(discounts);
                const DISCOUNT_RATE_FROM_LOCAL_API = (discountConfig.length > 0) ? discountConfig[0].value : null;
                const hasLocalApiDiscount = DISCOUNT_RATE_FROM_LOCAL_API !== null;
                const FSM_LITE_DISCOUNT = (hasLocalApiDiscount && serviceType !== ServiceType.INTERNATIONAL_FIRST &&
                    packagingType !== PackagingType.FEDEX_10KG_BOX && packagingType !== PackagingType.FEDEX_25KG_BOX) ?
                    (totalBaseCharge * (DISCOUNT_RATE_FROM_LOCAL_API / 100)) : TOTAL_DISCOUNTS_FROM_US_API;

                const FUEL_SURCHARGE_PERCENT = OLD_FUEL_SURCHARGE / (totalNetCharge - OLD_FUEL_SURCHARGE - DECLARED_VALUE_SURCHARGE -
                    (this.enableVATCompute || this.enableVATDisplay ? OLD_VAT : 0));

                const NEW_NET_CHARGE_WITHOUT_FUEL_SURCHARGE = (hasLocalApiDiscount) ?
                    (totalBaseCharge + TOTAL_SURCHARGES - OLD_FUEL_SURCHARGE - FSM_LITE_DISCOUNT - DECLARED_VALUE_SURCHARGE) :
                    (totalBaseCharge + TOTAL_SURCHARGES - OLD_FUEL_SURCHARGE + FSM_LITE_DISCOUNT - DECLARED_VALUE_SURCHARGE);

                const NEW_FUEL_SURCHARGE = FUEL_SURCHARGE_PERCENT * NEW_NET_CHARGE_WITHOUT_FUEL_SURCHARGE;

                const NEW_NET_CHARGE_WO_VAT = NEW_NET_CHARGE_WITHOUT_FUEL_SURCHARGE + NEW_FUEL_SURCHARGE + DECLARED_VALUE_SURCHARGE;
                const NEW_VAT = NEW_NET_CHARGE_WO_VAT * VAT_PERCENT;
                const VAT_VALUE = this.getVatValueToCompute(OLD_VAT, NEW_VAT);

                const NEW_NET_CHARGE = NEW_NET_CHARGE_WO_VAT + VAT_VALUE;

                const UPDATED_SURCHARGES = this.updateFuelSurcharge(surcharges, +NEW_FUEL_SURCHARGE.toFixed(2));

                let NET_CHARGE_BEFORE_DISCOUNT = totalBaseCharge + this.getTotalSurcharges(UPDATED_SURCHARGES) + VAT_VALUE;
                NET_CHARGE_BEFORE_DISCOUNT = this.fixNetChargeBeforeDiscountDisplay(NET_CHARGE_BEFORE_DISCOUNT, NEW_NET_CHARGE);

                hasDateDetail = Object.keys(rateReplyDetail.commit.dateDetail).length > 0;

                const rateOption: IRatesForm = {
                    dayCxsFormat: (hasDateDetail) ? rateReplyDetail.commit.dateDetail.dayCxsFormat : null,
                    dayOfWeek: (hasDateDetail) ? rateReplyDetail.commit.dateDetail.dayOfWeek : null,
                    date: (hasDateDetail) ? rateReplyDetail.commit.dateDetail.day : null,
                    time: (hasDateDetail) ? rateReplyDetail.commit.dateDetail.time : null,
                    serviceType: rateReplyDetail.serviceType,
                    serviceName: rateReplyDetail.serviceName,
                    serviceHint: '',
                    toggleBreakdown: false,
                    currency,
                    totalBaseCharge,
                    vat: VAT_VALUE !== 0 ? +VAT_VALUE.toFixed(2) : undefined,
                    totalNetCharge:
                        this.enableRoundUp ? this.roundUpRates(NEW_NET_CHARGE, this.roundUpDecimalPlace) :
                            +NEW_NET_CHARGE.toFixed(2),
                    discounts,
                    surcharges: UPDATED_SURCHARGES,
                    totalDiscount: +FSM_LITE_DISCOUNT.toFixed(2),
                    totalNetChargeBeforeDiscount:
                        this.enableRoundUp ? this.roundUpRates(NET_CHARGE_BEFORE_DISCOUNT, this.roundUpDecimalPlace)
                            : +NET_CHARGE_BEFORE_DISCOUNT.toFixed(2),
                    totalNetChargeAfterDiscount:
                        this.enableRoundUp ? this.roundUpRates(NEW_NET_CHARGE, this.roundUpDecimalPlace)
                            : +NEW_NET_CHARGE.toFixed(2),
                    tempDateDetails: (hasDateDetail) ? null : rateReplyDetail.commit.label,
                    saturdayDelivery
                };
                ratesOptions.push(rateOption);
            }

            // Sorting and tagging of price hints
            if (ratesOptions.length > 0) {
                let hasPriceDetails = false;
                for (const ratesOption of ratesOptions) {
                    hasDateDetail = ratesOption.date ? true : false;
                    if (!hasDateDetail) { break; }
                }

                for (const ratesOption of ratesOptions) {
                    hasPriceDetails = ratesOption.totalNetCharge ? true : false;
                    if (!hasPriceDetails) { break; }
                }

                if (ratesOptions.length > 1) {
                    // sorts for the lowest net charge
                    ratesOptions.sort((a, b) => a.totalNetCharge - b.totalNetCharge);
                }

                if (hasPriceDetails) {
                    if (ratesOptions.length > 1) {
                        // add service hint for lower price
                        ratesOptions[0].serviceHint = 'BEST PRICE';
                    }
                }

                if (ratesOptions.length > 1) {
                    // sorts for the earliest delivery date/time
                    ratesOptions.sort((a, b) =>
                        (new Date(a.dayCxsFormat + ' ' + a.time) as any) - (new Date(b.dayCxsFormat + ' ' + b.time) as any));

                }

                if (hasDateDetail) {
                    if (ratesOptions.length > 1) {
                        // add service hint for earlier delivery object
                        ratesOptions[0].serviceHint = 'FASTEST';
                    }
                }
            }
        }
        return ratesOptions;
    }

    /**
     * This method fixes the NET_CHARGE_BEFORE_DISCOUNT display in the rates form
     * If the difference of 2 values is <= 0.02 then it's the same price as NEW_NET_CHARGE.
     * @param NET_CHARGE_BEFORE_DISCOUNT - NET_CHARGE_BEFORE_DISCOUNT
     * @param NEW_NET_CHARGE - NEW_NET_CHARGE
     */
    private fixNetChargeBeforeDiscountDisplay(NET_CHARGE_BEFORE_DISCOUNT: number, NEW_NET_CHARGE: number): number {
        const result = (+(NET_CHARGE_BEFORE_DISCOUNT.toFixed(2)) - +(NEW_NET_CHARGE.toFixed(2))).toFixed(2);
        return +result <= 0.02 ? NEW_NET_CHARGE : NET_CHARGE_BEFORE_DISCOUNT;
    }

    /**
     * This method sets the 'VAT' value to use for computation
     * If enableVATCompute and enableVATDisplay is false, return 0 instead
     * @param oldVat - original VAT value from API response
     * @param newVat - computed VAT value if enableVATCompute is true
     */
    private getVatValueToCompute(oldVat: number, newVat: number): number {
        return this.enableVATCompute ? newVat : (this.enableVATDisplay ? oldVat : 0);
    }

    /**
     * This method retrieves the 'FUEL' surcharge value from the list of surcharges
     * @param surcharges - unmodified list of surcharges directly from API response
     */
    private getOldFuelSurcharge(surcharges: Surcharge[]) {
        const fuelSurchargeObj = surcharges.find(list => list.type === 'FUEL');
        return (fuelSurchargeObj) ? fuelSurchargeObj.amount[0].amount : 0.0;
    }

    /**
     * This method retrieves the 'INSURED_VALUE' surcharge value from the list of surcharges
     * @param surcharges - unmodified list of surcharges directly from API response
     */
    private getDeclaredValueSurcharge(surcharges: Surcharge[]) {
        const declaredValueSurchargeObj = surcharges.find(list => list.type === 'INSURED_VALUE');
        return (declaredValueSurchargeObj) ? declaredValueSurchargeObj.amount[0].amount : 0.0;
    }

    /**
     * This method calculate for the sum of all the surcharges in the list
     * @param surcharges - modified list of surcharges
     */
    private getTotalSurcharges(surcharges: Surcharge[]) {
        let surchargeTotal = 0.0;
        if (surcharges.length > 0) {
            for (const surcharge of surcharges) {
                surchargeTotal += surcharge.amount[0].amount;
            }
        }
        return surchargeTotal;
    }


    /**
     * This method calculate for the sum of all the surcharges in the list
     * @param surcharges - modified list of surcharges
     */
    private getTotalDiscountsFromAPI(discounts: Discount[]) {
        let discountTotal = 0.0;
        if (discounts) {
            if (discounts.length > 0) {
                for (const discount of discounts) {
                    discountTotal += discount.amount[0].amount;
                }
            }
        }
        return discountTotal;
    }
    /**
     * This method updates the amount of 'FUEL' surcharge from the list of surcharges
     * @param surcharges - unmodified list of surcharges directly from API response
     * @param newFuelSurchage - updated amount/value of FUEL surcharge
     */
    private updateFuelSurcharge(surcharges: Surcharge[], newFuelSurchage: number): Surcharge[] {
        if (surcharges.length > 0) {
            for (const surcharge of surcharges) {
                if (surcharge.type === 'FUEL') {
                    surcharge.amount[0].amount = newFuelSurchage;
                }
            }
        }
        return surcharges;
    }

    /**
     * This method updates the surcharges and removes specific surcharge entry from the list of surcharges
     * @param surcharges - unmodified list of surcharges directly from API response
     */
    private updateSurchargesEntries(surcharges: Surcharge[]): Surcharge[] {
        const surchargeRestrictions = [
            'OUT_OF_PICKUP_AREA'
        ];

        for (const surchargeType of surchargeRestrictions) {
            const updatedSurcharges: Surcharge[] = [];
            if (surcharges?.length > 0) {
                for (const surcharge of surcharges) {
                    if (surcharge.type !== surchargeType) {
                        updatedSurcharges.push(surcharge);
                    }
                }
            }
            surcharges = updatedSurcharges;
        }
        return surcharges;
    }

    /**
     * This method rounds up the rates correctly depending on the value and the decimal place
     * If the decimalPlaces variable is undefined, it will default to 2 to avoid errors.
     * 
     * @param value - unmodified value or amount to be rounded
     * @param decimalPlaces - number of decimal place to round up
     */
    private roundUpRates(value: number, decimalPlaces: number): number {
        decimalPlaces !== undefined && decimalPlaces !== null ? decimalPlaces = decimalPlaces : decimalPlaces = 2;
        const roundedValue = decimalPlaces !== 0 ?
            Number(Math.ceil(parseFloat(value + 'e' + decimalPlaces)) + 'e-' + decimalPlaces) : Math.ceil(value);
        return roundedValue;
    }

    /**
     * Maps the selected rate to the shipment details interaces.
     *
     * @param selectedRate The selected rate to map.
     */
    public mapRateDetailsToShipmentDetails(selectedRate: IRatesForm, currentShippingInfo: ShippingInfo, specialServiceInfo: ISpecialServices): IShipmentDetails {
        const specialSvcInfo = (specialServiceInfo) ? specialServiceInfo : currentShippingInfo.shipmentDetails.specialServiceInfo;
        return {
            packageDetails: currentShippingInfo.shipmentDetails.packageDetails,
            totalNumberOfPackages: currentShippingInfo.shipmentDetails.totalNumberOfPackages,
            totalWeight: currentShippingInfo.shipmentDetails.totalWeight,
            serviceType: (selectedRate) ? selectedRate.serviceType : currentShippingInfo.shipmentDetails.serviceType,
            serviceName: (selectedRate) ? selectedRate.serviceName : currentShippingInfo.shipmentDetails.serviceName,
            packagingType: (currentShippingInfo.shipmentDetails.packagingType) ?
                currentShippingInfo.shipmentDetails.packagingType : undefined,
            serviceCode: (currentShippingInfo.shipmentDetails.serviceCode) ?
                currentShippingInfo.shipmentDetails.serviceCode : undefined,
            advancedPackageCode: (currentShippingInfo.shipmentDetails.advancedPackageCode) ?
                currentShippingInfo.shipmentDetails.advancedPackageCode : undefined,
            totalCustomsOrInvoiceValue: (currentShippingInfo.shipmentDetails.totalCustomsOrInvoiceValue) ?
                currentShippingInfo.shipmentDetails.totalCustomsOrInvoiceValue : undefined,
            customsOrInvoiceValueCurrency: (currentShippingInfo.shipmentDetails.customsOrInvoiceValueCurrency) ?
                currentShippingInfo.shipmentDetails.customsOrInvoiceValueCurrency : undefined,
            carriageDeclaredValue: (currentShippingInfo.shipmentDetails.carriageDeclaredValue) ?
                currentShippingInfo.shipmentDetails.carriageDeclaredValue : undefined,
            carriageDeclaredValueCurrency: (currentShippingInfo.shipmentDetails.carriageDeclaredValueCurrency) ?
                currentShippingInfo.shipmentDetails.carriageDeclaredValueCurrency : undefined,
            displayDate: (currentShippingInfo.shipmentDetails.displayDate) ?
                currentShippingInfo.shipmentDetails.displayDate : undefined,
            shipDate: (currentShippingInfo.shipmentDetails.shipDate) ? currentShippingInfo.shipmentDetails.shipDate : new Date(),
            selectedRate: (currentShippingInfo.shipmentDetails.selectedRate) ?
                currentShippingInfo.shipmentDetails.selectedRate : undefined,
            firstAvailableShipDate: (currentShippingInfo.shipmentDetails.firstAvailableShipDate) ?
                currentShippingInfo.shipmentDetails.firstAvailableShipDate : undefined,
            lastAvailableShipDate: (currentShippingInfo.shipmentDetails.lastAvailableShipDate) ?
                currentShippingInfo.shipmentDetails.lastAvailableShipDate : undefined,
            availableShipDates: [],
            selectedPackageOption: (currentShippingInfo.shipmentDetails.selectedPackageOption) ?
                currentShippingInfo.shipmentDetails.selectedPackageOption : undefined,
            specialServiceInfo: this.updateSpecialServiceInfo(selectedRate, specialSvcInfo),
            currencyDisplayValue: (currentShippingInfo.shipmentDetails.currencyDisplayValue) ?
                currentShippingInfo.shipmentDetails.currencyDisplayValue : undefined
        };
    }

    private updateSpecialServiceInfo(selectedRate: IRatesForm, specialServiceInfo: ISpecialServices): ISpecialServices {
        const handlingServices: string[] = (specialServiceInfo) ?
            ((specialServiceInfo.handlingTypes) ? specialServiceInfo.handlingTypes : []) : [];
        const saturdayDeliveryType = 'SATURDAY_DELIVERY';
        let specialServiceInfoObj = undefined;
        if (selectedRate && specialServiceInfo) { // for null checking
            if (selectedRate.saturdayDelivery) {
                if (!handlingServices.includes(saturdayDeliveryType)) {
                    handlingServices.push(saturdayDeliveryType);
                }
            }

            specialServiceInfoObj = {
                selectedSignatureOption: (specialServiceInfo) ? specialServiceInfo.selectedSignatureOption : undefined,
                handlingTypes: (handlingServices.length > 0) ? handlingServices : undefined
            };
        }
        return specialServiceInfoObj;
    }

    /**
     * Map the selected rate to rate quote interface fomat.
     *
     * @param selectedRate The selected rate to transform.
     */
    public mapSelectedRateToRateDetails(selectedRate: IRatesForm): IRateQuote {
        return {
            dayOfWeek: selectedRate.dayOfWeek,
            dateOfArrival: selectedRate.date,
            timeOfArrival: selectedRate.time,
            totalNetCharge: selectedRate.totalNetCharge,
            totalBaseCharge: selectedRate.totalBaseCharge,
            surchargeList: selectedRate.surcharges,
            volumeDiscount: selectedRate.totalDiscount,
            currency: selectedRate.currency,
            saturdayDelivery: selectedRate.saturdayDelivery
        };
    }

    /**
     * This method maps data from store for rates service request
     *
     * @param shippingInfo - Full shippingApp object from store
     */
    public mapRateRequestFromStore(shippingInfo: ShippingInfo): RateQuoteRequest {
        const currentDate = new Date().toISOString().slice(0, 10);
        return {
            rateRequestControlParameters: {
                rateSortOrder: 'SERVICENAMETRADITIONAL',
                returnTransitTimes: true,
                variableOptions: null,
                servicesNeededOnRateFailure: false
            },
            carrierCodes: [
                'FDXE'
            ],
            returnLocalizedDateTime: true,
            webSiteCountryCode: sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY),
            requestedShipment: {
                edtRequestType: 'NONE',
                rateRequestedType: [
                    'LIST',
                    'ACCOUNT'
                ],
                shipper: this.populateShipper(shippingInfo.senderDetails),
                recipients: this.populateRecipients(shippingInfo.recipientDetails),
                shipTimestamp: currentDate,
                pickupType: 'DROPOFF_AT_FEDEX_LOCATION', // NOTE: this value is temporary, need to confirm
                serviceType: (shippingInfo.shipmentDetails.serviceType) ? shippingInfo.shipmentDetails.serviceType : '',
                packagingType: shippingInfo.shipmentDetails.packagingType,
                shippingChargesPayment: this.populateShippingChargesPayment(shippingInfo),
                specialServicesRequested: this.populateSpecialServicesRequested(shippingInfo.shipmentDetails),
                customsClearanceDetail: {
                    // NOTE: temporarily commented to consistently retrieve dateDetail from response.
                    // TODO: Uncomment after confirming the value for non-document custom type
                    // documentContent: this.getCustomsDocumentContent(shippingInfo.customsDetails),
                    dutiesPayment: this.populateDutiesPayment(shippingInfo),
                    commodities: this.populateCommodities(shippingInfo.customsDetails),
                    totalCustomsValue: this.populateTotalCustomsValue(shippingInfo.customsDetails)
                },
                blockInsightVisibility: true,
                requestedPackageLineItems: this.populateRequestPackageLineItems(shippingInfo.shipmentDetails, shippingInfo.customsDetails),
                totalWeight: shippingInfo.shipmentDetails.totalWeight,
                totalPackageCount: shippingInfo.shipmentDetails.totalNumberOfPackages
            }
        };
    }

    /**
     * This method populates the 'specialServicesRequested' request parameter
     * for mapping request to rates service
     * For now, only saturday delivery is being requested here
     *
     * @param shipmentDetails - current state of shipmentDetails from store
     */
    private populateSpecialServicesRequested(shipmentDetails: IShipmentDetails): SpecialServicesRequested {
        const satDeliveryTag = 'SATURDAY_DELIVERY';
        const isForSaturdayDelivery = isDefined(shipmentDetails.selectedRate) ? shipmentDetails.selectedRate.saturdayDelivery : false;
        return {
            specialServiceTypes: (isForSaturdayDelivery) ? [satDeliveryTag] : []
        };
    }
    /**
     * This method provides the value for documentContent
     * for mapping request to rates service
     *
     * @param customsDetails - object from store
     */
    private getCustomsDocumentContent(customsDetails: ICustomsInfo): string {
        let documentContent = 'DOCUMENTS_ONLY';
        if (customsDetails) {
            if (customsDetails.customsType === CustomsType.ITEM) {
                documentContent = 'NON_DOCUMENTS';
            }
        }
        return documentContent;
    }

    /**
     * This method populates the 'commodities' object from customsClearanceDetail parent object
     * for mapping request values of rates service
     *
     * @param customsDetails - customs details object from store
     */
    private populateCommodities(customsDetails: ICustomsInfo): Commodity[] {
        const defaultCommodityName = 'DOCUMENTS';
        let commodityList: Commodity[] = [];
        let hasCommodities = false;
        if (customsDetails) {
            if (customsDetails.commodityList.length > 0) {
                hasCommodities = true;
                for (const commodity of customsDetails.commodityList) {
                    commodityList.push({
                        // NOTE: Temporarily set to default commodity name for doc type to consistently include dateDetail
                        // TODO: Uncomment after confirming the correct value for nondoc type
                        name: defaultCommodityName,
                        numberOfPieces: commodity.quantity,
                        description: this.util.joinStrings(' - ', commodity.name, commodity.description),
                        countryOfManufacture: commodity.countryOfManufacture,
                        harmonizedCode: (commodity.hsCode) ? commodity.hsCode : undefined,
                        harmonizedCodeDescription: undefined,
                        itemDescriptionForClearance: undefined,
                        weight: {
                            units: commodity.totalWeightUnit.toUpperCase(),
                            value: commodity.totalWeight.toString()
                        },
                        quantity: commodity.quantity,
                        quantityUnits: (commodity.quantityUnits) ? commodity.quantityUnits : '',
                        unitPrice: {
                            currency: commodity.unitPrice,
                            amount: null,
                            currencySymbol: undefined
                        },
                        customsValue: {
                            amount: commodity.totalCustomsValue,
                            currency: commodity.unitPrice,
                            currencySymbol: undefined
                        }
                    });
                }
            }
        }

        if (!hasCommodities) {
            commodityList.push({
                name: defaultCommodityName,
                numberOfPieces: 1,
                description: 'default commodity',
                countryOfManufacture: '',
                harmonizedCode: undefined,
                harmonizedCodeDescription: undefined,
                itemDescriptionForClearance: undefined,
                weight: {
                    units: 'KG',
                    value: '1'
                },
                quantity: 1,
                quantityUnits: '',
                unitPrice: {
                    currency: customsDetails?.documentValueUnits ? customsDetails.documentValueUnits : 'USD',
                    amount: null,
                    currencySymbol: undefined
                },
                customsValue: {
                    amount: 1,
                    currency: customsDetails?.documentValueUnits ? customsDetails.documentValueUnits : 'USD',
                    currencySymbol: undefined
                }
            });
        }
        return commodityList;
    }

    private populateTotalCustomsValue(customsDetails: ICustomsInfo) {
        let totalCustomsValueObj: Amount;
        if (customsDetails) {
            let customsAmountTotal = 0;
            let customsCurrency = ''; // TODO: check via postman request if it accepts empty string value
            if (customsDetails.customsType === CustomsType.ITEM) { // FOR ITEM TYPE
                if (customsDetails.commodityList.length > 0) {
                    for (const commodity of customsDetails.commodityList) {
                        customsAmountTotal += commodity.totalCustomsValue;
                    }
                    customsCurrency = customsDetails.commodityList[0].unitPrice;
                } else {
                    customsAmountTotal = 1;
                }
            } else { // FOR DOCUMENT TYPE
                customsAmountTotal = customsDetails.documentValue;
                customsCurrency = customsDetails.documentValueUnits;
            }

            totalCustomsValueObj = {
                amount: customsAmountTotal,
                currency: customsCurrency
            };
        } else {
            totalCustomsValueObj = {
                amount: 1,
                currency: 'USD'
            };
        }
        return totalCustomsValueObj;
    }

    /**
     * This method populates the 'requestedPackageLineItems' object
     * for mapping request values of rates service
     *
     * @param shipmentDetails - shipment details object from store
     */
    private populateRequestPackageLineItems(shipmentDetails: IShipmentDetails, customsDetails: ICustomsInfo): RequestedPackageLineItem[] {
        let packageLineItems: RequestedPackageLineItem[] = [];
        if (shipmentDetails) {
            const packages: IPackageDetails[] = shipmentDetails.packageDetails;
            const packageCount = shipmentDetails.totalNumberOfPackages;
            const currency: string = this.getInsuredValueCurrency(shipmentDetails, customsDetails);
            const carriageDeclaredValue = (shipmentDetails.carriageDeclaredValue) ? shipmentDetails.carriageDeclaredValue : 0;
            const insuredValueAmt = (packageCount > 0 && carriageDeclaredValue > 0) ? +((Math.floor((carriageDeclaredValue / packageCount) * 100) / 100).toFixed(2)) : 0;

            if (packages.length > 0) {
                let ctr = 0;
                for (const item of packages) {
                    ctr++;
                    packageLineItems.push({
                        groupPackageCount: item.packageQuantity,
                        physicalPackaging: shipmentDetails.packagingType,
                        weight: {
                            units: item.packageWeightUnit,
                            value: item.packageWeight
                        },
                        insuredValue: {
                            currency: currency,
                            amount: insuredValueAmt
                        },
                        dimensions: this.populateDimension(item),
                        packageSpecialServices: this.populatePackageSpecialServices(shipmentDetails)
                    });
                }
            }
        } else {
            // NOTE: This is for default array object values instead of null,
            // null packageLineItems produces error response
            packageLineItems = [
                {
                    groupPackageCount: 1,
                    physicalPackaging: 'YOUR_PACKAGING',
                    weight: {
                        units: 'KG',
                        value: '1' // value cannot be 0 or null, defaulted to 1
                    },
                    insuredValue: {
                        currency: 'USD',
                        amount: 0
                    }
                }
            ];
        }
        return packageLineItems;
    }

    /**
     * This method extracts the currency for the insuredValue currency value.
     *
     * @param shipmentDetails - current shipmentDetails state from store
     * @param customsDetails - current customsDetails state from store
     */
    getInsuredValueCurrency(shipmentDetails: IShipmentDetails, customsDetails: ICustomsInfo): string {
        let defaultCurrency = 'USD';

        if (isDefined(shipmentDetails.selectedRate) && isDefined(customsDetails)) {
            if (customsDetails.customsType === CustomsType.DOCUMENT) {
                defaultCurrency = customsDetails.documentValueUnits;
            } else {
                defaultCurrency = shipmentDetails.customsOrInvoiceValueCurrency;
            }
        }

        return defaultCurrency;
    }

    /**
     * This method populates the values for packageSpecialServices field
     * for mapping request values of rates service
     *
     * @param shipmentDetails - object from store
     */
    private populatePackageSpecialServices(shipmentDetails: IShipmentDetails): PackageSpecialServices {
        let packageSpclSvcs: PackageSpecialServices = null;
        const defaultSignatureOptionType = 'SERVICE_DEFAULT';
        const signatureOptionSvcType = 'SIGNATURE_OPTION';
        const signatureOptionToRemove = 'NO_SIGNATURE_REQUIRED';

        if (shipmentDetails.specialServiceInfo) {
            if (isDefined(shipmentDetails.specialServiceInfo.selectedSignatureOption)) {
                const selectedSignatureOption = (shipmentDetails.specialServiceInfo.selectedSignatureOption) ?
                    shipmentDetails.specialServiceInfo.selectedSignatureOption.key : defaultSignatureOptionType;

                packageSpclSvcs = {
                    signatureOptionDetail: {
                        signatureOptionType: selectedSignatureOption
                    },
                    specialServiceTypes: (selectedSignatureOption === signatureOptionToRemove) ? [] : [signatureOptionSvcType]
                };
            } else {
                packageSpclSvcs = undefined;
            }
        } else {
            packageSpclSvcs = undefined;
        }

        return packageSpclSvcs;
    }

    /**
     * This method populates the 'dimension' object of 'requestedPackageLineItems' parent object
     * for mapping request values of rates service
     *
     * @param item - package details object from store
     */
    private populateDimension(item: IPackageDetails): Dimension {
        let hasPackageDimension = false;
        let dimensionObject: Dimension;

        if (item.packageDimensionLength && item.packageDimensionWidth && item.packageDimensionHeight) {
            hasPackageDimension = true;
            dimensionObject = {
                length: item.packageDimensionLength,
                width: item.packageDimensionWidth,
                height: item.packageDimensionHeight,
                units: (item.packageDimensionUnit) ? item.packageDimensionUnit : undefined
            };
        }

        return (hasPackageDimension) ? dimensionObject : undefined;
    }

    /**
     * This method populates the shipper object
     * for rates service request
     *
     * @param senderInfo - sender details object from store
     */
    private populateShipper(senderInfo: ISender): ResponsibleParty {
        return {
            accountNumber: { // TODO: populate when it becomes available, (For LOGIN USER TYPE)
                key: '',
                value: ''
            },
            contact: undefined,
            address: {
                city: (senderInfo.city) ? senderInfo.city : '',
                stateOrProvinceCode: (senderInfo.stateOrProvinceCode) ? senderInfo.stateOrProvinceCode : '',
                postalCode: (senderInfo.postalCode) ? senderInfo.postalCode : '',
                countryCode: (senderInfo.countryCode) ? senderInfo.countryCode : sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY),
                streetLines: [
                    (senderInfo.address1) ? senderInfo.address1 : '',
                    (senderInfo.address2) ? senderInfo.address2 : undefined
                ],
                residential: isDefined(senderInfo.companyName) ? (senderInfo.companyName === '') : false
            }
        };
    }

    /**
     * This method populates the recipients object
     * for rates service request
     *
     * @param recipients - recipient details object from store
     */
    private populateRecipients(recipients: IRecipient[]): ResponsibleParty[] {
        const responsibleParties: ResponsibleParty[] = [];

        if (recipients.length > 0) {
            for (const recipient of recipients) {
                const hasCompanyName = (isDefined(recipient.companyName) && (recipient.companyName));
                responsibleParties.push({
                    accountNumber: {
                        key: '',
                        value: ''
                    },
                    contact: undefined, // TODO: this value is temporay, populate if user has an account
                    address: {
                        city: (recipient.city) ? recipient.city : '',
                        stateOrProvinceCode: (recipient.stateOrProvinceCode) ? recipient.stateOrProvinceCode : '',
                        postalCode: (recipient.postalCode) ? recipient.postalCode : '',
                        countryCode: (recipient.countryCode) ? recipient.countryCode : '',
                        streetLines: [
                            (recipient.address1) ? recipient.address1 : '',
                            (recipient.address2) ? recipient.address2 : undefined,
                            (recipient.address3) ? recipient.address3 : undefined
                        ],
                        residential: isDefined(recipient.companyName) ? (recipient.companyName === '') : false
                    }
                });
            }
        }
        return responsibleParties;
    }

    /**
     * This method populates the shipChargePayment object
     * for rates service request
     *
     * @param shippingInfo - shippingApp object from store
     */
    private populateShippingChargesPayment(shippingInfo: ShippingInfo): Payment {
        const paymentDetails: IPayment = shippingInfo.paymentDetails;
        const senderCountryCode: string = (shippingInfo.senderDetails) ?
            shippingInfo.senderDetails.countryCode : sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
        let shipChargePayment: Payment;
        if (paymentDetails) {
            shipChargePayment = this.populatePaymentOptions(
                BillingOptionsUtil.TRANSPORT_COST,
                paymentDetails,
                senderCountryCode
            );
        } else {
            shipChargePayment = {
                paymentType: null,
                payor: {
                    responsibleParty: {
                        accountNumber: {
                            key: '',
                            value: ''
                        },
                        address: {
                            streetLines: undefined,
                            city: undefined,
                            postalCode: undefined,
                            countryCode: senderCountryCode,
                        }
                    }
                }
            };
        }
        return shipChargePayment;
    }

    /**
     * This method populates the dutiesPayment of customsClearanceDetail
     * for rates service request
     *
     * @param shippingInfo - shippingApp object from store
     */
    private populateDutiesPayment(shippingInfo: ShippingInfo): Payment {
        const paymentDetails: IPayment = shippingInfo.paymentDetails;
        const senderCountryCode: string = (shippingInfo.senderDetails) ?
            shippingInfo.senderDetails.countryCode : sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
        let dutiesPayment: Payment;
        if (paymentDetails) {
            dutiesPayment = this.populatePaymentOptions(
                BillingOptionsUtil.DUTIES_TAX,
                paymentDetails,
                senderCountryCode
            );
        } else {
            dutiesPayment = {
                paymentType: null,
                payor: {
                    responsibleParty: {
                        accountNumber: {
                            key: '',
                            value: ''
                        },
                        address: {
                            streetLines: undefined,
                            city: undefined,
                            postalCode: undefined,
                            countryCode: senderCountryCode,
                        }
                    }
                }
            };
        }
        return dutiesPayment;
    }

    /**
     * This method populates payment object
     * for rates service request
     *
     * @param paymentDetails - paymentDetails object from store
     * @param paymentOption - TRANSPORT_COST/DUTIES_TAX from BillingOptionsUtil
     */
    private populatePaymentOptions(paymentOption: string, paymentDetails: IPayment, countryCode: string): Payment {
        let accountNumberValue = '';
        let selectedPaymentType: string = null;

        if (paymentDetails) {
            const isPayAtDropOff = (paymentDetails.shippingBillTo === BillingOptionsUtil.getPaymentType(BillingOptionsUtil.PAY_AT_DROP_OFF).value);
            if (paymentOption === BillingOptionsUtil.TRANSPORT_COST) {
                selectedPaymentType = (paymentDetails.shippingBillTo && !isPayAtDropOff) ? paymentDetails.shippingBillTo : BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_MY_ACCOUNT).value;
                accountNumberValue = (paymentDetails.shippingBillTo && !isPayAtDropOff) ? paymentDetails.shippingAccountNumber : '';
            } else if (paymentOption === BillingOptionsUtil.DUTIES_TAX) {
                selectedPaymentType = (paymentDetails.dutiesTaxesBillTo) ? paymentDetails.dutiesTaxesBillTo : BillingOptionsUtil.getPaymentType(BillingOptionsUtil.BILL_RECIPIENT).value;
                accountNumberValue = paymentDetails.dutiesTaxesAccountNumber;
            }
        }
        return {
            paymentType: selectedPaymentType,
            payor: {
                responsibleParty: {
                    accountNumber: {
                        key: undefined,
                        value: accountNumberValue
                    },
                    address: {
                        streetLines: undefined,
                        city: undefined,
                        postalCode: undefined,
                        countryCode: countryCode,
                    }
                }
            }
        };
    }
}
