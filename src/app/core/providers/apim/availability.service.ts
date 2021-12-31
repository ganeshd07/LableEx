import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Util } from '../../../providers/util.service';
import { Observable } from 'rxjs';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { shareReplay, tap } from 'rxjs/operators';
import { APIMAvailabilityDataMapper } from '../../../providers/mapper/apim/availability-data-mapper.service';
import { ConfigService } from '@ngx-config/core';
import { Sender } from 'src/app/interfaces/api-service/request/sender';
import { Recipient } from 'src/app/interfaces/api-service/request/recipient';
import { PackageAndServiceOptionsResponseParams } from 'src/app/interfaces/api-service/response/package-and-service-options-response';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { SignatureOptionsParams } from 'src/app/interfaces/api-service/request/signature-option-params.interface';
import { SignatureOptionsResponse } from 'src/app/interfaces/api-service/response/signature-options-response.interface';
import { PackagingTypeList } from 'src/app/interfaces/api-service/response/packaging-type-list';

/**
 * This class contains all endpoints of Availability APIM Services
 *
 * Author: Carlo Oseo
 * Date Created: Apr 22, 2020
 */
@Injectable()
export class APIMAvailabilityService {

    protected specialServiceOptionsAPI = '';
    protected signatureOptionsAPI = '';
    protected packageAndServiceOptionsAPI = '';
    protected packageTypeListAPI = '';

    constructor(private httpClient: HttpClient,
                private readonly config: ConfigService,
                private dataMapper: APIMAvailabilityDataMapper,
                private util: Util) {
            const AVAILABILITY_API: any = this.config.getSettings('APIM').AVAILABILITY_ISLAND_API;
            this.specialServiceOptionsAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST,
            AVAILABILITY_API.specialServiceOptions);
            this.signatureOptionsAPI = this.util.joinStrings('', this.specialServiceOptionsAPI, AVAILABILITY_API.signatureOptions);
            this.packageAndServiceOptionsAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST,
            AVAILABILITY_API.packageAndServiceOptions);
            this.packageTypeListAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, AVAILABILITY_API.packageTypeList);
    }

    /**
     * This method return list of package types offered by FedEx
     */
    getPackageTypeList(): Observable<GenericResponse<PackagingTypeList>> {
        const resourceURL: string = this.packageTypeListAPI;
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<PackagingTypeList>>(resourceURL, httpHeaders).
            pipe(
                tap(response => {
                    if (response instanceof HttpErrorResponse) {
                        return response.error;
                    }
                })
            );
    }

    /**
     * This method returns all package and service options from APIM
     *
     * @param packageAndServiceOptionsRequestParams
     */
    getPackageAndServiceOptions(sender: Sender, recipient: Recipient): Observable<GenericResponse<PackageAndServiceOptionsResponseParams>> {
        const resourceURL: string = this.packageAndServiceOptionsAPI;
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);
        const requestBody = this.dataMapper.mapPackageAndServiceOptionsRequest(sender, recipient);

        return this.httpClient.post<GenericResponse<PackageAndServiceOptionsResponseParams>>(resourceURL, requestBody, httpHeaders).
            pipe(
                shareReplay(1),
                tap(response => {
                    if (response instanceof HttpErrorResponse) {
                        return response.error;
                    }
                })
            );
    }

    getSignatureOptionsList(signatureOptionParams: SignatureOptionsParams): Observable<GenericResponse<SignatureOptionsResponse>> {
        const resourceUrl: string = this.signatureOptionsAPI;
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);
        const requestBody = JSON.stringify(signatureOptionParams);

        return this.httpClient.post<GenericResponse<SignatureOptionsResponse>>(resourceUrl, requestBody, httpHeaders).
            pipe(
                tap(response => {
                    if (response instanceof HttpErrorResponse) {
                        return response.error;
                    }
                })
            );
    }
}