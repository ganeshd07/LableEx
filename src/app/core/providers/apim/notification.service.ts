import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Util } from '../../../providers/util.service';
import { Observable } from 'rxjs';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { tap } from 'rxjs/operators';
import { NotificationType } from '../../../types/enum/notification-type.enum';
import { ConfigService } from '@ngx-config/core';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { KeyTextList } from 'src/app/interfaces/api-service/common/key-text-list';

/**
 * This class contains all endpoints of Notification APIM Services
 * 
 * Author: Carlo Oseo
 * Date Created: Apr 22, 2020 
 */
@Injectable()
export class APIMNotificationService {
    private emailLanguagesAPI = '';

    constructor(private httpClient: HttpClient,
        private readonly config: ConfigService,
        private util: Util) {
        let NOTIFICATION_API = this.config.getSettings('APIM').NOTIFICATION_ISLAND_API;
        this.emailLanguagesAPI = this.util.joinStrings('', this.config.getSettings('APIM').HOST, NOTIFICATION_API.emailLanguages);
    }

    /**
     * This method returns language keyword per each country along with their display text
     */
    getEmailLanguages(): Observable<GenericResponse<KeyTextList>> {
        const resourceUrl: string = this.emailLanguagesAPI.concat(`?type=${NotificationType.EMAIL}`);
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<KeyTextList>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

}
