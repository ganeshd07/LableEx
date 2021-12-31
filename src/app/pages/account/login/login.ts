import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { UserData } from '../../../providers/user-data';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import {
  FacebookLoginProvider,
  GoogleLoginProvider,
} from 'angularx-social-login';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { LineService } from '../line-login/service/line.service';
import { environment } from '../../../../environments/environment';
import { ILineAccessObject } from '../line-login/models/access.model';
import { BrowserService } from 'src/app/core/providers/browser.service';
import { ConfigService } from '@ngx-config/core';
import { LoginUserProfileService } from '../../../providers/login-user-profile.service';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import { HttpHeaderKey } from 'src/app/types/enum/http-header-key.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { Store } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import { resetNewShippingAction, saveUserAccountAction } from '../../shipping/+store/shipping.actions';
import { TranslateService } from '@ngx-translate/core';
import { countryResource } from 'src/app/types/constants/country-resource.constants';
import { AppSupportedCountry } from 'src/app/types/enum/app-supported-country.enum';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
})
export class LoginPage implements OnInit {
  submitted = false;
  countryCode = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);

  // Google-FB
  user: SocialUser;
  loggedIn: boolean;

  // Line Login
  code: string;
  state: string;
  accessTokenResponse: any;
  userProfileResponse: any;
  verifyTokenResponse: any;
  imageUrl: any;
  lineLoggedIn = false;
  enablePocCode = false;
  enableGoogleLogin = false;
  enableLineLogin = false;
  enableFBLogin = true;
  termsAndConditions: string;
  selectedLanguage: string;
  selectedCountry: string;
  termsofUseUrlsData = countryResource.getTermsOfUseUrls();
  termsofUseLinkUrl: string;
  privacyStatementUrl: string;
  globalPrivacyPolicyUrl: string = countryResource.GLOBALPRIVACYPOLICYURL;

  constructor(
    public userData: UserData,
    public router: Router,
    public authService: SocialAuthService,
    private route: ActivatedRoute,
    private lineService: LineService,
    private sanitizer: DomSanitizer,
    private browserService: BrowserService,
    private readonly config: ConfigService,
    public loginUserProfileService: LoginUserProfileService,
    private appStore: Store<AppState>,
    private translate: TranslateService
  ) {

    this.enablePocCode = environment.enable_social_login_poc;
    this.enableFBLogin = this.config.getSettings('ALLOWED_FB_LOGINS').includes(this.countryCode) ? true : false;
    this.enableGoogleLogin = this.config.getSettings('ALLOWED_GOOGLE_LOGINS').includes(this.countryCode) ? true : false;
    this.enableLineLogin = this.config.getSettings('ALLOWED_LINE_LOGINS').includes(this.countryCode) ? true : false;

    if (this.enablePocCode && this.enableLineLogin) {
      this.route.queryParams.subscribe((params) => {
        this.code = params.code;
        this.state = params.state;
        if (this.code && this.state) {
          this.fetchAccessToken();
          this.lineLoggedIn = true;
        }
      });
    }
  }

  ngOnInit(): void {
    this.clearSessionValues();
    if (this.enablePocCode) {
      this.authService.authState?.subscribe((user) => {
        this.user = user;
        this.loggedIn = user != null;
        if (user) {
          this.getUserProfileAsPerProvider(user);
        }
      });
    }
  }

  onLogin(form: NgForm) {
    const loginForm = form.value;
    this.submitted = true;

    if (loginForm.username === 'admin' && loginForm.password === 'admin') {
      if (this.browserService.isbrowser) {
        sessionStorage.setItem(SessionItems.ISLOGGEDIN, 'true');
      }
      this.router.navigateByUrl('/splash');
    }
  }

  onSSOLogin() {
    this.router.navigateByUrl('/account/sso');
  }

  onOTPLogin() {
    this.clearSessionValues();
    this.resetStoreValues()
    this.router.navigateByUrl('/account/otp');
  }

  onGuestWithoutLogin() {
    this.clearSessionValues();
    this.resetStoreValues();
    if (this.selectedCountry === AppSupportedCountry.KR_COUNTRYCODE) {
      this.router.navigate(['/', 'terms-and-conditions-kr']);
    } else {
      this.router.navigateByUrl('/shipping/shipment-details');
    }
  }

  getUserProfileAsPerProvider(user) {
    if (user.provider === AccountType.FACEBOOK) {
      this.loginUserProfileService.getUserProfileFacebookLogin(user);
    } else {
      this.loginUserProfileService.getUserProfileGoogleLogin(user);
    }
  }

  clearSessionValues() {
    sessionStorage.removeItem(HttpHeaderKey.FACEBOOK_TOKEN);
    sessionStorage.removeItem(HttpHeaderKey.GOOGLE_TOKEN);
    sessionStorage.removeItem(HttpHeaderKey.TX_ID);
    sessionStorage.removeItem(SessionItems.MOBILENUMBER);
    sessionStorage.removeItem(SessionItems.ISLOGGEDIN);
  }

  resetStoreValues() {
    this.appStore.dispatch(resetNewShippingAction());
    this.appStore.dispatch(saveUserAccountAction(null));
  }

  lineLogin() {
    if (this.enablePocCode) {
      const url = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${this.config.getSettings('LINE').CLIENT_ID}&redirect_uri=${this.config.getSettings('LINE').REDIRECT_URL}&state=Sunday@123&scope=${this.config.getSettings('LINE').SCOPE}&nonce=${this.config.getSettings('LINE').NONCE}`;
      location.href = url;
    }
  }

  facebookLogin() {
    this.clearSessionValues();
    this.resetStoreValues();
    if (this.enablePocCode) {
      this.authService.signIn(FacebookLoginProvider.PROVIDER_ID);
    }
  }

  googleLogin() {
    this.clearSessionValues();
    this.resetStoreValues()
    if (this.enablePocCode) {
      const googleLoginOptions = {
        scope: 'profile email',
      };
      this.authService.signIn(
        GoogleLoginProvider.PROVIDER_ID,
        googleLoginOptions
      );
    }
  }

  signOut(): void {
    if (this.enablePocCode) {
      this.authService.signOut();
    }
  }

  fetchAccessToken() {
    if (this.enablePocCode) {
      this.lineService.getAccessToken(this.code).subscribe(
        (response: ILineAccessObject) => {
          this.accessTokenResponse = response;
          this.fetchUserProfile(
            response.token_type,
            response.access_token,
            response.id_token
          );
        },
        (err) => (this.accessTokenResponse = err.error)
      );
    }
  }

  fetchUserProfile(token_type: string, access_token: string, id_token: string) {
    if (this.enablePocCode) {
      this.lineService
        .getUserProfile(token_type, access_token)
        .subscribe((x: any) => {
          this.imageUrl = x.pictureUrl
            ? this.sanitizer.bypassSecurityTrustUrl(x.pictureUrl)
            : undefined;
          this.userProfileResponse = x;
          this.verifyTokenAndFetchEmail(id_token, x.userId);
        });
    }
  }

  verifyTokenAndFetchEmail(token, userid) {
    if (this.enablePocCode) {
      this.lineService
        .verifyAccessTokenAndFetch(token, userid)
        .subscribe((x: any) => {
          this.verifyTokenResponse = x;
        });
    }
  }

  ngDoCheck() {
    this.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    this.termsofUseLinkUrl = this.termsofUseUrlsData.find(country => country.countryCode === this.selectedCountry && country.languageCode === this.selectedLanguage)?.termsOfUseUrl;
    this.privacyStatementUrl = this.termsofUseUrlsData.find(country => country.countryCode === this.selectedCountry && country.languageCode === this.selectedLanguage)?.privacyUrl;
    this.termsAndConditions = this.translate.instant('loginPage.termsOfUseNote').replace('{{termsOfUseLink}}', this.termsofUseLinkUrl).replace('{{privacyStatement}}', this.privacyStatementUrl).replace('{{globalPrivacyStatement}}', this.globalPrivacyPolicyUrl);
  }

  lineSignOut() {
    if (this.enablePocCode) {
      this.lineLoggedIn = false;
    }
  }
}
