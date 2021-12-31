import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Util } from '../../../providers/util.service';
import { Observable } from 'rxjs';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { tap } from 'rxjs/operators';
import { ConfigService } from '@ngx-config/core';
import { CommodityManufactureResponse } from 'src/app/interfaces/api-service/response/commodity-manufacture-response.interface';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { SystemCommodityResponse } from 'src/app/interfaces/api-service/response/system-commodity-list-response';
import { CommodityDetails } from 'src/app/interfaces/api-service/response/commodity-details';
import { Commodities } from 'src/app/interfaces/api-service/response/commodities';
import { CommodityItem } from 'src/app/interfaces/api-service/response/commodity-item';
import { SystemCommodity } from 'src/app/interfaces/api-service/response/system-commodity';

@Injectable()
export class LocalCommodityService {
    private commoditiesNamesAPI = '';
    private commodityDetailsAPI = '';
    private commodityItemDetailsAPI = '';
    private countryOfManufactureAPI = '';
    private systemCommodityListAPI = '';
    private saveUserCommodityAPI = '';
    private userCommodityListAPI = '';

    constructor(private httpClient: HttpClient,
        private config: ConfigService,
        private util: Util) {
        let COMMODITY_API = this.config.getSettings('LOCAL').COMMODITY_LOCAL_ISLAND_API;
        const COMMODITY_COM_API = this.config.getSettings('LOCAL').API_ISLAND;
        this.commoditiesNamesAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, COMMODITY_API.commoditiesNames);
        this.commodityDetailsAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, COMMODITY_API.commodityDetails);
        this.commodityItemDetailsAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, COMMODITY_API.commodityItemDetails);
        this.countryOfManufactureAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, COMMODITY_COM_API.configList);
        this.systemCommodityListAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, COMMODITY_API.systemCommodityList);
        this.saveUserCommodityAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, COMMODITY_COM_API.saveCommodityItem);
        this.userCommodityListAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, COMMODITY_COM_API.userCommodityList);
    }

    getCommoditiesNames(): Observable<GenericResponse<Commodities>> {
        const resourceUrl: string = this.commoditiesNamesAPI;
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<Commodities>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    getCommodityDetailsByKey(key: string): Observable<GenericResponse<CommodityDetails>> {
        const resourceUrl: string = this.commodityDetailsAPI.concat(`?key=${key}`);
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<CommodityDetails>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    // NOTE: Temporarily commented. This is an unused service method and does not work currently.
    // TODO: Update and uncomment if going to use.
    // getCommodityItemDetails(): Observable<GenericResponse<CommodityItem>> {
    //     const resourceUrl: string = this.commodityItemDetailsAPI;
    //     let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

    //     return this.httpClient.get<GenericResponse<CommodityItem>>(resourceUrl, httpHeaders).pipe(
    //         tap(response => {
    //             if (response instanceof HttpErrorResponse) {
    //                 return response.error;
    //             }
    //         })
    //     );
    // }

    getCountryOfManufactureByCountryCodeAndType(countryCode: string, type: string): Observable<GenericResponse<CommodityManufactureResponse>> {
        const resourceUrl: string = this.countryOfManufactureAPI.concat(`?countryCode=${countryCode}&type=${type}`);
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<CommodityManufactureResponse>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    getSystemCommodityListByCategory(category: string): Observable<GenericResponse<SystemCommodityResponse>> {
        const resourceUrl: string = this.systemCommodityListAPI.concat(`?category=${category}`);
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<SystemCommodityResponse>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    getUserCommodityListByCategory(uid: string, category: string): Observable<GenericResponse<any>> {
        const resourceUrl: string = this.userCommodityListAPI.concat(`?category=${category}&uid=${uid}`);
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<any>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    saveUserCommodity(commodityDetails): Observable<SystemCommodity> {
        const resourceUrl: string = this.saveUserCommodityAPI;
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);
        const requestBody = commodityDetails;

        return this.httpClient.post<SystemCommodity>(resourceUrl, requestBody, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }
}
