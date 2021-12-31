import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Util } from '../../../providers/util.service';
import { Observable } from 'rxjs';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { tap } from 'rxjs/operators';
import { ConfigService } from '@ngx-config/core';
import { CreatShipmentRequestMapper } from 'src/app/providers/mapper/local/create-shipment-request-mapper.service';
import { CreateShipmentResponse } from 'src/app/interfaces/api-service/response/create-shipment-response';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { ShippingInfo } from 'src/app/pages/shipping/+store/shipping.state';

/**
 * This class contains endpoint of Create Shipment
 *
 * Author: Ganesh Dhavale
 * 
 * Date Created: Dec 17, 2020
 */

@Injectable()
export class CreateShipmentService {
    private createShipmentAPI = '';

    constructor(private httpClient: HttpClient,
        private config: ConfigService,
        private util: Util,
        private createShipmentMapper: CreatShipmentRequestMapper) {
        let CREATESHIPMENT_API = this.config.getSettings('LOCAL').API_ISLAND;
        this.createShipmentAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, CREATESHIPMENT_API.createShipment);
    }

    /**
    * This method POST all shipping information to local create shipment API
    *
    * @param shippingDetails - All shipping information
    *
    */
    postCreateShipment(shippingDetails: ShippingInfo): Observable<GenericResponse<CreateShipmentResponse>> {
        const resourceUrl: string = this.createShipmentAPI;
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);
        const requestBody = this.createShipmentMapper.mapShipmentDetailsToCreateShipmentRequestBody(shippingDetails);

        return this.httpClient.post<GenericResponse<CreateShipmentResponse>>(resourceUrl, requestBody, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

}
