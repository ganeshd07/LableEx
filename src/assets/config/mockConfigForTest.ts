export const config = {
    APIM: {
        HOST: 'https://apidrt.idev.fedex.com',
        OAUTH_CREDENTIALS: {
            grantType: 'client_credentials',
            clientId: 'l7xx8659261c4bca4878b43cc7b367a0e1ec',
            clientSecret: '2b91742cb98d4d4a909ec11e5338c4fa',
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
            validateCommodityDescription: '/descriptions/validate'
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
        HOST: 'https://lite-dev.ute.apac.fedex.com',
        TOKEN_CREDENTIALS: {
            clientId: 'labelex123Id',
            secretKey: 'labelex123Key',
        },
        P4E_OTP_SETTINGS: {
            applicationKey: 'GBX3D79A9UKN96G',
            applicationKeyBilling: 'HHXIC13DX17NGHW',
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
        VERIFY_TOKEN_API: 'https://api.line.me/oauth2/v2.1/verify'
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
    ARIAL_FONT_LANGUAGE_LIST: [
        'th_th',
        'vi_vn'
    ],
    MANDATORY_TAX_ID_COUNTRY_LIST:[
        'ID'
    ],
    FEDEX_DOMAIN: {
        HOST: 'https://www.fedex.com',
        APPS_ISLAND: '/fedextrack/'
    }
};
