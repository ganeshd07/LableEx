import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Util } from 'src/app/providers/util.service';
import { HttpContentType } from 'src/app/types/enum/http-content-type.enum';
import { ApiResponse } from 'src/app/interfaces/api-service/response/api-response';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private configListAPI: string;

  constructor(
    private httpClient: HttpClient,
    private util: Util,
    private readonly config: ConfigService
  ) {
    this.configListAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, this.config.getSettings('LOCAL').API_ISLAND.configList);
  }

  getconfigList(countryCode: string, type: string): Observable<ApiResponse> {
    const resourceUrl: string = this.configListAPI.concat(`?countryCode=${countryCode}&type=${type}`);
    let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

    return this.httpClient.get<ApiResponse>(resourceUrl, httpHeaders).pipe(
      tap(response => {
        if (response instanceof HttpErrorResponse) {
          return response.error;
        }
      })
    );
  }
}