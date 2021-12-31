export interface OAuthResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
    error?: string;
    error_description?: string;
}
