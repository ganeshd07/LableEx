import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Util } from '../../../providers/util.service';
import { Observable } from 'rxjs';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { tap } from 'rxjs/operators';
import { ConfigService } from '@ngx-config/core';
import { CurrencyConversionResponse } from 'src/app/interfaces/api-service/response/currency-conversion-response';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { CurrenciesResponse } from 'src/app/interfaces/api-service/response/currencies-response';

/**
 * This class contains all endpoints of Global Trade APIM Services
 *
 * Author: Carlo Oseo
 * Date Created: Apr 22, 2020
 */
@Injectable()
export class APIMGlobalTradeService {
    private currenciesAPI = '';
    private currencyConversionAPI = '';

    constructor(private httpClient: HttpClient,
                private readonly config: ConfigService,
                private util: Util) {
        const GLOBAL_TRADE_API = this.config.getSettings('APIM').GLOBAL_TRADE_ISLAND_API;
        this.currenciesAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, GLOBAL_TRADE_API.currencies);
        this.currencyConversionAPI = this.util.joinStrings('', this.currenciesAPI, GLOBAL_TRADE_API.currencyConversion);
    }

    /**
     * This method returns currencies of each country
     */
    getCurrencies(): Observable<GenericResponse<CurrenciesResponse>> {
        const resourceUrl: string = this.currenciesAPI;
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<CurrenciesResponse>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    /**
     * This method returns currency conversion based on from and to currency codes and the date of conversion
     */
    getCurrencyConversion(fromCurrencyCode: string, toCurrencyCode: string, amount: number, conversionDate: string){
        const resourceUrl: string = this.currencyConversionAPI.concat(`?fromcurrencycode=${fromCurrencyCode}&tocurrencycode=${toCurrencyCode}&amount=${amount}&conversiondate=${conversionDate}`);
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<CurrencyConversionResponse>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }
}
