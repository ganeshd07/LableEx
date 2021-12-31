import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Util } from '../../../providers/util.service';
import { Observable } from 'rxjs';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { tap } from 'rxjs/operators';
import { CurrencyConfigurationResponse } from '../../../interfaces/api-service/response/currency-configuration-response';
import { ConfigService } from '@ngx-config/core';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';

/**
 * This class contains all endpoints of Currency, UOM, COM
 *
 * Author: Ganesh Dhavale
 * 
 * Date Created: Dec 14, 2020
 */

@Injectable()
export class CurrencyUomComConfigurationService {
    private configurationAPI = '';

    constructor(private httpClient: HttpClient,
        private config: ConfigService,
        private util: Util) {
        let CONFIGURATION_API = this.config.getSettings('LOCAL').API_ISLAND;
        this.configurationAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, CONFIGURATION_API.configList);
    }

    /**
    * This method returns a local CURRENCY, UOM, COM configlist 
    * based on user's sender country code and type of configuration using 
    * configuration API v1
    *
    * @param countryCode - sender country code
    * @param type - type of configuration like CURRENCY, UOM, COM
    */
    getConfigurationAsPerCountryCodeAndType(countryCode: string, type: string): Observable<GenericResponse<CurrencyConfigurationResponse>> {
        const resourceUrl: string = this.configurationAPI.concat(`?countryCode=${countryCode}&type=${type}`);
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<CurrencyConfigurationResponse>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

}
