import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { RouterTestingModule } from '@angular/router/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { BrowserService } from 'src/app/core/providers/browser.service';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { LanguageLoader } from 'src/app/app.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BehaviorSubject, Observable, Observer, of } from 'rxjs';
import { P4eOtpService } from 'src/app/core/providers/local/p4e-otp.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { AppState } from 'src/app/+store/app.state';
import { AccountType } from 'src/app/types/enum/account-type.enum';
import * as testConfig from '../../../../assets/config/mockConfigForTest';
import { ConfigService } from '@ngx-config/core';
import { SocialAuthService, SocialUser } from 'angularx-social-login';
import { LoginPage } from './login';
import { LineService } from '../line-login/service/line.service';
import { LoginUserProfileService } from 'src/app/providers/login-user-profile.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ILineAccessObject } from '../line-login/models/access.model';
import { HttpHeaderKey } from 'src/app/types/enum/http-header-key.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { HtmlSanitizer } from 'src/app/providers/directives/html-sanitizer.pipe';

fdescribe('LoginPage', () => {
  let component: LoginPage;
  let fixture: ComponentFixture<LoginPage>;
  let store: MockStore<AppState>;
  const eventStub = new BehaviorSubject<any>(null);
  let router: Router;
  const mockQueryParams = {
    queryParams: of({
      code: 2,
      state: 'test'
    }),
  };
  const activatedRouteSpy = jasmine.createSpyObj('ActivatedRoute', ['navigateByUrl', { queryParams: mockQueryParams }]);
  const routerSpy = jasmine.createSpyObj('Router', ['navigateByUrl', 'navigate', 'then']);

  const storeSpy = jasmine.createSpyObj('store', ['dispatch', 'select']);


  const initialState: AppState = {
    shippingApp: {
      userAccount: {
        userId: '123456',
        userProfile: {
          output: {
            profile: {
              user: {
                uid: '00g0091fpl'
              },
              contact: {
                personName: 'contactName',
                companyName: '',
                phoneNumber: '',
                emailAddress: '',
                taxId: '123456'
              },
              address: {
                streetLines: [],
                city: 'AUCKLAND',
                stateOrProvinceCode: '',
                postalCode: 123456,
                countryName: 'NEW ZEALAND',
                countryCode: 'NZ',
                residential: 'false'
              }
            }
          }
        },
        accountType: AccountType.OTP,
        accountProfile: '',
        isUserLoggedIn: true,
        lastLogin: new Date(),
        uidValue: '9736647577'
      },
      shipmentDetails: null,
      customsDetails: null,
      senderDetails: {
        countryCode: 'HK',
        countryName: '',
        postalCode: '',
        city: '',
        postalAware: false,
        emailAddress: '',
        address1: '',
        address2: '',
        contactName: undefined,
        stateAware: false,
        phoneNumber: '9736647577',
        stateOrProvinceCode: undefined,
        companyName: undefined,
        taxId: undefined
      },
      recipientDetails: null,
      paymentDetails: null,
      shipmentConfirmation: null
    }
  };

  const mockOtpValidateResponse = {
    txId: 'tgvNn1plq75wYfPkhNKJMZfcid8rJd9b',
    status: 'SUCCESS',
    message: 'Successfully Validated'
  };

  let mockUserIdResponse;
  const mockUserResponse = {
    id: '116964339554426734070',
    name: 'Test Name',
    email: 'test.official@gmail.com',
    photoUrl: 'https://lh3.googleusercontent.com/a-/AOh14GgMmdAnrIc2023Nw2ZvKjNNZHttacOpFeVwH6pR=s96-c',
    firstName: 'Test',
    lastName: 'Name',
    authToken: 'ya29.a0AfH6SMD8m12bZe1SPidG7Kx4FO3iurqTVoegBNsmu-hWD_Yh9XqfQzmznEnSO0G3tqt7z6PX_ZdmmdOvHedpiHon7_zLZNI3WRwMKKZQLV-LSVKX6c5Q6sPj5-N3yv4hmHITzzVuTvt81INtLXrj-DOuvYdfaA',
    idToken: 'eyJhbGciOiJSUzI1NiIsImtpZCI6ImQzZmZiYjhhZGUwMWJiNGZhMmYyNWNmYjEwOGNjZWI4ODM0MDZkYWMiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJhY2NvdW50cy5nb29nbGUuY29tIiwiYXpwIjoiOTIzMTE0NTE0Mjg0LW44aTFvcTB1NmkzZzgxMmhtbm5qM2V2cWY1bW5mdWVlLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwiYXVkIjoiOTIzMTE0NTE0Mjg0LW44aTFvcTB1NmkzZzgxMmhtbm5qM2V2cWY1bW5mdWVlLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tIiwic3ViIjoiMTE2OTY0MzM5NTU0NDI2NzM0MDcwIiwiZW1haWwiOiJnYW5lc2hkLm9mZmljaWFsQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJhdF9oYXNoIjoiejRrejVseGxnbjFMeGlwdUNBV3cwUSIsIm5hbWUiOiJTYW5hdmkgRGhhdmFsZSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS0vQU9oMTRHZ01tZEFuckljMjAyM053Mlp2S2pOTlpIdHRhY09wRmVWd0g2cFI9czk2LWMiLCJnaXZlbl9uYW1lIjoiU2FuYXZpIiwiZmFtaWx5X25hbWUiOiJEaGF2YWxlIiwibG9jYWxlIjoiZW4iLCJpYXQiOjE2MjEzMjAzOTcsImV4cCI6MTYyMTMyMzk5NywianRpIjoiNTZkNzdmMDZhNTZjYzQ4ZDYwOTZjMDc1YWNhMzRiZGRjZWRmZGRiMiJ9.NU7Xfht5765TOBy_jUHce0bW19Oang5bs1IO3NtGH_YOtM8SOXUQ-ovZzvQ1mzfvy4VxkDQ7wN4LP8nc3d5pv8q4M4kRDNcnpghN3LWYd3RuhS_uK8_K1kbbzcNfrL2adOtvW8-a-itya22QGCpmqm2KXP0sFxZ-hk6l80VwZiOPinKzAoqEGNQ69Nt0n4uETl-iD3y0DZWowWuj0mduRW8jDQI7SHyAUz1K_rMns2d4pyDCfDhBgxgAv286QztRJ0LJgAONQXn085aS-sWmguYV5eXNG1Wi-U1Z38KHgZjoKH82MrNENiVfLgtYlh-CWNDIBksCJTmL_veSOt3smQ',
    response: {
      AT: '116964339554426734070',
      Ve: 'Test Name',
      kV: 'Test',
      fT: 'Name',
      ZJ: 'https://lh3.googleusercontent.com/a-/AOh14GgMmdAnrIc2023Nw2ZvKjNNZHttacOpFeVwH6pR=s96-c',
      ku: 'test.official@gmail.com'
    },
    provider: 'FACEBOOK'
  };

  class SocialAuthServiceStub {
    get authState(): Observable<SocialUser> {
      return Observable.create((observer: Observer<any>) => {
        observer.next(mockOtpValidateResponse);
      });
    }

    signIn(): Observable<SocialUser> {
      return Observable.create((observer: Observer<any>) => {
        observer.next({});
      });
    }

    signOut(): Observable<SocialUser> {
      return Observable.create((observer: Observer<any>) => {
        observer.next({});
      });
    }
  }

  class LoginUserProfileServiceStub {
    getUserProfileFacebookLogin(user) { }
    getUserProfileGoogleLogin(user) { }
  }

  class P4eOtpServiceStub {
    validateOtp() {
      return Observable.create((observer: Observer<any>) => {
        observer.next(mockOtpValidateResponse);
      });
    }

    getUserProfileDetails() {
      return Observable.create((observer: Observer<any>) => {
        observer.next(mockUserIdResponse);
      });
    }
  }

  const mockAccessToken: ILineAccessObject = {
    access_token: 'abcd',
    token_type: 'auth',
    refresh_token: 'refresh',
    expires_in: 12345,
    scope: 'scope',
    id_token: 'idToken'
  };

  const mockPictureData = {
    pictureUrl: 'asdjfjkasdf'
  };

  class LineServiceStub {
    getAccessToken(code: string) {
      return Observable.create((observer: Observer<any>) => {
        observer.next(mockAccessToken);
      });
    }

    getUserProfile(token_type: string, access_token: string) {
      return Observable.create((observer: Observer<any>) => {
        observer.next(mockPictureData);
      });
    }

    verifyAccessTokenAndFetch(id_token: string, user_id: string) {
      return Observable.create((observer: Observer<any>) => {
        observer.next(mockPictureData);
      });
    }
  }

  beforeEach(async(() => {
    const mockConfig = testConfig.config;
    class configServiceStub {
      settings: any = mockConfig;
      getSettings(prop: string) {
        return this.settings[prop];
      }
      init() {
        this.settings = mockConfig;
      }
    }

    TestBed.configureTestingModule({
      declarations: [
        LoginPage,
        HtmlSanitizer
      ],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        IonicModule.forRoot(),
        StoreModule.forRoot({}),
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: LanguageLoader,
            deps: [HttpClient]
          }
        }),
        HttpClientTestingModule
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        FormBuilder,
        HtmlSanitizer,
        { provide: SocialAuthService, useClass: SocialAuthServiceStub },
        { provide: LineService, useClass: LineServiceStub },
        { provide: LoginUserProfileService, useClass: LoginUserProfileServiceStub },
        { provide: P4eOtpService, useClass: P4eOtpServiceStub },
        BrowserService,
        { provide: Router, useValue: routerSpy },
        provideMockStore({ initialState }),
        { provide: ConfigService, useClass: configServiceStub },
        {
          provide: ActivatedRoute,
          useValue: {
            queryParams: of({
              code: 2,
              state: 'test',
            }),
          },
        }
      ]

    }).compileComponents();

    fixture = TestBed.createComponent(LoginPage);
    component = fixture.componentInstance;
    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router);
    spyOn(store, 'dispatch').and.callFake(() => { });
    sessionStorage.setItem(SessionItems.SELECTEDCOUNTRY, 'HK');
  }));

  afterEach(() => {
    sessionStorage.clear();
    fixture.destroy();
  });

  fit('should create', fakeAsync(() => {
    expect(component).toBeTruthy();
  }));

  fit('should call clearSessionValues()', fakeAsync(() => {
    spyOn(component, 'clearSessionValues');
    component.ngOnInit();
    tick();
    expect(component.clearSessionValues).toHaveBeenCalled();
  }));

  fit('should call getUserProfileFacebookLogin()', fakeAsync(() => {
    spyOn(component.loginUserProfileService, 'getUserProfileFacebookLogin');
    component.getUserProfileAsPerProvider(mockUserResponse);
    tick();
    expect(component.loginUserProfileService.getUserProfileFacebookLogin).toHaveBeenCalled();
  }));

  fit('should call getUserProfileGoogleLogin()', fakeAsync(() => {
    spyOn(component.loginUserProfileService, 'getUserProfileGoogleLogin');
    mockUserResponse.provider = AccountType.GOOGLE;
    fixture.detectChanges();
    tick();
    component.getUserProfileAsPerProvider(mockUserResponse);
    expect(component.loginUserProfileService.getUserProfileGoogleLogin).toHaveBeenCalled();
  }));

  fit('should not call getUserProfileFacebookLogin() when enable is false ', fakeAsync(() => {
    spyOn(component.loginUserProfileService, 'getUserProfileFacebookLogin');
    component.enablePocCode = false;
    component.ngOnInit();
    component.fetchAccessToken();
    component.fetchUserProfile(null, null, null);
    component.verifyTokenAndFetchEmail(null, null);
    tick();
    expect(component.loginUserProfileService.getUserProfileFacebookLogin).not.toHaveBeenCalled();
  }));

  fit('should call clear login session values.', fakeAsync(() => {
    sessionStorage.setItem(HttpHeaderKey.GOOGLE_TOKEN, 'aiurwetr14123ewrfdf4');
    sessionStorage.setItem(HttpHeaderKey.FACEBOOK_TOKEN, 'aiuzzdf434432rwetr14123ewrfdf4');
    sessionStorage.setItem(HttpHeaderKey.TX_ID, 'txderiurwetr14123ewrfdf4');
    sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
    sessionStorage.setItem(SessionItems.ISLOGGEDIN, 'true');
    component.ngOnInit();
    tick();
    expect(sessionStorage.getItem(HttpHeaderKey.GOOGLE_TOKEN)).toBeFalsy();
    expect(sessionStorage.getItem(HttpHeaderKey.FACEBOOK_TOKEN)).toBeFalsy();
    expect(sessionStorage.getItem(HttpHeaderKey.TX_ID)).toBeFalsy();
    expect(sessionStorage.getItem(SessionItems.MOBILENUMBER)).toBeFalsy();
    expect(sessionStorage.getItem(SessionItems.ISLOGGEDIN)).toBeFalsy();
  }));

  fit('should set lineLoggedIn to false', fakeAsync(() => {
    component.lineLoggedIn = true;
    component.lineSignOut();
    tick();
    expect(component.lineLoggedIn).toBe(false);
  }));

  fit('should not set lineLoggedIn to false', fakeAsync(() => {
    component.enablePocCode = false;
    component.lineLoggedIn = true;
    component.lineSignOut();
    tick();
    expect(component.lineLoggedIn).toBe(true);
  }));

  fit('should call authService signin with Facebook Provider', fakeAsync(() => {
    spyOn(component.authService, 'signIn');
    spyOn(component, 'clearSessionValues');
    spyOn(component, 'resetStoreValues');
    component.facebookLogin();
    tick();
    expect(component.authService.signIn).toHaveBeenCalled();
    expect(component.clearSessionValues).toHaveBeenCalled();
    expect(component.resetStoreValues).toHaveBeenCalled();
  }));

  fit('should not call authService signin with Facebook Provider', fakeAsync(() => {
    component.enablePocCode = false;
    spyOn(component.authService, 'signIn');
    component.facebookLogin();
    tick();
    expect(component.authService.signIn).not.toHaveBeenCalled();
  }));

  fit('should call authService signin with Google Provider', fakeAsync(() => {
    spyOn(component.authService, 'signIn');
    spyOn(component, 'clearSessionValues');
    component.googleLogin();
    tick();
    expect(component.authService.signIn).toHaveBeenCalled();
    expect(component.clearSessionValues).toHaveBeenCalled();
  }));

  fit('should not call authService signin with Google Provider', fakeAsync(() => {
    component.enablePocCode = false;
    spyOn(component.authService, 'signIn');
    component.googleLogin();
    tick();
    expect(component.authService.signIn).not.toHaveBeenCalled();
  }));

  fit('should call authService signOut.', fakeAsync(() => {
    spyOn(component.authService, 'signOut');
    component.signOut();
    tick();
    expect(component.authService.signOut).toHaveBeenCalled();
  }));

  fit('should not call authService signOut.', fakeAsync(() => {
    component.enablePocCode = false;
    spyOn(component.authService, 'signOut');
    component.signOut();
    tick();
    expect(component.authService.signOut).not.toHaveBeenCalled();
  }));

  fit('should navigate to otp page, when user selected OTP login.', fakeAsync(() => {
    component.selectedCountry = 'HK';
    spyOn(component, 'clearSessionValues');
    spyOn(component, 'resetStoreValues');
    component.onOTPLogin();
    tick();
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/account/otp');
  }));

  fit('should navigate to shipment details page, when guest user selected and country not Korea.', fakeAsync(() => {
    component.selectedCountry = 'HK';
    spyOn(component, 'clearSessionValues');
    spyOn(component, 'resetStoreValues');
    component.onGuestWithoutLogin();
    tick();
    expect(component.router.navigateByUrl).toHaveBeenCalledWith('/shipping/shipment-details');
  }));

  fit('should navigate to terms and condition page, when guest user selected and country is Korea.', fakeAsync(() => {
    component.selectedCountry = 'KR';
    spyOn(component, 'clearSessionValues');
    spyOn(component, 'resetStoreValues');
    component.onGuestWithoutLogin();
    tick();
    expect(component.router.navigate).toHaveBeenCalledWith(['/', 'terms-and-conditions-kr']);
  }));

});
