import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Util } from '../../../providers/util.service';
import { Observable } from 'rxjs';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { tap } from 'rxjs/operators';
import { ConfigService } from '@ngx-config/core';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { KeyTextList } from 'src/app/interfaces/api-service/common/key-text-list';

/**
 * This class contains all endpoints of Payment APIM Services
 * 
 * Author: Carlo Oseo
 * Date Created: Apr 22, 2020 
 */
@Injectable()
export class APIMPaymentService {
    private paymentAPI = '';
    private paymentTypesAPI = '';

    constructor(private httpClient: HttpClient,
        private readonly config: ConfigService,
        private util: Util) {
            let PAYMENT_API = this.config.getSettings('APIM').PAYMENT_ISLAND_API;
            this.paymentAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, PAYMENT_API.payment);
            this.paymentTypesAPI = this.util.joinStrings('', this.paymentAPI, PAYMENT_API.paymentTypes);
    }

    /**
     * This method returns list of payment types by country code and service type
     * 
     * @param reason 
     * @param serviceType 
     * @param senderCountryCode 
     * @param recipientCountryCode 
     */
    //TODO: Create interface for payment types duties taxes
    getPaymentTypesByCountryCodesAndServiceType(reason: string, serviceType: string, senderCountryCode: string, recipientCountryCode: string): Observable<GenericResponse<KeyTextList>> {
        const resourceUrl: string = this.paymentTypesAPI.concat(`?reason=${reason}&servicetype=${serviceType}&sendercountrycode=${senderCountryCode}&recipientcountrycode=${recipientCountryCode}`);
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<KeyTextList>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }
}
