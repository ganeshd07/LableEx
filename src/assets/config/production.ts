export const config = {
    APIM: {
        HOST: 'https://api.fedex.com',
        OAUTH_CREDENTIALS: {
            grantType: 'client_credentials',
            clientId: 'l71399433e14cd48468d63b8c5c045f8fa',
            clientSecret: 'a51954c989e84753be8a3b0080954f5d',
            scope: 'oob',
            tokenType: 'Bearer'
        },
        AUTH_ISLAND_API: {
            token: '/auth/oauth/v2/token'
        },
        USER_ISLAND_API: {
            login: '/user/v2/login',
            logout: '/user/v2/logout'
        },
        COUNTRY_ISLAND_API: {
            countries: '/country/v2/countries',
            countryDetail: '/country/v2/countrydetail',
            senderRecipientInfo: '/country/v2/senderrecipientinfo',
            dialingPrefixes: '/dialingprefixes',
            cities: '/cities',
            states: '/states'
        },
        AVAILABILITY_ISLAND_API: {
            specialServiceOptions: '/availability/v1/specialserviceoptions',
            packageAndServiceOptions: '/availability/v1/packageandserviceoptions',
            packageTypeList: '/availability/v1/packagetypes',
            signatureOptions: '/signatureoptions'
        },
        COMMODITY_ISLAND_API: {
            commodities: '/commodity/v2/commodities',
            validateCommodityDescription: '/descriptions/validate',
            unitOfMeasure: '/commodity/v1/unitofmeasures'
        },
        GLOBAL_TRADE_ISLAND_API: {
            currencies: '/globaltrade/v2/currencies',
            currencyConversion: '/convert'
        },
        NOTIFICATION_ISLAND_API: {
            emailLanguages: '/notification/v2/languages'
        },
        PAYMENT_ISLAND_API: {
            payment: '/payment/v1/shipping',
            paymentTypes: '/paymenttypes'
        },
        RATES_ISLAND_API: {
            rateQuote: '/rate/v2/rates/quotes',
        },
        SHIPMENT_ISLAND_API: {
            shipping: '/ship/v2/shipping',
            documentDescription: '/documentdescriptions',
            shipmentPurpose: '/shipmentpurposes'
        }
    },
    LOCAL: {
        HOST: '',
        TOKEN_CREDENTIALS: {
            clientId: '84e9b0c9fc40a5ef702cc9734189104498d955431946c53e937181ae0ad95b48',
            secretKey: 'a01c48b123408a26408ce7160d8c2a73fa46d2891459c43d67e3110a08b49438',
        },
        P4E_OTP_SETTINGS: {
            applicationKey: '5QVMH9WVDKVSYNG',
            applicationKeyBilling: 'X65YJIVJ8Y80FS1',
            timeZone: 'Asia/Hong_Kong'
        },
        API_ISLAND: {
            authenticate: '/api/v1/authenticate',
            configList: '/api/v1/config/configlist',
            createShipment: '/api/v1/shipment/create',
            shipmentFeedback: '/api/v1/shipment/score',
            generateOtp: '/api/v1/otp/generate',
            validateOtp: '/api/v1/otp/validate',
            saveCommodityItem: '/api/v1/usercommodity/create',
            recipientListDetails: '/api/v1/address/partylist',
            shipmentsListDetails: '/api/v1/shipment/shipmentlist',
            pendingShipmentQrCode: '/api/v1/shipment/qrCode',
            postPartyAddressDetails: '/api/v1/address/create',
            updatePartyAddressDetails: '/api/v1/address/update',
            messageCentre: '/api/v1/message/messagelist',
            userProfile: '/api/v1/user/profile',
            userCommodityList: '/api/v1/usercommodity/commoditylist',
            acceptedTC: '/api/v1/user/acceptedTC'
        },
        ADDRESS_LOCAL_ISLAND_API: {
            addressBookParty: '/address/v1/detail',
            partyList: '/address/v1/retrieveall'
        },
        COMMODITY_LOCAL_ISLAND_API: {
            commodityDetails: '/commodity/v1/detail',
            commoditiesNames: '/commodity/v1/retrieveall',
            commodityItemDetails: '/commodity/v1/commodityitemdetails',
            systemCommodityList: '/api/v1/systemcommodity/commoditylist'
        }
    },
    LINE: {
        ACCESS_TOKEN_API: 'https://api.line.me/oauth2/v2.1/token',
        USER_TOKEN_API: 'https://api.line.me/v2/profile',
        VERIFY_TOKEN_API: 'https://api.line.me/oauth2/v2.1/verify',
        CLIENT_ID:'1654573779',
        CLIENT_SECRET:'c929b52231cf0d8853122c13bf304479',
        REDIRECT_URL:'https://lite.dmz.apac.fedex.com',
        GRANT_TYPE:'authorization_code',
        SCOPE:'profile%20openid%20email',
        NONCE:'09876xyz'
    },
    GOOGLE: {
        CLIENT_ID: '674915865994-uj9e5a642umik5n1gas6csi28ak52tvj.apps.googleusercontent.com',
        SECRET: '_q8sqo7rPfH6sEvQxZmYg3tT'
    },
    FACEBOOK: {
        APP_ID:'291347392457422',
        SECRET:'4122cd1075eb5fed15d96550dbc6d4c0'
    },
    ALLOWED_FB_LOGINS: [
        'HK',
        'SG'
    ],
    ALLOWED_GOOGLE_LOGINS: [
        'HK',
        'SG'
    ],
    ALLOWED_LINE_LOGINS: [
        // Put country codes here in the future
    ],
    MANDATORY_TAX_ID_COUNTRY_LIST: [
        'ID'
    ],
    ARIAL_FONT_LANGUAGE_LIST: [
        'th_th',
        'vi_vn'
    ],
    FEDEX_DOMAIN: {
        HOST: 'https://www.fedex.com',
        APPS_ISLAND: '/fedextrack/'
    }
};
