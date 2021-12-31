import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Util } from '../../../providers/util.service';
import { Observable } from 'rxjs';
import { HttpContentType } from '../../../types/enum/http-content-type.enum';
import { tap } from 'rxjs/operators';
import { ConfigService } from '@ngx-config/core';
import { IAddressDataList } from '../../../interfaces/mock-data/address-data-list.interface';
import { AddressTypes } from 'src/app/types/enum/address-type.enum';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { PartyListResponse } from 'src/app/interfaces/api-service/response/party-list-response';
import { AddressBookPartyResponse } from 'src/app/interfaces/api-service/response/address-book-party-response';
import { ShipmentTypesConstants } from 'src/app/types/constants/shipment-types.constants';
import { PartyAddressRequestMapper } from 'src/app/providers/mapper/local/party-address-request-mapper.service';
import { ISender } from 'src/app/interfaces/shipping-app/sender';

@Injectable()
export class LocalAddressService {
    private addressBookPartyAPI = '';
    private partyListAPI = '';
    private recipientAPI = '';
    private shipmentListDetailsAPI = '';
    private postPartyAddressAPI = '';
    private updatePartyAddressAPI = '';

    constructor(private httpClient: HttpClient,
        private config: ConfigService,
        private partyAddressMapperService: PartyAddressRequestMapper,
        private util: Util) {
        let API_ISLAND = this.config.getSettings('LOCAL').API_ISLAND;
        let ADDRESS_LOCAL_ISLAND_API = this.config.getSettings('LOCAL').ADDRESS_LOCAL_ISLAND_API;
        this.addressBookPartyAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, API_ISLAND.addressBookParty);
        this.partyListAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, ADDRESS_LOCAL_ISLAND_API.partyList);
        this.recipientAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, API_ISLAND.recipientListDetails);
        this.shipmentListDetailsAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, API_ISLAND.shipmentsListDetails);
        this.postPartyAddressAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, API_ISLAND.postPartyAddressDetails);
        this.updatePartyAddressAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, API_ISLAND.updatePartyAddressDetails);
    }

    getAddressBookPartyByContactId(contactId: string): Observable<GenericResponse<AddressBookPartyResponse>> {
        const resourceUrl: string = this.addressBookPartyAPI.concat(`/${contactId}`);
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<AddressBookPartyResponse>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    getPartyListByAddressType(addressType: string): Observable<GenericResponse<PartyListResponse>> {
        const resourceUrl: string = this.partyListAPI.concat(`?addresstype=${addressType}`);
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<GenericResponse<PartyListResponse>>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }
    /* this method added for getting recipient address US */
    getRecipientList(uid: string, addressType: AddressTypes): Observable<IAddressDataList> {
        const resourceUrl: string = this.recipientAPI.concat(`?uid=${uid}&addressType=${addressType}`);
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<IAddressDataList>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    /* This method added for getting Shipments list of Particular user */
    getShipmentsListDetails(uid: string, status: ShipmentTypesConstants): Observable<any> {
        const resourceUrl: string = this.shipmentListDetailsAPI.concat(`?uid=${uid}&status=${status}`);
        let httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);

        return this.httpClient.get<any>(resourceUrl, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    /* This method added for sending address details of Particular user */
    postPartyAddressDetails(addressDetails: ISender, addresstype: AddressTypes, userId: string): Observable<any> {
        const resourceUrl: string = this.postPartyAddressAPI;
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);
        const requestBody = this.partyAddressMapperService.getMappedPartyAddressForPost(addressDetails, addresstype, userId);

        return this.httpClient.post<GenericResponse<any>>(resourceUrl, requestBody, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }

    /* This method added for updating address details of Particular user */
    updatePartyAddressDetails(addressDetails: ISender, partyId: string, userId: string): Observable<any> {
        const resourceUrl: string = this.updatePartyAddressAPI;
        const httpHeaders = this.util.getHttpRequestHeaders(HttpContentType.APPLICATION_JSON, []);
        const requestBody = this.partyAddressMapperService.getMappedPartyAddressForUpdate(addressDetails, partyId, userId);

        return this.httpClient.put<GenericResponse<any>>(resourceUrl, requestBody, httpHeaders).pipe(
            tap(response => {
                if (response instanceof HttpErrorResponse) {
                    return response.error;
                }
            })
        );
    }
}
