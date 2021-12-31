/**
 * This is an Enum class used in the Authentication Service class
 * Most of the enums here are used as parameter keys
 * 
 * Author: Roan Villaflores
 * Date Created: April 15, 2020 
 */
export enum OAuthEnum {
    ENDPOINT_KEY = 'oauth',
    STORE_KEY = '_oauth',
    BEARER = 'Bearer ',
    HEADER_AUTHORIZATION = 'Authorization',

    PARAM_GRANT_TYPE = 'grant_type',
    PARAM_CLIENT_ID = 'client_id',
    PARAM_CLIENT_SECRET = 'client_secret',
    PARAM_SCOPE = 'scope',

    LOCAL_AUTH_ENDPOINT = 'authenticate',
    LOCAL_STORE_KEY = '_localAuth'
}
