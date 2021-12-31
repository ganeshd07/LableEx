import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { P4eOtpService } from 'src/app/core/providers/local/p4e-otp.service';
import { AppState } from '../+store/app.state';
import { ISender } from '../interfaces/shipping-app/sender';
import { IUser } from '../interfaces/shipping-app/user';
import { AccountType } from '../types/enum/account-type.enum';
import { Store } from '@ngrx/store';
import { saveSenderAddressAction, saveUserAccountAction } from '../pages/shipping/+store/shipping.actions';
import { AppSupportedCountry } from '../types/enum/app-supported-country.enum';
import { HttpHeaderKey } from '../types/enum/http-header-key.enum';
import { SessionItems } from '../types/enum/session-items.enum';
import { OtpRequestConstants } from '../types/constants/otp-request.constants';

/**
 * This is a login user profile class. 
 * All different login's user profile get 
 * and stored in store.
 * 
 */
@Injectable({
    providedIn: 'root'
})
export class LoginUserProfileService {
    userProfile = null;
    userId = null;
    userAcceptedTC: string;
    countryCode: string;
    mobileNumber: string;
    dialingPrefix: string;
    accountType: AccountType;
    uidValue: string;

    constructor(
        private p4eOtpService: P4eOtpService,
        public router: Router,
        private appStore: Store<AppState>,
    ) { }

    getSessionItems() {
        this.dialingPrefix = sessionStorage.getItem(SessionItems.DIALINGPREFIX);
        this.mobileNumber = sessionStorage.getItem(SessionItems.MOBILENUMBER);
        this.countryCode = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    }

    public getUserProfileOTP() {
        this.getSessionItems();
        const phoneNumber = this.dialingPrefix.replace('+', '') + this.mobileNumber;
        this.accountType = AccountType.OTP;
        this.uidValue = this.mobileNumber;
        this.p4eOtpService.getUserProfileDetails(phoneNumber).subscribe(response => {
            this.handleSuccessResponse(response);
        });
    }

    public getUserProfileFacebookLogin(userDetails) {
        this.getSessionItems();
        this.accountType = AccountType.FACEBOOK;
        this.uidValue = userDetails.email;
        sessionStorage.setItem(HttpHeaderKey.FACEBOOK_TOKEN, userDetails.authToken);
        this.p4eOtpService.getUserProfileDetails(userDetails.email).subscribe(response => {
            this.handleSuccessResponse(response);
        });
    }

    public getUserProfileGoogleLogin(userDetails) {
        this.getSessionItems();
        this.accountType = AccountType.GOOGLE;
        this.uidValue = userDetails.email;
        sessionStorage.setItem(HttpHeaderKey.GOOGLE_TOKEN, userDetails.authToken);
        this.p4eOtpService.getUserProfileDetails(userDetails.email).subscribe(response => {
            this.handleSuccessResponse(response);
        });
    }

    handleSuccessResponse(response) {
        if (response.partylist) {
            const userProfile = response.partylist[0].user;
            this.userId = userProfile.uid;
            if ('acceptedTCFlag' in userProfile) {
                this.userAcceptedTC = userProfile.acceptedTCFlag;
            } else {
                this.userAcceptedTC = OtpRequestConstants.TERMS_CONDITIONS_NOT_ACCEPTED;
            }
        } else if (response.user) {
            this.userId = response.user.uid;
            if ('acceptedTCFlag' in response.user) {
                this.userAcceptedTC = response.user.acceptedTCFlag;
            } else {
                this.userAcceptedTC = OtpRequestConstants.TERMS_CONDITIONS_NOT_ACCEPTED;
            }
        } else {
            this.userId = response.uid;
            if ('acceptedTCFlag' in response) {
                this.userAcceptedTC = response.acceptedTCFlag;
            } else {
                this.userAcceptedTC = OtpRequestConstants.TERMS_CONDITIONS_NOT_ACCEPTED;
            }
        }

        this.userProfile = response;
        this.updateAccountDetailsToStore();
        window.dispatchEvent(new Event('user:login'));
        sessionStorage.setItem(SessionItems.ISLOGGEDIN, 'true');

        setTimeout(() => {
            if (this.countryCode === AppSupportedCountry.KR_COUNTRYCODE && this.userAcceptedTC === OtpRequestConstants.TERMS_CONDITIONS_NOT_ACCEPTED) {
                this.router.navigateByUrl('/terms-and-conditions-kr');
            } else {
                this.router.navigateByUrl('/shipping/shipment-details');
            }
        }, 500);
    }

    saveUserAccountDetails(): IUser {
        const myDate = new Date();
        return {
            userId: this.userId,
            userProfile: this.userProfile,
            accountType: this.accountType,
            accountProfile: '',
            isUserLoggedIn: true,
            lastLogin: myDate,
            uidValue: this.uidValue
        };
    }

    updateAccountDetailsToStore() {
        const senderDetails: ISender = {
            countryCode: sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY),
            countryName: '',
            postalCode: '',
            city: '',
            postalAware: false,
            emailAddress: undefined,
            address1: undefined,
            contactName: undefined,
            stateAware: false,
            phoneNumber: this.mobileNumber,
            stateOrProvinceCode: undefined,
            companyName: undefined,
            taxId: undefined
        };
        senderDetails.address2 = undefined;
        this.appStore.dispatch(saveSenderAddressAction({ senderDetails }));
        this.appStore.dispatch(saveUserAccountAction({
            userAccount: this.saveUserAccountDetails()
        }));
    }
}


