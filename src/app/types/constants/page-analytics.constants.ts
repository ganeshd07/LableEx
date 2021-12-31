import { environment } from 'src/environments/environment';
import { SessionItems } from '../enum/session-items.enum';

export class PageAnalytics {
    public static APP_NAME = 'labeless';
    public static ORG_NAME = 'fedex';
    public static TYPE = 'apps';
    public static PAGEID_DELIMETER = environment.analytics_id_delimeter;

    public static getPageId(route: string) {
        const routeSplit = route.split('?');
        const selectedLang = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
        let matchedIdObj = this.getParamIdsByRoute().find(aaObj => aaObj.route === routeSplit[0]);
        matchedIdObj = matchedIdObj ? matchedIdObj : { route: '/message-centre', id: 'msgctr'};
        const paramCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
        const paramLanguage = selectedLang.substr(0, 2);
        const paramInfix = [this.ORG_NAME, this.TYPE].join(this.PAGEID_DELIMETER);
        const paramAppName = this.APP_NAME;
        const paramId = (matchedIdObj) ? matchedIdObj.id : null;

        const paramList = [paramCountry, paramLanguage, paramInfix, paramAppName, paramId];
        const aaPageId = paramList.join(this.PAGEID_DELIMETER);

        return (paramId) ? aaPageId : null;
    }

    /**
     * These are the list or route/url for mapping page IDs
     * for Adobe Analytics pageInfo event
     *
     * NOTE: please register new route/view here as needed/required by AA
     */
    private static getParamIdsByRoute() {
        return [
            {
                route: '/message-centre',
                id: 'msgctr'
            },
            {
                route: '/login',
                id: 'login'
            },
            {
                route: '/account/otp',
                id: 'mobileno'
            },
            {
                route: '/account/otp-verification',
                id: ['otp', 'psw'].join(this.PAGEID_DELIMETER)
            },
            {
                route: '/shipping/shipment-details',
                id: 'shpdetail'
            },
            {
                route: '/shipping/show-rates',
                id: ['shpdetail', 'getrate'].join(this.PAGEID_DELIMETER)
            },
            {
                route: '/shipping/address-book',
                id: ['shpdetail', 'addbook'].join(this.PAGEID_DELIMETER)
            },
            {
                route: '/shipping/my-shipments',
                id: ['myship', 'recent'].join(this.PAGEID_DELIMETER)
            },
            {
                route: '/shipping/my-shipments/recent',
                id: ['myship', 'recent'].join(this.PAGEID_DELIMETER)
            },
            {
                route: '/shipping/my-shipments/pending',
                id: ['myship', 'pending'].join(this.PAGEID_DELIMETER)
            },
            {
                route: '/shipping/customs-details',
                id: 'custdetail'
            },
            {
                route: '/shipping/add-item',
                id: ['custdetail', 'item'].join(this.PAGEID_DELIMETER)
            },
            {
                route: '/shipping/sender-details',
                id: 'fromadd'
            },
            {
                route: '/shipping/recipient-details',
                id: 'toadd'
            },
            {
                route: '/shipping/billing-details',
                id: 'billing'
            },
            {
                route: '/shipping/summary',
                id: 'summary'
            },
            {
                route: '/shipping/thank-you',
                id: 'confirm'
            }
        ];
    }
}
