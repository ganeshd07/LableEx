import * as loginResponse from '../../../assets/data/loginResponse.json';
import * as userLoggedInResponse from '../../../assets/data/userLoggedInResponse.json';
import * as commodityManufacture from '../../../assets/data/commodity-manufacture.json';
import * as currencies from '../../../assets/data/currencies.json';
import * as commodityDescription from '../../../assets/data/commodity-description.json';
import * as paymentTypes from '../../../assets/data/payment-types.json';
import * as countries from '../../../assets/data/countries.json';
import * as dialingPrefixes from '../../../assets/data/country-dialing-prefixes.json';
import * as cities from '../../../assets/data/country-city-us.json';
import * as cityDetails from '../../../assets/data/country-detail-us.json';
import * as cityDetailsHK from '../../../assets/data/country-detail-hk.json';
import * as countryState from '../../../assets/data/country-states-us.json';
import * as loginError from '../../../assets/data/loginResponse.error.json';
import * as logoutResponse from '../../../assets/data/logoutResponse.json';
import * as packageTypeListResponse from '../../../assets/data/packageTypeListResponse.json';
import * as shipmentPurposeResponse from '../../../assets/data/shipmentPurposeResponse.json';
import * as rateQuoteV2 from '../../../assets/data/rate-quotes.json';
import * as rateQuoteV2WithDiscount from '../../../assets/data/rate-quotes-with-discount.json';
import * as emailLanguages from '../../../assets/data/email-languages.json';
import * as documentdescriptions from '../../../assets/data/document-description.json';
import * as senderRecipientInfo from '../../../assets/data/sender-recipient-info.json';
import * as signatureOptions from '../../../assets/data/signature-options.json';
import * as addressBookParty from '../../../assets/data/address-book-party.json';
import * as commodityDetails from '../../../assets/data/commodity-details.json';
import * as commodityNames from '../../../assets/data/commodity-names.json';
import * as partyList from '../../../assets/data/parties-list.json';
import * as commodityItemDetails from '../../../assets/data/searchCommodityItem.json';
import * as recipientListDetails from '../../../assets/data/recipient-address-book.json';
import * as currencyConversionResponse from '../../../assets/data/currency-conversion-response.json';
import * as messagelist from '../../../assets/data/message-list-hk.json';
import * as unitOfMeasures from '../../../assets/data/unit-of-measure.json';
import * as apacUomList from '../../../assets/data/unit-of-measure-apac.json';
import * as commodityManufactureHK from '../../../assets/data/commodity-manufacture-hk.json';
import * as  commodityNamesElectronics from '../../../assets/data/commodity-names-electronics.json';
import * as  commodityNamesJewellery from '../../../assets/data/commodity-names-jewellery.json';
import * as  commodityNamesGarments from '../../../assets/data/commodity-names-garments.json';
import * as  commodityNamesHealthCare from '../../../assets/data/commodity-names-health-care.json';
import * as  commodityNamesLithiumBattery from '../../../assets/data/commodity-names-lithium-battery.json';
import * as createShipment from '../../../assets/data/create-shipment.json';
import * as shipmentFeedback from '../../../assets/data/shipment-feedback.json';
import * as otpGenerateResponse from '../../../assets/data/otp-generate.json';
import * as otpValidateResponse from '../../../assets/data/otp-validate.json';
import * as userProfileResponse from '../../../assets/data/user-profile.json';
import * as discountList from '../../../assets/data/discount.json';
import * as recipientAddressList from '../../../assets/data/recipient-address-list.json';
import * as defaultSender from '../../../assets/data/default-sender.json';
import * as pendingShipmentList from '../../../assets/data/pending-shipment-list.json';
import * as confirmedShipmentList from '../../../assets/data/confirmed-shipment-list.json';
import * as addressUpdateResponse from '../../../assets/data/address-update-response.json';
import * as addressCreateResponse from '../../../assets/data/address-create-response.json';
import * as accountBillingResponse from '../../../assets/data/account-billing.json';


import { httpMethod } from '../enum/http-method.enum';
import { ApiIsland } from '../../interfaces/mock-data/api-island.interface';
import { from } from 'rxjs';

/**
 * This constant class contains all the mock responses 
 * to all the APIM calls used in this app.
 * 
 * README for DEVs:
 * All responses were organized per island, version & route group
 * If there's a new api island, please feel free to create new response map.
 * 
 * Endpoint(Object listed under endpointList array) value guide :
 * @route - endpoint's final route/path. 
 * if path ended in @groupRoute, value should be declared as '/' instead of empty string.
 * @queryParams - for url with query strings, value should NOT include the '?'.
 * @method - value should be similar to the actual http call's method.
 * @status - value should be the expected http response status. 
 * (new http response status must be mapped in the mock http interceptor)
 * @response - created mock response in JSON file
 * 
 * Author: Roan Villaflores
 * Date Created: Apr 21, 2020
 */
export class mockDataResponse {
    /**
     * [START] - For http call route: /user/...
     * All APIM @User endpoint responses should be declared here:
     */
    public static mapUserApiMockResponse(): ApiIsland {
        return {
            islandRoute: 'user',
            islandVersionList: [
                {
                    versionRoute: 'v2',
                    endpointGroupList: [
                        {
                            groupRoute: 'login',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: '',
                                    method: httpMethod.POST,
                                    status: 200,
                                    response: loginResponse,
                                },
                                {
                                    route: '/',
                                    queryParams: '',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: userLoggedInResponse,
                                },
                                {
                                    route: '/error',
                                    queryParams: '',
                                    method: httpMethod.POST,
                                    status: 400,
                                    response: loginError
                                }
                            ]
                        },
                        {
                            groupRoute: 'logout',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: '',
                                    method: httpMethod.PUT,
                                    status: 200,
                                    response: logoutResponse
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } // [END] - For http call route: /user/...


    /**
     * [START] - For http call route: /country/...
     * All APIM @Country endpoint responses are declared here:
     */
    private static mapCountryApiResponse(): ApiIsland {
        return {
            islandRoute: 'country',
            islandVersionList: [
                {
                    versionRoute: 'v2',
                    endpointGroupList: [
                        {
                            groupRoute: 'countries',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: '',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: countries,
                                },
                                {
                                    route: '/',
                                    queryParams: 'type=sender',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: countries,
                                },
                                {
                                    route: '/',
                                    queryParams: 'type=recipient',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: countries,
                                },
                                {
                                    route: '/',
                                    queryParams: 'type=manufacture',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: commodityManufacture,
                                },
                                {
                                    route: '/dialingprefixes',
                                    queryParams: '',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: dialingPrefixes,
                                },
                                {
                                    route: '/cities',
                                    queryParams: '',
                                    method: httpMethod.POST,
                                    status: 200,
                                    response: cities,
                                },
                                {
                                    route: '/US/states',
                                    queryParams: '',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: countryState,
                                }
                            ]
                        },
                        {
                            groupRoute: 'countrydetail',
                            endpointList: [
                                {
                                    route: '/US',
                                    queryParams: '',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: cityDetails,
                                },
                                {
                                    route: '/HK',
                                    queryParams: '',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: cityDetailsHK,
                                }
                            ]
                        },
                        {
                            groupRoute: 'senderrecipientinfo',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: 'sendercountrycode=HK&recipientcountrycode=US',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: senderRecipientInfo,
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } // [END] - For http call route: /country/...

    /**
     * [START] - For http call route: /availability/...
     * All APIM @Availability endpoint responses are declared here:
     */
    private static mapAvailabilityApiResponse(): ApiIsland {
        return {
            islandRoute: 'availability',
            islandVersionList: [
                {
                    versionRoute: 'v1',
                    endpointGroupList: [
                        {
                            groupRoute: 'packagetypes',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: '',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: packageTypeListResponse,
                                }
                            ]
                        },
                        {
                            groupRoute: 'packageandserviceoptions',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: '',
                                    method: httpMethod.POST,
                                    status: 200,
                                    response: packageTypeListResponse,
                                }
                            ]
                        },
                        {
                            groupRoute: 'specialserviceoptions',
                            endpointList: [
                                {
                                    route: '/signatureoptions',
                                    queryParams: '',
                                    method: httpMethod.POST,
                                    status: 200,
                                    response: signatureOptions,
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } // [END] - For http call route: /availability/...

    /**
     * [START] - For http call route: /ship/...
     * All APIM @Ship endpoint responses are declared here:
     */
    private static mapShipApiResponse(): ApiIsland {
        return {
            islandRoute: 'ship',
            islandVersionList: [
                {
                    versionRoute: 'v2',
                    endpointGroupList: [
                        {
                            groupRoute: 'shipping',
                            endpointList: [
                                {
                                    route: '/shipmentpurposes',
                                    queryParams: 'sendercountrycode=HK&recipientcountrycode=US&servicetype=INTERNATIONAL_PRIORITY',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: shipmentPurposeResponse,
                                },
                                {
                                    route: '/documentdescriptions',
                                    queryParams: 'sendercountrycode=HK&recipientcountrycode=US&setadvanced=false',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: documentdescriptions,
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } // [END] - For http call route: /ship/...

    /**
     * [START] - For http call route: /rate/...
     * All APIM @Rate endpoint responses are declared here:
     */
    private static mapRateApiResponse(): ApiIsland {
        return {
            islandRoute: 'rate',
            islandVersionList: [
                {
                    versionRoute: 'v2',
                    endpointGroupList: [
                        {
                            groupRoute: 'rates',
                            endpointList: [
                                {
                                    route: '/quotes',
                                    queryParams: '',
                                    method: httpMethod.POST,
                                    status: 200,
                                    response: rateQuoteV2WithDiscount
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } // [END] - For http call route: /rate/...

    /**
     * [START] - For http call route: /globaltrade/...
     * All APIM @GlobalTrade endpoint responses are declared here:
     */
    private static mapGlobalTradeApiResponse(): ApiIsland {
        return {
            islandRoute: 'globaltrade',
            islandVersionList: [
                {
                    versionRoute: 'v2',
                    endpointGroupList: [
                        {
                            groupRoute: 'currencies',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: '',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: currencies
                                },
                                {
                                    route: '/convert',
                                    queryParams: 'fromcurrencycode=HKD&tocurrencycode=USD&amount=300&conversiondate=11012020',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: currencyConversionResponse
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } // [END] - For http call route: /globaltrade/...

    /**
     * [START] - For http call route: /commodity/...
     * All APIM @Commodity endpoint responses are declared here:
     */
    private static mapCommodityApiResponse(): ApiIsland {
        return {
            islandRoute: 'commodity',
            islandVersionList: [
                {
                    versionRoute: 'v2',
                    endpointGroupList: [
                        {
                            groupRoute: 'commodities',
                            endpointList: [
                                {
                                    route: '/descriptions/validate',
                                    queryParams: '',
                                    method: httpMethod.POST,
                                    status: 200,
                                    response: commodityDescription
                                }
                            ]
                        },

                    ]
                },
                {
                    versionRoute: 'v1',
                    endpointGroupList: [
                        {
                            groupRoute: 'unitofmeasures',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: 'type',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: unitOfMeasures
                                }
                            ]
                        },
                        {
                            groupRoute: 'detail',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: 'key=samplekey',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: commodityDetails
                                }
                            ]
                        },
                        {
                            groupRoute: 'retrieveall',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: '',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: commodityNames
                                }
                            ]
                        },
                        {
                            groupRoute: 'commodityitemdetails',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: '',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: commodityItemDetails
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } // [END] - For http call route: /commodity/...

    /**
     * [START] - For http call route: /payment/...
     * All APIM @Payment endpoint responses are declared here:
     */
    private static mapPaymentApiResponse(): ApiIsland {
        return {
            islandRoute: 'payment',
            islandVersionList: [
                {
                    versionRoute: 'v1',
                    endpointGroupList: [
                        {
                            groupRoute: 'shipping',
                            endpointList: [
                                {
                                    route: '/paymenttypes',
                                    queryParams: 'reason=DUTIESTAXES&servicetype=INTERNATIONAL_PRIORITY&sendercountrycode=US&recipientcountrycode=CA',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: paymentTypes
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } // [END] - For http call route: /payment/...

    /**
     * [START] - For http call route: /notification/...
     * All APIM @Notification endpoint responses are declared here:
     */
    private static mapNotificationApiResponse(): ApiIsland {
        return {
            islandRoute: 'notification',
            islandVersionList: [
                {
                    versionRoute: 'v2',
                    endpointGroupList: [
                        {
                            groupRoute: 'languages',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: 'type=email',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: emailLanguages
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } // [START] - For http call route: /notification/...

    /**
     * [START] - For http call route: /address/...
     * All Local @Address endpoint responses are declared here:
     */
    private static mapAddressApiResponse(): ApiIsland {
        return {
            islandRoute: 'address',
            islandVersionList: [
                {
                    versionRoute: 'v1',
                    endpointGroupList: [
                        {
                            groupRoute: 'detail',
                            endpointList: [
                                {
                                    route: '/861283163',
                                    queryParams: '',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: addressBookParty
                                }
                            ]
                        },
                        {
                            groupRoute: 'retrieveall',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: 'addresstype=recipient',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: partyList
                                }
                            ]
                        },
                        {
                            groupRoute: 'partylist',
                            endpointList: [
                                {
                                    route: '/',
                                    queryParams: 'uid=null&addresstype=recipient',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: recipientListDetails
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } // [START] - For http call route: /address/...

    /**
    * [START] - For http call route: /api/...
    * All APIM @Api endpoint responses are declared here:
    */
    private static mapApiApiResponse(): ApiIsland {
        return {
            islandRoute: 'api',
            islandVersionList: [
                {
                    versionRoute: 'v1',
                    endpointGroupList: [
                        {
                            groupRoute: 'config',
                            endpointList: [
                                {
                                    route: '/configlist',
                                    queryParams: 'countryCode=HK&type=CURRENCY',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: currencies,
                                },
                                {
                                    route: '/configlist',
                                    queryParams: 'countryCode=APAC&type=UOM',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: apacUomList,
                                },
                                {
                                    route: '/configlist',
                                    queryParams: 'countryCode=HK&type=COM',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: commodityManufactureHK,
                                },
                                {
                                    route: '/configlist',
                                    queryParams: 'type=DISCOUNT&countryCode=HK',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: discountList,
                                },
                                {
                                    route: '/configlist',
                                    queryParams: 'countryCode=HK&type=ACCOUNT_BILLING',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: accountBillingResponse,
                                }
                            ]
                        },
                        {
                            groupRoute: 'message',
                            endpointList: [
                                {
                                    route: '/messagelist',
                                    queryParams: 'countryCode=HK',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: messagelist,
                                }
                            ]
                        },
                        {
                            groupRoute: 'user',
                            endpointList: [
                                {
                                    route: '/profile',
                                    queryParams: 'uidValue=' + sessionStorage.getItem('dialingPrefix').slice(1) + sessionStorage.getItem('mobileNumber'),
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: userProfileResponse,
                                }
                            ]
                        },
                        {
                            groupRoute: 'otp',
                            endpointList: [
                                {
                                    route: '/generate',
                                    queryParams: '',
                                    method: httpMethod.POST,
                                    status: 200,
                                    response: otpGenerateResponse,
                                },
                                {
                                    route: '/validate',
                                    queryParams: '',
                                    method: httpMethod.POST,
                                    status: 200,
                                    response: otpValidateResponse,
                                }
                            ]
                        },
                        {
                            groupRoute: 'systemcommodity',
                            endpointList: [
                                {
                                    route: '/commoditylist',
                                    queryParams: 'category=ELECTRONICS',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: commodityNamesElectronics,
                                },
                                {
                                    route: '/commoditylist',
                                    queryParams: 'category=JEWELLERY',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: commodityNamesJewellery,
                                },
                                {
                                    route: '/commoditylist',
                                    queryParams: 'category=HEALTH_CARE',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: commodityNamesHealthCare,
                                },
                                {
                                    route: '/commoditylist',
                                    queryParams: 'category=GARMENTS',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: commodityNamesGarments,
                                },
                                {
                                    route: '/commoditylist',
                                    queryParams: 'category=LITHIUM_BATTERY',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: commodityNamesLithiumBattery,
                                }
                            ]
                        },
                        {
                            groupRoute: 'shipment',
                            endpointList: [
                                {
                                    route: '/create',
                                    queryParams: '',
                                    method: httpMethod.POST,
                                    status: 200,
                                    response: createShipment
                                },
                                {
                                    route: '/score',
                                    queryParams: '',
                                    method: httpMethod.POST,
                                    status: 200,
                                    response: shipmentFeedback
                                },
                                {
                                    route: '/shipmentlist',
                                    queryParams: 'uid=1002&status=PENDING',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: pendingShipmentList
                                },
                                {
                                    route: '/shipmentlist',
                                    queryParams: 'uid=1002&status=CONFIRMED',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: confirmedShipmentList
                                }
                            ]
                        },
                        {
                            groupRoute: 'address',
                            endpointList: [
                                {
                                    route: '/partylist',
                                    queryParams: 'uid=1002&addressType=RECIPIENT',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: recipientAddressList
                                },
                                {
                                    route: '/partylist',
                                    queryParams: 'uid=1002&addressType=DEFAULT_SENDER',
                                    method: httpMethod.GET,
                                    status: 200,
                                    response: defaultSender
                                },
                                {
                                    route: '/update',
                                    queryParams: '',
                                    method: httpMethod.PUT,
                                    status: 200,
                                    response: addressUpdateResponse
                                },
                                {
                                    route: '/create',
                                    queryParams: '',
                                    method: httpMethod.POST,
                                    status: 200,
                                    response: addressCreateResponse
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    } // [END] - For http call route: /api/...



    /**
     * This method returns all mock response objects
     * New mock response object MUST be declared here 
     * Used in mock data service class for mapping responses.
     */
    public static getAllMockApiResponses(): ApiIsland[] {
        return [
            this.mapUserApiMockResponse(),
            this.mapCountryApiResponse(),
            this.mapAvailabilityApiResponse(),
            this.mapShipApiResponse(),
            this.mapRateApiResponse(),
            this.mapGlobalTradeApiResponse(),
            this.mapCommodityApiResponse(),
            this.mapPaymentApiResponse(),
            this.mapNotificationApiResponse(),
            this.mapAddressApiResponse(),
            this.mapApiApiResponse()
        ];
    }
}
