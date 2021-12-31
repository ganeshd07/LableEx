import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Util } from '../../../providers/util.service';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { APIMUserDataMapper } from '../../../providers/mapper/apim/user-data-mapper.service';
import { ConfigService } from '@ngx-config/core';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { UserProfile } from 'src/app/interfaces/api-service/response/user-profile';
import { LogoutResponse } from 'src/app/interfaces/api-service/response/logout-response';
import { UserLoggedIn } from 'src/app/interfaces/api-service/response/user-logged-in';

/**
 * This class contains all endpoints of User APIM Services
 * 
 * Author: Carlo Oseo & Marlon Micael Cuevas
 * Date Created: Apr 22, 2020 
 */
@Injectable()
export class APIMUserService {
    private loginAPI = '';
    private logoutAPI = '';

    constructor(private httpClient: HttpClient,
        private readonly config: ConfigService,
        private datamapper: APIMUserDataMapper,
        private util: Util) {
        let USER_API = this.config.getSettings('APIM').USER_ISLAND_API;
        this.loginAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, USER_API.login);
        this.logoutAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, USER_API.logout);
    }

    /**
     * This method validates the login status of the user
     */
    validateLoginStatus(): Observable<GenericResponse<UserLoggedIn>> {
        const resourceUrl: string = this.loginAPI;
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<UserLoggedIn>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    /**
     * This method logs the user into the FedEx network based on username and password
     * 
     * @param username 
     * @param password 
     */
    loginUser(username: string, password: string): Observable<GenericResponse<UserProfile>> {
        const resourceUrl: string = this.loginAPI;
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);
        let requestBody = this.datamapper.mapLoginRequest(username, password);

        return this.httpClient.post<GenericResponse<UserProfile>>(resourceUrl, requestBody, httpHeaders).
            pipe(
                tap(response => {
                    if (response instanceof HttpErrorResponse) {
                        return response.error;
                    }
                })
            );
    }

    /**
     * This method logs out the user from FedEx network
     */
    logoutUser(): Observable<GenericResponse<LogoutResponse>> {
        const resourceUrl: string = this.logoutAPI;
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);
        let requestBody = this.datamapper.mapLogoutRequest();

        return this.httpClient.put<GenericResponse<LogoutResponse>>(resourceUrl, requestBody, httpHeaders).
            pipe(
                tap(response => {
                    if (response instanceof HttpErrorResponse) {
                        return response.error;
                    }
                })
            );
    }
}
