import { Injectable } from '@angular/core';
import { LogoutRequestConstants } from '../../../types/constants/logout-request.constants';
import { Util } from '../../util.service';
import { DatePipe } from '@angular/common';
import { LogoutParams } from 'src/app/interfaces/logout-params';
import { LogoutRequest } from 'src/app/interfaces/api-service/request/logout-request';
import { ProcessingParameters } from 'src/app/interfaces/api-service/request/processing-parameters';

/**
 * This class contains all data mappers of User APIM Services
 * 
 * Author: Carlo Oseo
 * Date Created: June 11, 2020 
 */
@Injectable({
    providedIn: 'root'
})
export class APIMUserDataMapper {

    constructor(private util: Util, private datePipe: DatePipe) { }

    /**
     * Mapper for POST Login Request
     * 
     * @param username - Login ID
     * @param password  - Password
     */
    public mapLoginRequest(username: string, password: string) {
        let loginParams;
        loginParams.userName = username;
        loginParams.password = password;

        let requestBody = this.util.toJSON(loginParams);
        return JSON.stringify(requestBody);
    }

    /**
     * Mapper for Logout Request
     */
    public mapLogoutRequest() {
        let logoutParams: LogoutParams;
        let logoutRequest: LogoutRequest;
        let _processingParameters: ProcessingParameters = {
            anonymousTransaction: LogoutRequestConstants.ANONYMOUS_TRANSACTION,
            clientId: LogoutRequestConstants.CLIENT_ID,
            clientVersion: LogoutRequestConstants.CLIENT_VERSION,
            returnDetailedErrors: LogoutRequestConstants.RETURN_DETAILED_ERRORS,
            returnLocalizedDateTime: LogoutRequestConstants.RETURN_LOCALIZED_DATETIME,
            debug: undefined
        };

        logoutRequest = {
            processingParameters: _processingParameters
        };

        logoutParams = {
            LogOutRequest: logoutRequest
        };

        let requestBody = this.util.toJSON(logoutParams);
        return JSON.stringify(requestBody);
    }
}
