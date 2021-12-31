export class HttpInterceptorResource {
    public static isSkippedXlocale(apimEndpoint: string) {
        const pathMatch = this.getSkippedXLocaleEndpoints().find(urlPath => apimEndpoint.match(urlPath));
        return (pathMatch) ? true : false;
    }

    public static isSecureLocalApiEndpoint(localApiEndpoint: string) {
        const endPointMatch = this.getSecureLocalApiEndpoints().find(endpoint => localApiEndpoint.match(endpoint));
        return (endPointMatch) ? true : false;
    }

    public static isSecureLocalApiEndpointWithUid(localApiEndpoint: string) {
        const endPointMatch = this.getSecureLocalApiEndpointsWithUid().find(endpoint => localApiEndpoint.match(endpoint));
        return (endPointMatch) ? true : false;
    }

    private static getSkippedXLocaleEndpoints(): string[] {
        return [
            '/country/v2/countries',
            '/country/v2/countrydetail'
        ];
    }

    private static getSecureLocalApiEndpoints(): string[] {
        return [
            '/api/v1/shipment/shipmentlist',
            '/api/v1/address/create',
            '/api/v1/address/update',
            '/api/v1/address/delete',
            '/api/v1/address/partylist',
            '/api/v1/usercommodity/commoditylist',
            '/api/v1/usercommodity/delete',
            '/api/v1/user/acceptedTC',
            '/api/v1/user/profile',
            '/api/v1/usercommodity/create'
        ];
    }

    private static getSecureLocalApiEndpointsWithUid(): string[] {
        return [
            '/api/v1/address/create',
            '/api/v1/address/update',
            '/api/v1/user/acceptedTC',
            '/api/v1/usercommodity/create'
        ];
    }
}
