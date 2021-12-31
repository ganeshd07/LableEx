import { Injectable } from '@angular/core';
import { CarrierCode } from '../../../types/enum/carrier-codes.enum';
import { MatchCondition } from '../../../types/enum/match-conditions.enum';
import { Util } from '../../util.service';
import { DatePipe } from '@angular/common';
import { CityListRequest } from 'src/app/interfaces/api-service/request/city-list-request';
import { MatchAndResultsCriteria } from 'src/app/interfaces/api-service/request/match-and-results-criteria';
import { Address } from 'src/app/interfaces/api-service/request/address';

/**
 * This class contains all data mappers of Country APIM Services
 * 
 * Author: Carlo Oseo
 * Date Created: June 11, 2020 
 */
@Injectable({
    providedIn: 'root'
})
export class APIMCountryDataMapper {

    constructor(private util: Util, private datePipe: DatePipe) { }

    /**
     * Mapper for Country Cities request
     * 
     * @param countryCode 
     * @param postalCode 
     */
    public mapCountryCitiesRequest(countryCode: string, postalCode: string) {
        let citiesRequest: CityListRequest;
        let requestCriteria: MatchAndResultsCriteria;
        let _address: Address;

        _address = {
            postalCode: postalCode,
            countryCode: (countryCode) ? countryCode : 'US',
            residential: false,
            streetLines: undefined,
            city: undefined
        };

        requestCriteria = {
            address: _address,
            resultsToSkip: 0,
            resultsRequested: 0,
            resultConditions: ['string'],
            matchConditions: undefined
        };

        citiesRequest = {
            matchAndResultsCriteria: requestCriteria,
            carrierCode: CarrierCode.FDXE
        };

        let requestBody = this.util.toJSON(citiesRequest);

        if (postalCode) {
            requestBody.matchAndResultsCriteria.matchConditions = [MatchCondition.EXACT_POSTAL_CODE];
        } else {
            requestBody.matchAndResultsCriteria.matchConditions = [MatchCondition.PARTIAL_CITY];
        }

        return JSON.stringify(requestBody);
    }
}
