import { Observable } from 'rxjs';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { Util } from '../../../providers/util.service';
import { APIMCommodityDataMapper } from '../../../providers/mapper/apim/commodity-data-mapper.service';
import { ConfigService } from '@ngx-config/core';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { CommodityDescriptionResponse } from 'src/app/interfaces/api-service/response/commodity-description-response';
import { KeyTextList } from 'src/app/interfaces/api-service/common/key-text-list';

/**
 * This class contains all endpoints of Commodity APIM Services
 * 
 * Author: Carlo Oseo
 * Date Created: Apr 14, 2020 
 */
@Injectable()
export class APIMCommodityService {
    private commodityDescriptionAPI = '';
    private validateCommodityDescriptionAPI = '';
    private unitOfMeasuresAPI ='';
  
    constructor(private httpClient: HttpClient,
        private config: ConfigService,
        private dataMapper: APIMCommodityDataMapper,
        private util: Util) {
        let COMMODITY_API: any = this.config.getSettings('APIM').COMMODITY_ISLAND_API;
        this.commodityDescriptionAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, COMMODITY_API.commodities);
        this.validateCommodityDescriptionAPI = this.util.joinStrings('', this.commodityDescriptionAPI, COMMODITY_API.validateCommodityDescription);
        this.unitOfMeasuresAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, COMMODITY_API.unitOfMeasure);
    }

    /**
     * This method processes the description of the commodity and returns true if valid
     * 
     * @param description 
     */
    validateCommodityDescription(description: string): Observable<GenericResponse<CommodityDescriptionResponse>> {
        const resourceUrl: string = this.validateCommodityDescriptionAPI;
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);
        let requestBody = this.dataMapper.mapCommodityDescriptionRequest(description);

        return this.httpClient.post<GenericResponse<CommodityDescriptionResponse>>(resourceUrl, requestBody, httpHeaders).
            pipe(
                tap(response => {
                    if (response instanceof HttpErrorResponse) {
                        return response.error;
                    }
                })
            );
    }
  
    fetchUnitOfMeasures(): Observable<GenericResponse<KeyTextList>> {
        const resourceUrl: string = this.unitOfMeasuresAPI.concat(`?type`);
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
