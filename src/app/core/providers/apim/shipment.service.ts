import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { tap } from 'rxjs/operators';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { Util } from '../../../providers/util.service';
import { ConfigService } from '@ngx-config/core';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { KeyTextList } from 'src/app/interfaces/api-service/common/key-text-list';

/**
 * This class contains all endpoints of Shipment APIM Services
 *
 * Author: Carlo Oseo
 * Date Created: Apr 22, 2020
 */
@Injectable()
export class APIMShipmentService {
    private shipmentAPI = '';
    private documentDescriptionAPI = '';
    private shipmentPurposeAPI = '';

    constructor(private httpClient: HttpClient,
                private config: ConfigService,
                private util: Util) {
        const SHIPMENT_API = this.config.getSettings('APIM').SHIPMENT_ISLAND_API;
        this.shipmentAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, SHIPMENT_API.shipping);
        this.documentDescriptionAPI = this.util.joinStrings('', this.shipmentAPI, SHIPMENT_API.documentDescription);
        this.shipmentPurposeAPI = this.util.joinStrings('', this.shipmentAPI, SHIPMENT_API.shipmentPurpose);
    }

    /**
     * This method returns list of document description by country code
     *
     * @param senderCountryCode
     * @param recipientCountryCode
     * @param setAdvanced
     */
    getDocumentDescriptionByCountryCodes(senderCountryCode: string, recipientCountryCode: string, setAdvanced: boolean)
        : Observable<GenericResponse<KeyTextList>> {
        const resourceUrl: string = this.documentDescriptionAPI.concat(`?sendercountrycode=${senderCountryCode}&recipientcountrycode=${recipientCountryCode}&setadvanced=${setAdvanced}`);
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<KeyTextList>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    /**
     * This method returns list of shipment purposes by country code and service type
     *
     * @param senderCountryCode
     * @param recipientCountryCode
     * @param serviceType
     */
    getShipmentPurposeByCountryCodesAndServiceType(senderCountryCode: string, recipientCountryCode: string, serviceType: string)
        : Observable<GenericResponse<KeyTextList>> {
        const resourceUrl: string = this.shipmentPurposeAPI.concat(`?sendercountrycode=${senderCountryCode}&recipientcountrycode=${recipientCountryCode}&servicetype=${serviceType}`);
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<KeyTextList>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

}