import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LocalAuthRequest } from 'src/app/interfaces/api-service/request/local-auth-request';
import { LocalAuthResponse } from 'src/app/interfaces/api-service/response/local-auth-response';
import { Util } from 'src/app/providers/util.service';
import { HttpContentType } from 'src/app/types/enum/http-content-type.enum';
import { OAuthEnum } from 'src/app/types/enum/oauth-enum.enum';
import { BrowserService } from '../browser.service';

@Injectable({
  providedIn: 'root'
})
export class LocalAuthenticationService {

  protected authAPI = '';
  protected authCredentials: LocalAuthRequest;

  constructor(
    private httpClient: HttpClient,
    private util: Util,
    private readonly config: ConfigService,
    private browserService: BrowserService
  ) {
    const localApiHost = this.config.getSettings('LOCAL').HOST;
    const localApiIsland = this.config.getSettings('LOCAL').API_ISLAND;
    this.authAPI = this.util.joinStrings('', localApiHost, localApiIsland.authenticate);
    this.authCredentials = this.config.getSettings('LOCAL').TOKEN_CREDENTIALS;
  }

  getAuthenticationToken(): Observable<LocalAuthResponse> {
    const apiResourceUrl: string = this.authAPI;
    const requestBody = JSON.stringify(this.authCredentials);
    const requestHeader = {
      headers: new HttpHeaders({
        'Content-type': HttpContentType.APPLICATION_JSON
      })
    };

    return this.httpClient.post<LocalAuthResponse>(apiResourceUrl, requestBody, requestHeader).pipe(
      tap(response => {
        if (response instanceof HttpErrorResponse) {
          return response.error;
        }
      })
    );
  }

  public getLocalAuthToken() {
    this.getAuthenticationToken().subscribe(
      (response) => {
        const authResponse: LocalAuthResponse = response;
        this.storeToken(authResponse);
      });
  }

  public storeToken(tokenObj: LocalAuthResponse) {
    if (this.browserService.isbrowser) {
      if (sessionStorage.getItem(OAuthEnum.LOCAL_STORE_KEY)) {
        sessionStorage.removeItem(OAuthEnum.LOCAL_STORE_KEY);
      }
      const encryptedToken = btoa(tokenObj.token);
      sessionStorage.setItem(OAuthEnum.LOCAL_STORE_KEY, encryptedToken);
    }
  }
}
