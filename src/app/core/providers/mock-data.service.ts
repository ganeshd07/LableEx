import { Injectable } from '@angular/core';
import { HttpRequest } from '@angular/common/http';
import { OAuthEnum } from '../../types/enum/oauth-enum.enum';
import { Endpoint } from '../../interfaces/mock-data/endpoint.interface';
import { ConfigService } from '@ngx-config/core';


/**
 * This is a mock data service used for mapping APIM endpoint responses
 * It maps responses for every mock http calls
 * 
 * Author: Roan Villaflores
 * Date Created: Apr 21, 2020 
 */

@Injectable()
export class MockDataService {
  protected APIM_HOST_URI = '';
  protected LOCAL_HOST_URI = '';
  mockDataResponse = null;

  constructor(
    private config: ConfigService
  ) {
    this.APIM_HOST_URI = this.config.getSettings('APIM').HOST;
    this.LOCAL_HOST_URI = this.config.getSettings('LOCAL').HOST;
    import('../../types/constants/mock-data-response.constants').then(response => {
      this.mockDataResponse = response.mockDataResponse;
    });
  }

  /**
   * Retrieves mock response for request url during mock http interception 
   * Refer to "mock-data-response.constants.ts" for actual object returned.
   * 
   * @param request - http request
   */
  public getMockApiResponse(request: HttpRequest<any>): Endpoint {
    const { url, method, headers, body } = request;

    let isConfigUtilityLoaded: boolean = (url.indexOf('assets/config') > -1);
    if (!isConfigUtilityLoaded) { // to prevent http intercept of config service
      let isAPIMRequest: boolean = (url.startsWith(this.APIM_HOST_URI));
      let isLocalRequest: boolean = (url.startsWith(this.LOCAL_HOST_URI));
      let isOAuthCall: boolean = (url.indexOf(OAuthEnum.ENDPOINT_KEY) > 0);
      let apiUrlObject = this.getApiURLEndpoints(url);
      if (!isOAuthCall && (isAPIMRequest || isLocalRequest)) {
        let mappedMockResponseObj = this.mockDataResponse?.getAllMockApiResponses()
          .find(api => api.islandRoute === apiUrlObject.islandRoute).islandVersionList
          .find(ver => ver.versionRoute === apiUrlObject.versionRoute).endpointGroupList
          .find(routeList => routeList.groupRoute === apiUrlObject.groupRoute).endpointList
          .find(route => (apiUrlObject.route.length === 0) ?
            route.route === '/' && route.method === method && route.queryParams === apiUrlObject.queryParams
            : route.route === apiUrlObject.route && route.method === method && route.queryParams === apiUrlObject.queryParams);
        return mappedMockResponseObj;
      }
    }

    return null;
  }

  /**
   * Breaks http request url and returns url composition 
   * into an object for comparison purposes.
   * 
   * @param url - full url request
   */
  private getApiURLEndpoints(url: string) {
    let urlPart = url.split('/');
    let urlParams = (this.hasQueryParams(urlPart[urlPart.length - 1])) ? url.split('?')[1] : null;
    let routeGrp = urlPart[5];
    let routeEndpts = '';
    let endpointGrpList = [];

    if (!this.hasQueryParams(urlPart[5])) {
      if (urlPart.length > 6) {
        for (let i = 0; i < urlPart.length; i++) {
          if (i > 5) {
            let endpoint = (this.hasQueryParams(urlPart[i])) ? urlPart[i].split('?')[0] : urlPart[i];
            endpointGrpList.push(endpoint);
          }
        }
        routeEndpts = '/'.concat(endpointGrpList.join('/'));
      }
    } else {
      routeGrp = urlPart[5].split('?')[0];
    }

    return {
      islandRoute: urlPart[3], // islandRoute
      versionRoute: urlPart[4], // versionRoute
      groupRoute: routeGrp, // groupRoute
      route: routeEndpts, // route from endpointList 
      queryParams: (urlParams) ? urlParams : '' //queryParams
    };
  }

  /**
   * Verifies if the endmost route has query strings
   * @param endpoint - endpoint route from url request
   */
  private hasQueryParams(endpoint: string) {
    return (endpoint && endpoint.indexOf('?')) > -1;
  }
}
