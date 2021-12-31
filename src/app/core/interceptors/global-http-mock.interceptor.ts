import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { MockDataService } from '../providers/mock-data.service';
import { Endpoint } from '../../interfaces/mock-data/endpoint.interface';
import { mergeMap, materialize, delay, dematerialize, tap } from 'rxjs/operators';

/**
 * This is a mock http interceptor for APIM endpoints
 * It provides mock data response for each service calls
 * 
 * Author: Roan Villaflores
 * Date Created: Apr 7, 2020 
 */

@Injectable()
export class GlobalHttpMockInterceptor implements HttpInterceptor {

    constructor(
        private mockDataService: MockDataService
    ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (request.url.endsWith('.json')) {
            return next.handle(request).pipe(tap((event: HttpEvent<any>) => { return }));
        }

        let mappedEndpointObj: Endpoint = this.mockDataService.getMockApiResponse(request);

        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown (https://github.com/Reactive-Extensions/RxJS/issues/648)
            .pipe(delay(1000)) // delaying response to 1s per call intercept
            .pipe(dematerialize());

        /**
         * handles mapped response from mock data service
         * If No mapped response, request shall be handled without any request interruption.
         * If WITH mapped response, request shall be handled accordingly based response status.
         */
        function handleRoute() {
            if (!mappedEndpointObj) {
                return next.handle(request);
            } else {
                if (mappedEndpointObj.status === 200) {
                    return success(mappedEndpointObj.response);
                } else if (mappedEndpointObj.status === 400) {
                    return error400(mappedEndpointObj.response);
                } else {
                    return unknownError();
                }
            }
        }

        /**
         * Simulates http 200 status response. 
         * @param body - mock response object
         */
        function success(body?) {
            return of(new HttpResponse({ status: 200, body: (body as any).default }));
        }

        /**
         * Simulates http status 400 response.
         * @param body - mock response object
         */
        function error400(body?) {
            return throwError({ status: 400, error: (body as any) });
        }

        /**
         * Simulates error response for unknown http status.
         */
        function unknownError() {
            return throwError({ error: 'Unknown status. No specified response status.' });
        }
    }
}