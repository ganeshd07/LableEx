import { Injectable } from '@angular/core';
import { ShippingInfo } from 'src/app/pages/shipping/+store/shipping.state';
import { CreateShipmentRequest } from 'src/app/interfaces/api-service/request/create-shipment-request';
import { RequestedPackageLineItem } from 'src/app/interfaces/api-service/request/requested-package-line-item';
import { Commodity } from 'src/app/interfaces/api-service/request/commodity';
import { SummaryPageConstants } from '../../../../app/types/constants/summary-page.constants';
import { Payment } from 'src/app/interfaces/api-service/request/payment';
import { Amount } from 'src/app/interfaces/api-service/common/amount';
import { Units } from 'src/app/interfaces/api-service/request/units';
import { ResponsibleParty } from 'src/app/interfaces/api-service/request/responsible-party';
import { CommercialInvoice } from 'src/app/interfaces/api-service/request/commercial-invoice';
import { CustomsClearanceDetail } from 'src/app/interfaces/api-service/request/customs-clearance-detail';
import { ISpecialServices } from 'src/app/interfaces/shipping-app/special-services';
import { CustomsType } from 'src/app/types/enum/customs-type.enum';
import { DocumentsType } from 'src/app/types/enum/documents-type.enum';
import { SignatureOptionTypes } from 'src/app/types/enum/signature-option-types.enum';
import { ShipmentPurposeTypesDocument } from 'src/app/types/enum/shipment-purpose-types-documents.enum';
import { Util } from '../../../providers/util.service';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import * as fromShippingSelector from 'src/app/pages/shipping/+store/shipping.selectors';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { UserProfileRequest } from 'src/app/interfaces/api-service/request/user-profile-request';

/**
 * This class contains all data mappers of Create Shipment.
 *
 * Author: Ganesh Dhavale
 * Date Created: December 17, 2020
 * 
 */
@Injectable({
    providedIn: 'root'
})

export class CreatShipmentRequestMapper {
    //countryManufactureList: any;
    constructor(
        private util: Util,
        private appStore: Store<AppState>
    ) { }
    signatureOption: any;
    /**
     * Maps shipment information data to create shipment api request body.
     * When the mapping has been done, it will send create shipment api post request.
     * post request as a request body.
     * @param shipmentInfo - All shipment information from application.
     */
    public mapShipmentDetailsToCreateShipmentRequestBody(shipmentInfo: ShippingInfo): CreateShipmentRequest {
        const userData: UserProfileRequest = {
            uid: shipmentInfo.userAccount?.userId
        }
        this.signatureOption = this.getSignatureOption(shipmentInfo.shipmentDetails.specialServiceInfo);

        const specialServiceOption = this.getSpecialSignatureOption(shipmentInfo.shipmentDetails.selectedRate.saturdayDelivery);
        const specialServicesRequested = {
            specialServiceTypes: [specialServiceOption]
        };

        const currencyValue = shipmentInfo.shipmentDetails.carriageDeclaredValueCurrency;
        const shippingCharges: Payment = {
            paymentType: shipmentInfo.paymentDetails.shippingBillTo,
            accountNumber: shipmentInfo.paymentDetails.shippingAccountNumber
        };

        if (shippingCharges.accountNumber === '') {
            delete shippingCharges.accountNumber;
        }

        const mobileNumber = sessionStorage.getItem(SessionItems.MOBILENUMBER);
        const optPhoneNumber = sessionStorage.getItem(SessionItems.DIALINGPREFIX).replace('+', '') + mobileNumber;
        const senderPhoneNumber = sessionStorage.getItem(SessionItems.DIALINGPREFIX).replace('+', '') + shipmentInfo.senderDetails.phoneNumber;
        const commercialInvoice: CommercialInvoice = {
            shipmentPurpose: shipmentInfo.customsDetails.customsType === SummaryPageConstants.DOC ? this.getShipmentPurposeForDocument(shipmentInfo.customsDetails.documentTypeCode) : shipmentInfo.customsDetails.productPurpose,
            customerReference: mobileNumber ? optPhoneNumber : senderPhoneNumber
        };

        const totalCustomsValue: Amount = this.getTotalCustomsValue(shipmentInfo.customsDetails);

        const dutiesPayment: Payment = {
            paymentType: shipmentInfo.paymentDetails.dutiesTaxesBillTo,
            accountNumber: shipmentInfo.paymentDetails.dutiesTaxesAccountNumber
        };

        if (dutiesPayment.accountNumber === '') {
            delete dutiesPayment.accountNumber;
        }

        const customsClearanceDetail: CustomsClearanceDetail = {
            documentContent: shipmentInfo.customsDetails.customsType === CustomsType.DOCUMENT ? SummaryPageConstants.DOCUMENTS_ONLY : SummaryPageConstants.NON_DOCUMENTS,
            commercialInvoice: commercialInvoice,
            commodities: shipmentInfo.customsDetails.customsType === CustomsType.DOCUMENT ? this.getMappedCommoditiesForDocument(shipmentInfo) : this.getMappedCommodities(shipmentInfo.customsDetails.commodityList, currencyValue),
            totalCustomsValue: totalCustomsValue,
            insuranceCharges: shipmentInfo.shipmentDetails.carriageDeclaredValue ? shipmentInfo.shipmentDetails.carriageDeclaredValue : 0,
            dutiesPayment: dutiesPayment
        };
        const current_datetime = new Date();
        const months = SummaryPageConstants.MONTHLIST;
        const formatted_date = (months[current_datetime.getMonth()]) + '-' + current_datetime.getDate() + '-' + current_datetime.getFullYear();
        const requestMapper: CreateShipmentRequest = {
            user: userData.uid ? userData : undefined,
            createDate: formatted_date,
            pickupType: 'DROPOFF_AT_FEDEX_LOCATION', //TODO: Need to confirm
            shippingChargesAmount: shipmentInfo.shipmentDetails.selectedRate.currency + " " + shipmentInfo.shipmentDetails.selectedRate.totalNetCharge.toString(),
            status: 'PENDING',
            serviceType: shipmentInfo.shipmentDetails.serviceType,
            specialServicesRequested: specialServicesRequested,
            packagingType: shipmentInfo.shipmentDetails.packagingType === '' ? 'YOUR_PACKAGING' : shipmentInfo.shipmentDetails.packagingType,// TODO: value missing from store.            
            totalPackageCount: shipmentInfo.shipmentDetails.totalNumberOfPackages.toString(),
            totalWeight: shipmentInfo.shipmentDetails.totalWeight.toString(),
            shipper: this.getMappedShipper(shipmentInfo.senderDetails),
            recipient: this.getMappedShipper(shipmentInfo.recipientDetails[0]),
            requestedPackageLineItems: this.getRequestedPackageLineItems(shipmentInfo.shipmentDetails.packageDetails, shipmentInfo.shipmentDetails.totalNumberOfPackages),
            shippingChargesPayment: shippingCharges,
            customsClearanceDetail: customsClearanceDetail
        }

        if (requestMapper.specialServicesRequested.specialServiceTypes[0] === '') delete requestMapper.specialServicesRequested;
        return requestMapper;
    }

    getShipmentPurposeForDocument(documentType): string {
        if (documentType === DocumentsType.PERSONAL) {
            return ShipmentPurposeTypesDocument.GIFT;
        } else {
            return ShipmentPurposeTypesDocument.NOTSOLD;
        }
    }

    getTotalCustomsValue(customsDetails): Amount {
        let currency = '';
        let totalCustomValue = 0;
        if (customsDetails.customsType === CustomsType.DOCUMENT) {
            currency = customsDetails.documentValueUnits;
            totalCustomValue = customsDetails.documentValue
        } else {
            customsDetails.commodityList.forEach(commodity => {
                totalCustomValue = totalCustomValue + commodity.totalCustomsValue;
                currency = commodity.unitPrice
            })
        }

        const totalCustomsValue: Amount = {
            currency: currency,
            amount: totalCustomValue
        };
        return totalCustomsValue;
    }

    getCountryCodeOfManufacturing(manufacturingCountry: string): string {
        let countryManufactureList: any
        this.appStore.pipe(select(fromShippingSelector.selectMergedCountryOfManufactureList)).subscribe((comList: any) => {
            if (comList) {
                countryManufactureList = comList;
            }
        });
        const matchedCountry = countryManufactureList?.find(country => country.name === manufacturingCountry);
        return matchedCountry?.code;
    }

    getSignatureOption(specialServiceInfo: ISpecialServices): string {
        const defaultSpeialServiceInfo = {
            selectedSignatureOption: {
                key: 'SERVICE_DEFAULT'
            }
        };
        const serviceInfo = (specialServiceInfo === undefined || specialServiceInfo.selectedSignatureOption.key === undefined) ? defaultSpeialServiceInfo : specialServiceInfo;
        return serviceInfo.selectedSignatureOption.key;
    }

    /*  TODO: Currently only supported for 'SATURDAY_DELIVERY'.
        So if 'SATURDAY_DELIVERY' is not present currently assigning 
        '' as a key so it can be removed later 
        from request mapper object.
    */
    getSpecialSignatureOption(specialServiceInfo: boolean): string {
        const serviceInfo = specialServiceInfo ? 'SATURDAY_DELIVERY' : '';
        return serviceInfo;
    }

    getSignatureOptionHandlingTypes(specialServiceInfo: ISpecialServices): string[] {
        const defaultSpeialServiceInfo = {
            handlingTypes: [
                'SIGNATURE_OPTION'
            ]
        };
        const serviceInfo = specialServiceInfo === undefined ? defaultSpeialServiceInfo : specialServiceInfo;
        return serviceInfo.handlingTypes;
    }

    getMappedCommoditiesForDocument(shipmentInfo): Commodity[] {
        const mappedCommodities = [];
        const commodityName = this.getCommodityNameDocument(shipmentInfo.customsDetails.documentTypeCode, shipmentInfo.customsDetails.documentType);
        mappedCommodities.push({
            name: commodityName,
            description: commodityName,
            countryOfManufacture: shipmentInfo.senderDetails.countryCode,
            weight: {
                units: shipmentInfo.shipmentDetails.packageDetails[0]?.packageWeightUnit,
                value: shipmentInfo.shipmentDetails.packageDetails[0]?.packageWeight
            },
            quantity: shipmentInfo.shipmentDetails.packageDetails[0]?.packageQuantity,
            quantityUnits: 'BOX',
            unitPrice: {
                currency: shipmentInfo.customsDetails.documentValueUnits,
                amount: shipmentInfo.customsDetails.documentValue
            },
            customsValue: {
                currency: shipmentInfo.customsDetails.documentValueUnits,
                amount: shipmentInfo.customsDetails.documentValue
            }
        })

        return mappedCommodities;
    }

    getCommodityNameDocument(commodityName, commodityDescription) {
        let nameValue = '';
        if (commodityName !== undefined) {
            if (commodityName === DocumentsType.OTHER) {
                nameValue = commodityDescription;
            } else if (commodityName) {
                nameValue = commodityName;
            }
        } else {
            nameValue = DocumentsType.INTEROFFICE;
        }

        return nameValue;
    }

    getMappedCommodities(commodities, currencyValue): Commodity[] {
        const mappedCommodities = [];
        commodities.forEach(commodity => {
            const mappedCommodity = this.getMappedCommodity(commodity, currencyValue);
            if (mappedCommodities) {
                mappedCommodities.push(mappedCommodity);
            }
        });

        return mappedCommodities;
    }

    getMappedCommodity(commodity, currencyValue): Commodity {
        const unitPrice: Amount = {
            currency: commodity.unitPrice,
            amount: parseFloat((commodity.totalCustomsValue / commodity.quantity).toFixed(2))
        };

        const customValue: Amount = {
            currency: commodity.unitPrice,
            amount: commodity.totalCustomsValue
        };

        const weight: Units = {
            units: (commodity.totalWeightUnit).toUpperCase(),
            value: (commodity.totalWeight).toString()
        };

        const commodityNameDescription = (commodity.name !== 'Others') ?
            this.util.joinStrings('-', commodity.name, commodity.description) : commodity.description;
        const mappedCommodity: Commodity = {
            name: commodityNameDescription.substring(0, 50),
            numberOfPieces: commodity.numberOfPieces,
            unitPrice: unitPrice,
            customsValue: customValue,
            description: commodityNameDescription,
            countryOfManufacture: this.getCountryCodeOfManufacturing(commodity.countryOfManufacture),
            weight: weight,
            quantity: commodity.quantity,
            quantityUnits: commodity.quantityUnits,
            harmonizedCode: commodity.hsCode
        }
        return mappedCommodity;
    }

    getRequestedPackageLineItems(packagesDetails, totalPackageCount) {
        const mappedPackageLineItems: RequestedPackageLineItem[] = [];
        packagesDetails.forEach(packageDetail => {
            const mapPackage = this.getMappedPackagLinedItem(packageDetail, totalPackageCount);
            if (mapPackage) {
                mappedPackageLineItems.push(mapPackage);
            }
        });

        return mappedPackageLineItems;
    }

    getMappedPackagLinedItem(packageDetail, totalPackageCount): RequestedPackageLineItem {
        const weight = {
            units: packageDetail.packageWeightUnit,
            value: packageDetail.packageWeight
        };

        const dimensions = {
            height: packageDetail.packageDimensionHeight === '' ? 0 : packageDetail.packageDimensionHeight,
            length: packageDetail.packageDimensionLength === '' ? 0 : packageDetail.packageDimensionLength,
            width: packageDetail.packageDimensionWidth === '' ? 0 : packageDetail.packageDimensionWidth,
            units: packageDetail.packageDimensionUnit
        };

        //TODO: Need to Confirm and map to store value        
        const insuredValue = {
            amount: 100,
            currency: 'USD'
        };
        //TODO -End

        const mappedPackageLineItem: RequestedPackageLineItem = {
            groupPackageCount: packageDetail.packageQuantity,
            weight: weight,
            dimensions: dimensions,
            physicalPackaging: '',
            //insuredValue: insuredValue // TODO: Can be use if required.            
            packageSpecialServices: {
                signatureOptionDetail: {
                    signatureOptionType: this.signatureOption
                },
                specialServiceTypes: this.getSignatureOptionHandlingTypes(packageDetail.specialServiceInfo)
            }
        };
        delete mappedPackageLineItem.physicalPackaging;
        if (mappedPackageLineItem.dimensions.height === 0 || mappedPackageLineItem.dimensions.width === 0 || mappedPackageLineItem.dimensions.length === 0 ||
            mappedPackageLineItem.dimensions.height === undefined || mappedPackageLineItem.dimensions.width === undefined || mappedPackageLineItem.dimensions.length === undefined) {
            delete mappedPackageLineItem.dimensions;
        };

        if (this.signatureOption === SignatureOptionTypes.NO_SIGNATURE_REQUIRED) {
            delete mappedPackageLineItem.packageSpecialServices.specialServiceTypes;
        }

        return mappedPackageLineItem;
    }

    getMappedShipper(shipper): ResponsibleParty {
        const addressLine1 = shipper.address1;
        const addressLine2 = shipper.address2 ? shipper.address2 : undefined;
        const addressLine3 = shipper.address3 ? shipper.address3 : undefined;
        const phoneNumber = (shipper.countryCode === 'US' || shipper.countryCode === 'CA') ? shipper.phoneNumber : (shipper.dialingPrefix + shipper.phoneNumber);
        const contact = {
            personName: shipper.contactName,
            phoneNumber: phoneNumber,
            emailAddress: shipper.emailAddress,
            companyName: shipper.companyName ? shipper.companyName : undefined,
            phoneExtension: shipper.phoneExt ? shipper.phoneExt : undefined,
            taxId: shipper.taxId,
            passportNo: shipper.passportNumber ? shipper.passportNumber : undefined,
        };

        const address = {
            city: shipper.city,
            stateOrProvinceCode: shipper.stateOrProvinceCode,
            postalCode: shipper.postalCode ? shipper.postalCode : undefined,
            countryCode: shipper.countryCode,
            residential: shipper.residential,
            visitor: shipper.visitor ? shipper.visitor : false,
            streetLines: this.getStreetLines(addressLine1, addressLine2, addressLine3)
        };
        const mappedShipper: ResponsibleParty = {
            contact: contact,
            address: address
        };
        if (mappedShipper.address.stateOrProvinceCode === '') {
            delete mappedShipper.address.stateOrProvinceCode;
        }
        return mappedShipper;
    }

    getStreetLines(addressLine1, addressLine2, addressLine3): any[] {
        let addressLines: any[] = [addressLine1];
        if (addressLine2 !== undefined) {
            addressLines.push(addressLine2);
        }
        if (addressLine3 !== undefined) {
            addressLines.push(addressLine3);
        }

        return addressLines;
    }
}