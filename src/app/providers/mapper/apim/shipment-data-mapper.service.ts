import { Injectable } from '@angular/core';
import { Util } from '../../util.service';
import { DatePipe } from '@angular/common';
import { Sender } from 'src/app/interfaces/api-service/request/sender';
import { Recipient } from 'src/app/interfaces/api-service/request/recipient';
import { MatchedAddresses } from 'src/app/interfaces/api-service/response/matched-addresses.interface';
import { Amount } from 'src/app/interfaces/api-service/common/amount';
import { RequestedPackageLineItem } from 'src/app/interfaces/api-service/request/requested-package-line-item';
import { Units } from 'src/app/interfaces/api-service/request/units';

/**
 * This class contains all data mappers of Shipment APIM Services
 *
 * Author: Carlo Oseo
 * Modified: Marlon Micael J. Cuevas
 * Date Created: June 11, 2020
 * Date Mofified: Dec. 3, 2020
 */
@Injectable({
    providedIn: 'root'
})
export class APIMShipmentDataMapper {

    constructor(private util: Util, private datePipe: DatePipe) { }

    /**
     * Populates sender details
     *
     * @param city - Sender City
     * @param stateOrProvinceCode - Sender State/Province Code
     * @param postalCode - Sender Postal Code
     * @param countryCode  - Sender Country Code
     */
    public populateSender(city: string, stateOrProvinceCode: string, postalCode: string, countryCode: string): Sender {
        const addressData: MatchedAddresses = {
            city,
            stateOrProvinceCode,
            postalCode,
            countryCode
        };
        const sender: Sender = {
            address: addressData
        };

        return sender;
    }

    /**
     * Populates Recipient Details
     *
     * @param city - Recipient City
     * @param stateOrProvinceCode - Recipient State/Province Code
     * @param postalCode - Recipient Postal Code
     * @param countryCode - Recipient Country Code
     */
    public populateRecipient(city: string, stateOrProvinceCode: string, postalCode: string, countryCode: string): Recipient {
        const addressData: MatchedAddresses = {
            city,
            stateOrProvinceCode,
            postalCode,
            countryCode
        };
        const recipient: Recipient = {
            address: addressData
        };

        return recipient;
    }

    /**
     * Populates Requested Package Line Item
     *
     * @param groupPackageCount - Group Package Count
     * @param physicalPackaging - Physical Packaging
     * @param insuredAmount - Insured Amount
     * @param insuredCurrency - Insured Currency
     * @param weightUnits - Weight in units
     * @param weightValue - Weight value
     */
    public populateRequestedPackageLineItem(groupPackageCount: string, physicalPackaging: string,
                                            insuredAmount: string, insuredCurrency: string, weightUnits: string,
                                            weightValue: string): RequestedPackageLineItem {
        const insuredValue: Amount = {
            amount: +insuredAmount,
            currency: insuredCurrency
        };

        const weight: Units = {
            units: weightUnits,
            value: weightValue
        };

        const requestedPackageLineItem = {
            groupPackageCount: +groupPackageCount,
            physicalPackaging: physicalPackaging,
            insuredValue: insuredValue,
            weight: weight
        }


        return requestedPackageLineItem;
    }
}
