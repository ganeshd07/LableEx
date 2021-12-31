import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiResponse } from 'src/app/interfaces/api-service/response/api-response';
import { Util } from 'src/app/providers/util.service';

/**
 * This class contains service calls for LOCAL API endpoints related to Rates
 *
 * Author: Roan Villaflores
 * Date Created: Dec 10, 2020
 */
@Injectable({
  providedIn: 'root'
})
export class LocalRatesService {
  private rateDiscountAPI: string;

  constructor(
    private httpClient: HttpClient,
    private config: ConfigService,
    private util: Util
  ) {
    const CONFIG_SERVICE_OBJ = this.config.getSettings('LOCAL');
    this.rateDiscountAPI = this.util.joinStrings('', CONFIG_SERVICE_OBJ.HOST, CONFIG_SERVICE_OBJ.API_ISLAND.configList);
  }

  getRatesDiscountByCountry(countryCode: string): Observable<ApiResponse> {
    const resourceUrl = this.util.joinStrings('', this.rateDiscountAPI, `?type=DISCOUNT&countryCode=${countryCode}`);
    return this.httpClient.get<ApiResponse>(resourceUrl).pipe(
      tap((response) => {
        if (response instanceof HttpErrorResponse) {
          return response.error;
        }
      })
    );
  }
}
