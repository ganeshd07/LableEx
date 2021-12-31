import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { OAuthEnum } from '../../../types/enum/oauth-enum.enum';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { Util } from '../../../providers/util.service';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BrowserService } from '../browser.service';
import { OAuthResponse } from 'src/app/interfaces/api-service/response/oauth-response';

/**
 * This is a class for LabelEx's authentication service calls
 * It contains reusable methods for authenticating http calls
 * 
 * Author: Roan Villaflores
 * Date Created: Apr 15, 2020 
 */
@Injectable()
export class AuthenticationService {

  protected oauthV2API = '';
  protected oauthCredentials: any = {};

  constructor(
    private http: HttpClient,
    private util: Util,
    private readonly config: ConfigService,
    private browserService: BrowserService
  ) {
    const TOKEN_API = this.config.getSettings('APIM').AUTH_ISLAND_API;
    this.oauthV2API = this.util.joinStrings('', this.config.getSettings('APIM').HOST, TOKEN_API.token);
    this.oauthCredentials = this.config.getSettings('APIM').OAUTH_CREDENTIALS;
  }

  /**
   * This method returns the APIM oauth token request
   * via http call
   */
  getOAuthToken(): Observable<OAuthResponse> {
    const resourceURL: string = this.oauthV2API;
    const tokenReqHeaders = {
      headers: new HttpHeaders({
        'Content-type': HttpContentType.APPLICATION_FORM_URLENCODED
        // Use this line to adopt in OAuth2 for client_secret encryption
        // 'Authorization': 'Basic ' + btoa(oauthParams.client_id.concat(':').concat(oauthParams.client_secret))
      })
    };

    return this.http.post<OAuthResponse>(resourceURL, this.getOAuthRequestBody(), tokenReqHeaders).
      pipe(
        tap(response => {
          if (response instanceof HttpErrorResponse) {
            return response.error;
          }
        })
      );
  }

  /**
   * This method returns required oauth request params
   */
  private getOAuthRequestBody() {
    const OAUTH_CREDENTIALS_CONFIG = this.oauthCredentials;
    const tokenReqParams = new URLSearchParams();
    tokenReqParams.append(OAuthEnum.PARAM_GRANT_TYPE, OAUTH_CREDENTIALS_CONFIG.grantType);
    tokenReqParams.append(OAuthEnum.PARAM_CLIENT_ID, OAUTH_CREDENTIALS_CONFIG.clientId);
    tokenReqParams.append(OAuthEnum.PARAM_CLIENT_SECRET, OAUTH_CREDENTIALS_CONFIG.clientSecret);
    tokenReqParams.append(OAuthEnum.PARAM_SCOPE, OAUTH_CREDENTIALS_CONFIG.scope);
    return tokenReqParams.toString();
  }

  /**
   * This method checks if the existing token has expired
   */
  // TODO: temporarily commented this unused method. Uncomment to use
  // public isTokenExpired() {
  //   let currentDateTime = 0;
  //   let tokenExpiry = 0;
  //   if (this.browserService.isbrowser) {
  //     if (sessionStorage.getItem(OAuthEnum.STORE_KEY)) {
  //       const storedToken: OAuthToken = JSON.parse(sessionStorage.getItem(OAuthEnum.STORE_KEY));
  //       currentDateTime = new Date().getTime();
  //       tokenExpiry = storedToken.expiry;
  //     }
  //   }
  //   return ((currentDateTime !== 0 && tokenExpiry !== 0) && (currentDateTime >= tokenExpiry));
  // }

  /**
   * This method stores the oauth data via browser's localStorage
   * @param token - from oauth response object
   */
  public saveToken(token: OAuthResponse) {
    const tokenExpireDate = new Date().getTime() + (1000 * token.expires_in);
    if (this.browserService.isbrowser) {
      if (sessionStorage.getItem(OAuthEnum.STORE_KEY)) {
        sessionStorage.removeItem(OAuthEnum.STORE_KEY);
      }
      const oauthObjStorage = {
        token: btoa(token.access_token),
        expiry: tokenExpireDate
      };
      sessionStorage.setItem(OAuthEnum.STORE_KEY, JSON.stringify(oauthObjStorage));
    }
  }

  /**
   * This method encapsulates the http service call for oauth
   * & is being called directly to replace expired/undefined oauth token
   */
  public getAccessToken() {
    this.getOAuthToken().subscribe((response) => {
      const oauthResponse: OAuthResponse = response;
      this.saveToken(oauthResponse);
    });
  }
}
