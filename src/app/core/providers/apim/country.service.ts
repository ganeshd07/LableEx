import { Observable, of } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { shareReplay, tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { Util } from '../../../providers/util.service';
import { CountryTypes } from '../../../types/enum/country-type.enum';
import { APIMCountryDataMapper } from '../../../providers/mapper/apim/country-data-mapper.service';
import { ConfigService } from '@ngx-config/core';
import { SenderRecipientInfoResponse } from 'src/app/interfaces/api-service/response/sender-recipient-info-response';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { CountryListResponse } from 'src/app/interfaces/api-service/response/country-list-response';
import { Country } from 'src/app/interfaces/api-service/response/country';
import { CityListResponse } from 'src/app/interfaces/api-service/response/city-list-response.interface';
import { CountryDialingPrefixesResponse } from 'src/app/interfaces/api-service/response/country-dialing-prefixes-response.interface';
import { CountryDetailResponse } from 'src/app/interfaces/api-service/response/country-detail-response.interface';
import { StateResponse } from 'src/app/interfaces/api-service/response/state-response';
import { CommodityManufactureResponse } from 'src/app/interfaces/api-service/response/commodity-manufacture-response.interface';

/**
 * This class contains all endpoints of Country APIM Services
 *
 * Author: Carlo Oseo
 * Date Created: Apr 14, 2020
 */
@Injectable()
export class APIMCountryService {
    private countriesAPI = '';
    private countryDetailAPI = '';
    private senderRecipientInfoAPI = '';
    private countryDialingPrefixesAPI = '';
    private citiesAPI = '';

    constructor(private httpClient: HttpClient,
        private readonly config: ConfigService,
        private dataMapper: APIMCountryDataMapper,
        private util: Util) {
        const COUNTRY_API: any = this.config.getSettings('APIM').COUNTRY_ISLAND_API;
        this.countriesAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, COUNTRY_API.countries);
        this.countryDetailAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, COUNTRY_API.countryDetail);
        this.senderRecipientInfoAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, COUNTRY_API.senderRecipientInfo);
        this.countryDialingPrefixesAPI = this.util.joinStrings('', this.countriesAPI, COUNTRY_API.dialingPrefixes);
        this.citiesAPI = this.util.joinStrings('', this.countriesAPI, COUNTRY_API.cities);
    }

    /**
     * This method returns list of countries by manufacture type
     *
     * @param countryType
     */
    getCommodityManufacture(countryType: CountryTypes): Observable<GenericResponse<CommodityManufactureResponse>> {
        const resourceUrl: string = this.countriesAPI.concat(`?type=${countryType}`);
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<CommodityManufactureResponse>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    /**
     * This method returns the list of countries with detailed information such as postal awareness, etc.
     */
    getCountries(): Observable<GenericResponse<CountryListResponse<Country>>> {
        const resourceUrl: string = this.countriesAPI;
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<CountryListResponse<Country>>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    /**
     * This method returns list of countries by recipient or sender type
     *
     * @param countryType
     */
    getCountryListByType(countryType: CountryTypes): Observable<GenericResponse<CountryListResponse<Country>>> {
        const resourceUrl: string = this.countriesAPI.concat(`?type=${countryType}`);
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<CountryListResponse<Country>>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    /**
     * This method returns dialing prefixes per each country
     */
    getCountryDialingPrefixes(): Observable<GenericResponse<CountryDialingPrefixesResponse>> {
        const resourceUrl: string = this.countryDialingPrefixesAPI;
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);
        return this.httpClient.get<GenericResponse<CountryDialingPrefixesResponse>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    /**
     * This method returns cities based by country code and postal code.
     * This method needs to be rework by adding an interface in the future development work.
     *
     * @param countryCode
     * @param postalCode
     */
    getCitiesByCountryCodeAndPostalCode(countryCode: string, postalCode: string): Observable<GenericResponse<CityListResponse>> {
        const resourceUrl: string = this.citiesAPI;
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);
        const requestBody = this.dataMapper.mapCountryCitiesRequest(countryCode, postalCode);

        return this.httpClient.post<GenericResponse<CityListResponse>>(resourceUrl, requestBody, httpHeaders).
            pipe(
                shareReplay(1),
                tap(response => {
                    if (response instanceof HttpErrorResponse) {
                        return response.error;
                    }
                })
            );
    }

    /**
     * This method returns the details of a country by country code
     *
     * @param countryCode
     */
    getCountryDetailsByCountryCode(countryCode: string): Observable<GenericResponse<CountryDetailResponse>> {
        const resourceUrl: string = this.util.joinStrings('', this.countryDetailAPI, `/${countryCode}`);
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<CountryDetailResponse>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    /**
     * This method returns the list of states of a country by country code
     *
     * @param countryCode
     */
    getStatesByCountryCode(countryCode: string): Observable<GenericResponse<StateResponse>> {
        const resourceUrl: string = this.util.joinStrings('', this.countriesAPI, `/${countryCode}`,
            this.config.getSettings('APIM').COUNTRY_ISLAND_API.states);
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<StateResponse>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    /**
     * This method returns sender recipient information by country code
     *
     * @param senderCountryCode
     * @param recipientCountryCode
     */
    getSenderRecipientInfoByCountryCodes(senderCountryCode: string, recipientCountryCode: string)
        : Observable<GenericResponse<SenderRecipientInfoResponse>> {
        const resourceUrl: string = this.util.joinStrings('', this.senderRecipientInfoAPI,
            `?sendercountrycode=${senderCountryCode}&recipientcountrycode=${recipientCountryCode}`);
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<SenderRecipientInfoResponse>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }
}
