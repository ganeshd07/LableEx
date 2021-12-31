import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HTTP_INTERCEPTORS, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, from, EMPTY, Observer } from 'rxjs';
import { catchError, retry, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { GlobalHttpMockInterceptor } from './global-http-mock.interceptor';
import { OAuthEnum } from '../../types/enum/oauth-enum.enum';
import { AuthenticationService } from '../../core/providers/apim/authentication.service';
import { ConfigService } from '@ngx-config/core';
import { BrowserService } from '../providers/browser.service';
import { HttpHeaderKey } from 'src/app/types/enum/http-header-key.enum';
import { CountryLocale } from 'src/app/types/constants/country-locale.constants';
import { HttpInterceptorResource } from 'src/app/types/constants/http-interceptor-resource.constants';
import { LocalAuthenticationService } from '../providers/local/local-authentication.service';
import { NotificationService } from '../providers/notification-service';
import { TranslateService } from '@ngx-translate/core';
import { ConfigState } from 'src/app/types/enum/config-state.enum';
import { LoadingController } from '@ionic/angular';
import { select, Store } from '@ngrx/store';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import { AppState } from 'src/app/+store/app.state';
import * as fromShippingSelector from 'src/app/pages/shipping/+store/shipping.selectors';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import { LoaderService } from '../providers/loader.service';
import { Util } from 'src/app/providers/util.service';

export const isMock = environment.mock;

/**
 * This is the http interceptor for APIM endpoints
 * It provides a data response from an actual http calls
 *
 * How this interceptor works?
 * 1) If at first it didn't succeed, there's a retry (one time), & the error handler.
 * There will be 3 record attempts in the network to exhaust to prevent or avoid any
 * loop calls.  (1 - the actual, 2 - retry & 3 - catched error)
 *
 * Limitation: FOR NOW only Unauthorized error (401) is being handled.
 * Other errors are automatically thrown via 3rd call attempt.
 *
 * @author: Roan Villaflores
 * Date Created: Apr 7, 2020
 */

@Injectable()
export class GlobalHttpInterceptor implements HttpInterceptor {
    protected APIM_HOST_URI = '';
    protected LOCAL_HOST_URI = '';
    userId = '';
    private rateQuoteUrl = '';

    private requests: HttpRequest<any>[] = [];

    constructor(
        private injector: Injector,
        private browserService: BrowserService,
        private config: ConfigService,
        private notif: NotificationService,
        private translate: TranslateService,
        public loadingController: LoadingController,
        private appStore: Store<AppState>,
        private loaderService: LoaderService,
        private util: Util
    ) {
        this.APIM_HOST_URI = this.config.getSettings('APIM').HOST;
        this.LOCAL_HOST_URI = this.config.getSettings('LOCAL').HOST;
        const RATES_API = this.config.getSettings('APIM').RATES_ISLAND_API;
        this.rateQuoteUrl = this.util.joinStrings('', this.config.getSettings('APIM').HOST, RATES_API.rateQuote);
    }

    removeRequest(req: HttpRequest<any>) {
        const idx = this.requests.indexOf(req);
        if (idx >= 0) {
            this.requests.splice(idx, 1);
        }

        if (this.requests.length === 0) {
            this.loaderService.hide();
        }

    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.url.endsWith('.json')) {
            return next.handle(request).pipe(tap((event: HttpEvent<any>) => { return; }));
        }

        const { url } = request;
        let isAPIMRequest = false;
        let isLocalAPIRequest = false;
        const isOAuthCall: boolean = (url.indexOf(OAuthEnum.ENDPOINT_KEY) > -1);
        const isLocalAuthCall: boolean = (url.indexOf(OAuthEnum.LOCAL_AUTH_ENDPOINT) > -1);

        // to prevent http intercept of config service
        isAPIMRequest = (url.startsWith(this.APIM_HOST_URI));
        if (isAPIMRequest && !isOAuthCall) {
            request = this.setAPIMHeader(request);
        }


        isLocalAPIRequest = (url.startsWith(this.LOCAL_HOST_URI));
        if (isLocalAPIRequest) {
            if (!isLocalAuthCall) {
                request = this.setLocalAPIHeader(request);
            }
        }

        if ((isAPIMRequest || isLocalAPIRequest) && (!isOAuthCall && !isLocalAuthCall)) {
            this.loaderService.show();
            this.requests.push(request);
        }

        // Note: don't delete for debugging purposes only
        // console.log("No of requests--->" + this.requests.length);

        return new Observable(observer => {
            const subscription = next.handle(request)
                .subscribe(
                    event => {
                        if (event instanceof HttpResponse) {
                            this.removeRequest(request);
                            observer.next(event);
                        }
                    },
                    err => {
                        retry(1);
                        // Note: don't delete for debugging purposes only
                        // console.error('error: ', err);
                        if ((isAPIMRequest || isLocalAPIRequest) && (!isOAuthCall && !isLocalAuthCall)) {
                            this.removeRequest(request);
                        }

                        if (environment.state !== ConfigState.DEV) {
                            setTimeout(() => {
                                console.clear();
                            }, 2000);
                        }

                        if ((err.status === 401) && (isAPIMRequest) && (!isOAuthCall)) {
                            return from(this.refreshAPIMAccessToken(request, next));
                        } else if ((err.status === 401) && (isLocalAPIRequest) && (!isLocalAuthCall)) {
                            return from(this.refreshLocalAPIToken(request, next));
                        } else if (this.rateQuoteUrl !== request.url) {
                            this.notif.showHTTPErrorAlertMessage(err, isAPIMRequest, isLocalAPIRequest);
                        }

                        observer.error(err);
                    },
                    () => {
                        this.removeRequest(request);
                        observer.complete();
                    }
                );

            return () => {
                this.removeRequest(request);
                subscription.unsubscribe();
            };
        });
    }

    /**
     * This method modifies the request being passed by adding
     * common headers to all APIM request
     * @param request - current request
     */
    setAPIMHeader(request: HttpRequest<any>) {
        if (this.browserService.isbrowser) {
            const tokenObj = JSON.parse(sessionStorage.getItem(OAuthEnum.STORE_KEY));

            if (tokenObj) {
                const urlPath = new URL(request.url);
                if (HttpInterceptorResource.isSkippedXlocale(urlPath.pathname)) {
                    request = request.clone({
                        headers: request.headers
                            .set(OAuthEnum.HEADER_AUTHORIZATION, `Bearer ${atob(tokenObj.token)}`)
                    });
                } else {
                    request = request.clone({
                        headers: request.headers
                            .set(OAuthEnum.HEADER_AUTHORIZATION, `Bearer ${atob(tokenObj.token)}`)
                            .set(HttpHeaderKey.X_LOCALE, CountryLocale.getAPIHeaderLocale())
                    });
                }

            }
            return request;
        }
    }

    /**
     * This method modifies the request being passed by adding
     * common header(s) to all Local API request
     * @param request - current request
     */
    setLocalAPIHeader(request: HttpRequest<any>) {
        if (this.browserService.isbrowser) {
            const authToken = atob(sessionStorage.getItem(OAuthEnum.LOCAL_STORE_KEY));
            const urlPath = new URL(request.url);
            const txId = sessionStorage.getItem(HttpHeaderKey.TX_ID);
            const facebookToken = sessionStorage.getItem(HttpHeaderKey.FACEBOOK_TOKEN);
            const googleToken = sessionStorage.getItem(HttpHeaderKey.GOOGLE_TOKEN);
            const bearerStr = HttpHeaderKey.BEARER + ' ';

            if (HttpInterceptorResource.isSecureLocalApiEndpointWithUid(urlPath.pathname)) {
                // NOTE: users should be logged in at this point else uid won't be available 
                this.getUserProfileDetails();
                request = request.clone({
                    headers: request.headers
                        .set(HttpHeaderKey.UID, (this.userId).toString())
                });
            }

            if (HttpInterceptorResource.isSecureLocalApiEndpoint(urlPath.pathname)) {
                // NOTE: users should be logged in at this point else sessionStorage txId won't be available 
                request = request.clone({
                    headers: request.headers
                        .set(HttpHeaderKey.ACCEPT_LANGUAGE, CountryLocale.getAPIHeaderLocale())
                        .set(OAuthEnum.HEADER_AUTHORIZATION, authToken)
                });
                if (txId) {
                    request = request.clone({
                        headers: request.headers
                            .set(OAuthEnum.HEADER_AUTHORIZATION, bearerStr + txId)
                            .set(HttpHeaderKey.UID_TYPE, AccountType.OTP)
                    });
                }

                if (facebookToken) {
                    request = request.clone({
                        headers: request.headers
                            .set(OAuthEnum.HEADER_AUTHORIZATION, bearerStr + facebookToken)
                            .set(HttpHeaderKey.UID_TYPE, AccountType.FACEBOOK)
                    });
                }

                if (googleToken) {
                    request = request.clone({
                        headers: request.headers
                            .set(OAuthEnum.HEADER_AUTHORIZATION, bearerStr + googleToken)
                            .set(HttpHeaderKey.UID_TYPE, AccountType.GOOGLE)
                    });
                }
            } else {
                request = request.clone({
                    headers: request.headers
                        .set(HttpHeaderKey.ACCEPT_LANGUAGE, CountryLocale.getAPIHeaderLocale())
                        .set(OAuthEnum.HEADER_AUTHORIZATION, authToken)
                });
            }

            return request;
        }
    }

    /**
     * This method calls for token access via interceptor
     * @param req - current request
     * @param next - request handler
     */
    refreshAPIMAccessToken(req: HttpRequest<any>, next: HttpHandler) {
        const authService = this.injector.get(AuthenticationService);
        return authService.getOAuthToken().pipe(
            switchMap(userData => {
                authService.saveToken(userData);
                const newRequest = this.setAPIMHeader(req);
                return next.handle(newRequest).toPromise();
            })
        );
    }

    /**
     * This method calls for authentication token via interceptor
     * @param req - current request
     * @param next - request handler
     */
    refreshLocalAPIToken(req: HttpRequest<any>, next: HttpHandler) {
        const localAuthService = this.injector.get(LocalAuthenticationService);
        return localAuthService.getAuthenticationToken().pipe(
            switchMap(userData => {
                localAuthService.storeToken(userData);
                const newRequest = this.setLocalAPIHeader(req);
                return next.handle(newRequest).toPromise();
            })
        );
    }

    getUserProfileDetails() {
        this.appStore.pipe(select(fromShippingSelector.selectUserLoginDetails))
            .subscribe((userloginDetails: IUser) => {
                if (userloginDetails) {
                    this.userId = userloginDetails.userId;
                }
            });
    }
}

/**
 * Declaration of Global http Interceptor provider constants
 */
export const globalInterceptorProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: isMock ? GlobalHttpMockInterceptor : GlobalHttpInterceptor,
    multi: true
};
