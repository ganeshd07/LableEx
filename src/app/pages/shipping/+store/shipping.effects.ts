import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, exhaustMap, switchMap } from 'rxjs/operators';
import { APIMCountryService, APIMShipmentService, APIMGlobalTradeService } from 'src/app/core/providers/apim';
import { CreateShipmentService, ShipmentFeedbackService, CurrencyUomComConfigurationService, LocalCommodityService, LocalRatesService, LocalAddressService } from 'src/app/core/providers/local';
import * as shippingActions from './shipping.actions';
import { CountryDialingPrefixesResponse } from 'src/app/interfaces/api-service/response/country-dialing-prefixes-response.interface';
import { CityListResponse } from 'src/app/interfaces/api-service/response/city-list-response.interface';
import { CountryDetailResponse } from 'src/app/interfaces/api-service/response/country-detail-response.interface';
import { CurrenciesResponse } from 'src/app/interfaces/api-service/response/currencies-response';
import { GenericResponse } from 'src/app/interfaces/api-service/response/generic-response';
import { CurrencyConfigurationResponse } from 'src/app/interfaces/api-service/response/currency-configuration-response';
import { APIMCommodityService } from 'src/app/core/providers/apim';
import { CommodityManufactureResponse } from 'src/app/interfaces/api-service/response/commodity-manufacture-response.interface';
import { SenderRecipientInfoResponse } from 'src/app/interfaces/api-service/response/sender-recipient-info-response';
import { SystemCommodityResponse } from 'src/app/interfaces/api-service/response/system-commodity-list-response';
import { CreateShipmentResponse } from 'src/app/interfaces/api-service/response/create-shipment-response';
import { ShipmentFeedbackResponse } from 'src/app/interfaces/api-service/response/shipment-feedback-response';
import { ApiResponse } from 'src/app/interfaces/api-service/response/api-response';
import { IAddressDataList } from 'src/app/interfaces/mock-data/address-data-list.interface';
import { KeyTextList } from 'src/app/interfaces/api-service/common/key-text-list';
import { CountryListResponse } from 'src/app/interfaces/api-service/response/country-list-response';
import { Country } from 'src/app/interfaces/api-service/response/country';

@Injectable()
export class ShippingEffects {

    constructor(
        private actions$: Actions,
        private apimCountryService: APIMCountryService,
        private aPIMGlobalTradeService: APIMGlobalTradeService,
        private apimShipmentService: APIMShipmentService,
        private currencyUomComConfigurationService: CurrencyUomComConfigurationService,
        private localCommodityService: LocalCommodityService,
        private apimCommodityService: APIMCommodityService,
        private createShipmentService: CreateShipmentService,
        private shipmentFeedbackService: ShipmentFeedbackService,
        private localRatesService: LocalRatesService,
        private localAddressService: LocalAddressService
    ) { }

    loadSenderCountries$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getSenderCountriesBegin),
            mergeMap((payload: any) => this.apimCountryService.getCountryListByType(payload.countryType)
                .pipe(
                    map((response: GenericResponse<CountryListResponse<Country>>) =>
                        shippingActions.getSenderCountriesSuccess({ data: response.output.countries })),
                    catchError((error: any) => of(shippingActions.getSenderCountriesFailure({ error: error })))
                )
            )
        )
    );

    loadRecipientCountries$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getRecipientCountriesBegin),
            mergeMap((payload: any) => this.apimCountryService.getCountryListByType(payload.countryType)
                .pipe(
                    map((response: GenericResponse<CountryListResponse<Country>>) =>
                        shippingActions.getRecipientCountriesSuccess({ data: response.output.countries }),
                        catchError(error => of({ type: shippingActions.getRecipientCountriesFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadRecipientSelectedCountryDetails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getSelectedRecipientCountryDetailsBegin),
            mergeMap((payload: any) => this.apimCountryService.getCountryDetailsByCountryCode(payload.countryCode)
                .pipe(
                    map((response: GenericResponse<CountryDetailResponse>) =>
                        shippingActions.getSelectedRecipientCountryDetailsSuccess({ data: response.output }),
                        catchError(error => of({ type: shippingActions.getSelectedRecipientCountryDetailsFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadRecipientCityList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getRecipientCityListBegin),
            switchMap((payload: any) => this.apimCountryService.getCitiesByCountryCodeAndPostalCode(payload.countryCode, payload.postalCode)
                .pipe(
                    map((response: GenericResponse<CityListResponse>) =>
                        shippingActions.getRecipientCityListSuccess({ data: response.output }),
                        catchError(error => of({ type: shippingActions.getRecipientCityListFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadSenderDetails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getSelectedSenderCountryDetailsBegin),
            mergeMap((payload: any) => this.apimCountryService.getCountryDetailsByCountryCode(payload.countryCode)
                .pipe(
                    map((response: GenericResponse<CountryDetailResponse>) =>
                        shippingActions.getSelectedSenderCountryDetailsSuccess({ data: response.output }),
                        catchError(error => of({ type: shippingActions.getSelectedSenderCountryDetailsFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadCitiesList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getSenderCityListBegin),
            switchMap((payload: any) => this.apimCountryService.getCitiesByCountryCodeAndPostalCode(payload.countryCode, payload.postalCode)
                .pipe(
                    map((response: GenericResponse<CityListResponse>) =>
                        shippingActions.getSenderCityListSuccess({ data: response.output.matchedAddresses }),
                        catchError(error => of({ type: shippingActions.getSenderCityListFailure, error }))
                    )
                )
            )
        )
    );

    loadCountryDialingPrefixes$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getCountryDialingPrefixesBegin),
            mergeMap(() => this.apimCountryService.getCountryDialingPrefixes()
                .pipe(
                    map((response: GenericResponse<CountryDialingPrefixesResponse>) =>
                        shippingActions.getCountryDialingPrefixesSuccess({ data: response.output }),
                        catchError(error => of({ type: shippingActions.getCountryDialingPrefixesFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadCurrencyListUSApi$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getCurrencyListUSApiBegin),
            mergeMap(() => this.aPIMGlobalTradeService.getCurrencies()
                .pipe(
                    map((response: GenericResponse<CurrenciesResponse>) =>
                        shippingActions.getCurrencyListUSApiSuccess({ data: response.output.currencies }),
                        catchError(error => of({ type: shippingActions.getCurrencyListUSApiFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadCurrencyListLocalApi$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getCurrencyListLocalApiBegin),
            mergeMap((payload: any) => this.currencyUomComConfigurationService.getConfigurationAsPerCountryCodeAndType(
                payload.countryCode, payload.configType)
                .pipe(
                    map((response: GenericResponse<CurrencyConfigurationResponse>) =>
                        shippingActions.getCurrencyListLocalApiSuccess({ data: response }),
                        catchError(error => of({ type: shippingActions.getCurrencyListLocalApiFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadShipmentPurpose$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getShipmentPurposeBegin),
            mergeMap((payload: any) => this.apimShipmentService.getShipmentPurposeByCountryCodesAndServiceType(
                payload.senderCountryCode, payload.recipientCountryCode, payload.serviceType)
                .pipe(
                    map((response: GenericResponse<KeyTextList>) =>
                        shippingActions.getShipmentPurposeSuccess({ shipmentPurposeList: response.output.keyTexts }),
                        catchError(error => of({ type: shippingActions.getShipmentPurposeFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadSenderRecipientInfo$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getSenderRecipientInfoBegin),
            mergeMap((payload: any) => this.apimCountryService.getSenderRecipientInfoByCountryCodes(
                payload.senderCountryCode, payload.recipientCountryCode)
                .pipe(
                    map((response: GenericResponse<SenderRecipientInfoResponse>) =>
                        shippingActions.getSenderRecipientInfoSuccess({ senderRecipientInfo: response.output }),
                        catchError(error => of({ type: shippingActions.getSenderRecipientInfoFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadDocumentDescriptions$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getDocumentDescriptionsBegin),
            mergeMap((payload: any) => this.apimShipmentService.getDocumentDescriptionByCountryCodes(
                payload.senderCountryCode, payload.recipientCountryCode, payload.setAdvanced)
                .pipe(
                    map((response: GenericResponse<KeyTextList>) =>
                        shippingActions.getDocumentDescriptionsSuccess({ documentDescriptions: response.output }),
                        catchError(error => of({ type: shippingActions.getDocumentDescriptionsFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadCountryOfManufactureListLocalApi$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getCountryOfManufactureLocalApiBegin),
            mergeMap((payload: any) => this.localCommodityService.getCountryOfManufactureByCountryCodeAndType(
                payload.countryCode, payload.configType)
                .pipe(
                    map((response: GenericResponse<CommodityManufactureResponse>) =>
                        shippingActions.getCountryOfManufactureLocalApiSuccess({ data: response }),
                        catchError(error => of({ type: shippingActions.getCountryOfManufactureLocalApiFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadCountryOfManufactureListUSApim$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getCountryOfManufactureUSApimBegin),
            mergeMap((payload: any) => this.apimCountryService.getCommodityManufacture(payload.countryType)
                .pipe(
                    map((response: GenericResponse<CommodityManufactureResponse>) =>
                        shippingActions.getCountryOfManufactureUSApimSuccess({ data: response }),
                        catchError(error => of({ type: shippingActions.getCountryOfManufactureUApimFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadUomListLocalApi$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getUomListLocalApiBegin),
            mergeMap((payload: any) => this.currencyUomComConfigurationService.getConfigurationAsPerCountryCodeAndType(payload.countryCode, payload.configType)
                .pipe(
                    map((response: GenericResponse<CurrencyConfigurationResponse>) =>
                        shippingActions.getUomListLocalApiSuccess({ data: response }),
                        catchError(error => of({ type: shippingActions.getUomListLocalApiFailure, error: error })
                        )
                    )
                )
            )
        )
    );

    loadUnitOfMeasureUSApim$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getUomListUSApiBegin),
            mergeMap(() => this.apimCommodityService.fetchUnitOfMeasures()
                .pipe(
                    map((response: GenericResponse<KeyTextList>) =>
                        shippingActions.getUomListUSApiSuccess({ data: response.output }),
                        catchError(error => of({ type: shippingActions.getUomListUSApiFailure, error: error })
                        )
                    )
                )
            )
        )
    );

    postCreateShipment$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.postCreateShipmentBegin),
            mergeMap((payload: any) => this.createShipmentService.postCreateShipment(payload.shipmentDetails)
                .pipe(
                    map((response: GenericResponse<CreateShipmentResponse>) =>
                        shippingActions.postCreateShipmentSuccess({ data: response })),
                    catchError((error: any) => of(shippingActions.postCreateShipmentFailure({ error: error })))
                )
            )
        )
    );

    postShipmentFeedback$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.postShipmentFeedbackBegin),
            mergeMap((payload: any) => this.shipmentFeedbackService.postShipmentFeedback(payload.shipmentId, payload.score, payload.comment)
                .pipe(
                    map((response: GenericResponse<ShipmentFeedbackResponse>) =>
                        shippingActions.postShipmentFeedbackSuccess({ data: response })),
                    catchError((error: any) => of(shippingActions.postShipmentFeedbackFailure({ error: error })))
                )
            )
        )
    );

    getSystemCommodityList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getSystemCommodityListBegin),
            mergeMap((payload: any) => this.localCommodityService.getSystemCommodityListByCategory(payload.category)
                .pipe(
                    map((response: GenericResponse<SystemCommodityResponse>) =>
                        shippingActions.getSystemCommodityListSuccess({ data: response }),
                        catchError(error => of({ type: shippingActions.getSystemCommodityListFailure, error })
                        )
                    )
                )
            )
        )
    );

    getUserCommodityList$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getUserCommodityListBegin),
            mergeMap((payload: any) => this.localCommodityService.getUserCommodityListByCategory(payload.uid, payload.category)
                .pipe(
                    map((response: GenericResponse<SystemCommodityResponse>) =>
                        shippingActions.getUserCommodityListSuccess({ data: response }),
                        catchError(error => of({ type: shippingActions.getUserCommodityListFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadRatesDiscountryByCountry$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getRatesDiscountByCountryBegin),
            exhaustMap((payload: any) => this.localRatesService.getRatesDiscountByCountry(payload.countryCode)
                .pipe(
                    map((response: ApiResponse) =>
                        shippingActions.getRatesDiscountByCountrySuccess({ data: response }),
                        catchError(error => of({ type: shippingActions.getRatesDiscountByCountryFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadDefaultSenderDetails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getDefaultSenderDetailsBegin),
            mergeMap((payload: any) => this.localAddressService.getRecipientList(payload.uid, payload.addressType)
                .pipe(
                    map((response: IAddressDataList) =>
                        shippingActions.getDefaultSenderDetailsSuccess({ data: response }),
                        catchError(error => of({ type: shippingActions.getDefaultSenderDetailsFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadRecipientListDetails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getRecipientListDetailsBegin),
            mergeMap((payload: any) => this.localAddressService.getRecipientList(payload.uid, payload.addressType)
                .pipe(
                    map((response: IAddressDataList) =>
                        shippingActions.getRecipientListDetailsSuccess({ data: response }),
                        catchError(error => of({ type: shippingActions.getRecipientListDetailsFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadPendingShipmentDetails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getPendingShipmentDetailsBegin),
            mergeMap((payload: any) => this.localAddressService.getShipmentsListDetails(payload.uid, payload.status)
                .pipe(
                    map((response: any) =>
                        shippingActions.getPendingShipmentDetailsSuccess({ data: response }),
                        catchError(error => of({ type: shippingActions.getPendingShipmentDetailsFailure, error })
                        )
                    )
                )
            )
        )
    );

    loadConfirmedShipmentDetails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.getConfirmedShipmentDetailsBegin),
            mergeMap((payload: any) => this.localAddressService.getShipmentsListDetails(payload.uid, payload.status)
                .pipe(
                    map((response: any) =>
                        shippingActions.getConfirmedShipmentDetailsSuccess({ data: response }),
                        catchError(error => of({ type: shippingActions.getConfirmedShipmentDetailsFailure, error })
                        )
                    )
                )
            )
        )
    );

    postSenderAddressDetails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.postSenderAddressDetailsBegin),
            mergeMap((payload: any) => this.localAddressService.postPartyAddressDetails(payload.senderAddressDetails, payload.addressType, payload.userId)
                .pipe(
                    map((response: any) =>
                        shippingActions.postSenderAddressDetailsSuccess({ partyId: response.partyId }),
                        catchError(error => of({ type: shippingActions.postSenderAddressDetailsFailure, error })
                        )
                    )
                )
            )
        )
    );

    updateSenderAddressDetails$ = createEffect(() =>
        this.actions$.pipe(
            ofType(shippingActions.updateSenderAddressDetailsBegin),
            mergeMap((payload: any) => this.localAddressService.updatePartyAddressDetails(payload.senderAddressDetails, payload.partyId, payload.userId)
                .pipe(
                    map((response: any) =>
                        shippingActions.updateSenderAddressDetailsSuccess({ partyId: response.partyId }),
                        catchError(error => of({ type: shippingActions.updateSenderAddressDetailsFailure, error })
                        )
                    )
                )
            )
        )
    );
}