import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { Util } from '../../../providers/util.service';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { ConfigService } from '@ngx-config/core';
import { RateQuoteRequest } from 'src/app/interfaces/api-service/request/rate-quote-request';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { RateQuoteResponse } from 'src/app/interfaces/api-service/response/rate-quote-response';

/**
 * This class contains all endpoints of Rate APIM Services
 *
 * Author: Carlo Oseo & Marlon Micael Cuevas
 * Modified By: Roan Villaflores
 * Date Created: Apr 22, 2020
 */
@Injectable()
export class RatesService {
    private rateQuoteAPI = '';

    constructor(
        private httpClient: HttpClient,
        private config: ConfigService,
        private util: Util) {
        const RATES_API = this.config.getSettings('APIM').RATES_ISLAND_API;
        this.rateQuoteAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, RATES_API.rateQuote);
    }

    /**
     * This method returns a detailed rate information based on user's shipment details using rates quotes v2
     *
     * @param rateQuoteRequest - Rate Quote V2 Request object
     */
    getRateQuoteV2(rateQuoteRequest: RateQuoteRequest): Observable<GenericResponse<RateQuoteResponse>> {
        const resourceUrl: string = this.rateQuoteAPI;
        let httpReqHeader = {
            headers: new HttpHeaders({
                'Content-Type': HttpContentType.APPLICATION_JSON
            })
        };
        const requestBody = JSON.stringify(rateQuoteRequest);

        return this.httpClient.post<GenericResponse<RateQuoteResponse>>(resourceUrl, requestBody, httpReqHeader).
            pipe(
                shareReplay(1),
                tap(response => {
                    if (response instanceof HttpErrorResponse) {
                        return response.error;
                    }
                })
            );
    }
}
