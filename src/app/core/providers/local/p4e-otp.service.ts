import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Util } from 'src/app/providers/util.service';
import { HttpContentType } from 'src/app/types/enum/http-content-type.enum';
import { OtpRequestConstants } from 'src/app/types/constants/otp-request.constants';
import { GenericOtpResponse } from 'src/app/interfaces/api-service/response/generic-otp-response';
import { LocaleOtp } from 'src/app/types/enum/locale-otp.enum';
import { HttpHeaderKey } from 'src/app/types/enum/http-header-key.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

@Injectable({
  providedIn: 'root'
})
export class P4eOtpService {
  private generateOtpAPI: string;
  private validateOtpAPI: string;
  private userProfileAPI: string;
  private acceptedTcAPI: string;
  private applicationKey: string;
  private timeZone: string;
  private p4eOtpSettings = null;

  constructor(
    private httpClient: HttpClient,
    private util: Util,
    private readonly config: ConfigService
  ) {
    const localApiIsland = this.config.getSettings('LOCAL').API_ISLAND;
    this.generateOtpAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, localApiIsland.generateOtp);
    this.validateOtpAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, localApiIsland.validateOtp);
    this.userProfileAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, localApiIsland.userProfile);
    this.acceptedTcAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, localApiIsland.acceptedTC);
    this.p4eOtpSettings = this.config.getSettings('LOCAL').P4E_OTP_SETTINGS;
    this.applicationKey = this.p4eOtpSettings?.applicationKey;
    this.timeZone = this.p4eOtpSettings?.timeZone;
  }

  generateOtp(phoneNumber, countryCode): Observable<GenericOtpResponse> {
    const apiResourceUrl: string = this.generateOtpAPI;
    const selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    const dialingPrefix = sessionStorage.getItem(SessionItems.DIALINGPREFIX).replace('+', '');
    const locale = selectedLanguage === LocaleOtp.DEFAULT ? LocaleOtp.DEFAULT : LocaleOtp[countryCode];
    const isFromSummaryPage = Boolean(sessionStorage.getItem(SessionItems.ISFROMSUMMARY));
    this.applicationKey = isFromSummaryPage ? this.p4eOtpSettings?.applicationKeyBilling : this.p4eOtpSettings?.applicationKey;
    const requestBody = {
      applicationKey: this.applicationKey,
      phone: dialingPrefix + phoneNumber,
      email: '',
      authType: OtpRequestConstants.SMS,
      transactionName: OtpRequestConstants.TRANSACTION_NAME,
      country: countryCode,
      locale: locale,
      timeZone: this.timeZone
    };
    const requestHeader = {
      headers: new HttpHeaders({
        'Content-type': HttpContentType.APPLICATION_JSON
      })
    };

    return this.httpClient.post<GenericOtpResponse>(apiResourceUrl, requestBody, requestHeader).pipe(
      tap(response => {
        if (response instanceof HttpErrorResponse) {
          return response.error;
        }
      })
    );
  }

  validateOtp(token): Observable<GenericOtpResponse> {
    const apiResourceUrl: string = this.validateOtpAPI;
    const isFromSummaryPage = Boolean(sessionStorage.getItem(SessionItems.ISFROMSUMMARY));
    this.applicationKey = isFromSummaryPage ? this.p4eOtpSettings?.applicationKeyBilling : this.p4eOtpSettings?.applicationKey;
    const requestBody = {
      applicationKey: this.applicationKey,
      txId: sessionStorage.getItem(HttpHeaderKey.TX_ID),
      token: token
    };
    const requestHeader = {
      headers: new HttpHeaders({
        'Content-type': HttpContentType.APPLICATION_JSON
      })
    };

    return this.httpClient.post<GenericOtpResponse>(apiResourceUrl, requestBody, requestHeader).pipe(
      tap(response => {
        if (response instanceof HttpErrorResponse) {
          return response.error;
        }
      })
    );
  }

  getUserProfileDetails(uidValue: string): Observable<any> {
    const resourceUrl: string = this.userProfileAPI.concat(`?uidValue=${uidValue}`);
    let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

    return this.httpClient.get<any>(resourceUrl, httpHeaders).pipe(
      tap(response => {
        if (response instanceof HttpErrorResponse) {
          return response.error;
        }
      })
    );
  }

  updateAcceptedTCFlag(_acceptedTcFlag: boolean, _uid: string): Observable<any> {
    const resourceUrl: string = this.acceptedTcAPI;
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    }).replace(/ /g, '-');
    const formattedTime = date.toTimeString().split(' ')[0];
    const requestBody = {
      acceptedTCDate: formattedDate + ' ' + formattedTime,
      acceptedTcFlag: _acceptedTcFlag,
      uid: _uid
    };
    let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

    return this.httpClient.put<any>(resourceUrl, requestBody, httpHeaders).pipe(
      tap(response => {
        if (response instanceof HttpErrorResponse) {
          return response.error;
        }
      })
    );
  }
}
