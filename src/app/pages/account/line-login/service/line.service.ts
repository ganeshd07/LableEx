import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ConfigService } from '@ngx-config/core';


@Injectable({
  providedIn: 'root'
})
export class LineService {

  protected accessTokenApi = '';
  protected userProfileApi = '';
  protected verifyTokenApi = '';

  constructor(private http: HttpClient, private config: ConfigService) {
    this.accessTokenApi = this.config.getSettings('LINE').ACCESS_TOKEN_API;
    this.userProfileApi = this.config.getSettings('LINE').USER_TOKEN_API;
    this.verifyTokenApi = this.config.getSettings('LINE').VERIFY_TOKEN_API;
  }

  getAccessToken(code: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded',
      }),
    };

    const body = new HttpParams()
      .set('grant_type', this.config.getSettings('LINE').GRANT_TYPE)
      .set('code', code)
      .set('redirect_uri', this.config.getSettings('LINE').REDIRECT_URL)
      .set('client_id', this.config.getSettings('LINE').CLIENT_ID)
      .set('client_secret', this.config.getSettings('LINE').CLIENT_SECRET);

    return this.http.post(this.accessTokenApi, body, httpOptions);
  }

  getUserProfile(token_type: string, access_token: string) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `${token_type} ${access_token}`,
      }),
    };

    return this.http.get(this.userProfileApi, httpOptions);
  }

  verifyAccessTokenAndFetch(id_token: string, user_id: string) {
    const body = new HttpParams()
      .set('id_token', id_token)
      .set('client_id', this.config.getSettings('LINE').CLIENT_ID)
      .set('nonce', this.config.getSettings('LINE').NONCE)
      .set('user_id', user_id);

    return this.http.post(this.verifyTokenApi, body);
  }
}
