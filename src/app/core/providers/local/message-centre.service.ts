import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Util } from '../../../providers/util.service';
import { Observable } from 'rxjs';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { tap } from 'rxjs/operators';
import { ConfigService } from '@ngx-config/core';
import { MessageCentreResponse } from 'src/app/interfaces/api-service/response/message-centre-response.interface';

@Injectable()
export class MessageCentreService {
    private messageCentreAPI = '';

    constructor(private httpClient: HttpClient,
                private config: ConfigService,
                private util: Util) {
        const API_ISLAND = this.config.getSettings('LOCAL').API_ISLAND;
        this.messageCentreAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, API_ISLAND.messageCentre);
    }

    getMessageCentreList(countryCode: string, language: string): Observable<MessageCentreResponse[]> {
        const resourceUrl: string = this.messageCentreAPI.concat(`?countryCode=${countryCode}`);
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<MessageCentreResponse[]>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }
}
