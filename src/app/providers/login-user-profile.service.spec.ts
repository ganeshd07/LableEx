import { TestBed, getTestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { LoginUserProfileService } from './login-user-profile.service';
import { ConfigService } from '@ngx-config/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { Injector } from '@angular/core';
import * as testConfig from '../../assets/config/mockConfigForTest';
import { AccountType } from '../types/enum/account-type.enum';
import { AppState } from '../+store/app.state';
import { StoreModule } from '@ngrx/store';
import * as fromShippingSelector from '../../app/pages/shipping/+store/shipping.selectors';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject, Observable, Observer } from 'rxjs';
import { P4eOtpService } from '../core/providers/local/p4e-otp.service';
import { AppSupportedCountry } from '../types/enum/app-supported-country.enum';
import { SessionItems } from '../types/enum/session-items.enum';
import { OtpRequestConstants } from '../types/constants/otp-request.constants';


fdescribe('LoginUserProfileService', () => {
    let service: LoginUserProfileService;
    let httpMock: HttpTestingController;
    let injector: Injector;
    let store: MockStore<AppState>;
    const storeSpy = jasmine.createSpyObj('store', ['dispatch', 'select']);
    let eventStub = new BehaviorSubject<any>(null);
    let router: Router
    let routerStub = {
        events: eventStub,
        navigateByUrl: jasmine.createSpy('navigateByUrl')
    };
    let mockUserIdResponse;
    let mockUser = {
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
    }
    class P4eOtpServiceStub {
        getUserProfileDetails() {
            return Observable.create((observer: Observer<any>) => {
                observer.next(mockUserIdResponse);
            })
        }

        updateAcceptedTCFlag() {
            return Observable.create((observer: Observer<any>) => {
                observer.next({});
            })
        }
    }
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
                uidValue: "9736647577"
            },
            shipmentDetails: null,
            customsDetails: null,
            senderDetails: {
                countryCode: "HK",
                countryName: "",
                postalCode: "",
                city: "",
                postalAware: false,
                emailAddress: "",
                address1: "",
                address2: "",
                contactName: undefined,
                stateAware: false,
                phoneNumber: "9736647577",
                stateOrProvinceCode: undefined,
                companyName: undefined,
                taxId: undefined
            },
            recipientDetails: null,
            paymentDetails: null,
            shipmentConfirmation: null
        }
    };

    const mockConfig = testConfig.config;
    class ConfigServiceStub {
        settings: any = mockConfig;
        getSettings(prop: string) {
            return this.settings[prop];
        }
        init() {
            this.settings = mockConfig;
        }
    }


    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule,
                StoreModule.forRoot({}),
                RouterTestingModule],
            providers: [
                LoginUserProfileService,
                provideMockStore({ initialState }),
                { provide: ConfigService, useClass: ConfigServiceStub },
                { provide: Router, useValue: routerStub },
                { provide: P4eOtpService, useClass: P4eOtpServiceStub },
            ]
        });

        injector = getTestBed();
        service = injector.get(LoginUserProfileService);
        httpMock = injector.get(HttpTestingController);
        store = TestBed.inject(MockStore);
        router = TestBed.inject(Router)
        spyOn(store, 'dispatch').and.callFake(() => { });
    });

    fit('should be created', () => {
        expect(service).toBeTruthy();
    });

    fit('should navigate to shipment-details page when profile id success for otp user', fakeAsync(() => {
        sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
        sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+485');
        mockUserIdResponse = { uid: 123456 };

        spyOn(window, 'dispatchEvent');

        spyOn(service, 'updateAccountDetailsToStore');
        service.getUserProfileOTP();
        tick(500);

        expect(router.navigateByUrl).toHaveBeenCalledWith('/shipping/shipment-details');
        expect(service.updateAccountDetailsToStore).toHaveBeenCalled();
        expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('user:login'));
    }));

    fit('should save phone number to store when otp user id success for existing user.', () => {
        sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
        sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+485');
        mockUserIdResponse = {
            user: { uid: 12345 }
        }
        service.getUserProfileOTP();
        service.updateAccountDetailsToStore();
        expect(store.dispatch).toHaveBeenCalled();
        expect(sessionStorage.getItem(SessionItems.ISLOGGEDIN)).toEqual('true');
    });

    fit('should save phone number to store when otp user id success for existing user.', () => {
        sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
        sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+485');
        mockUserIdResponse = {
            user: { uid: 12345, acceptedTCFlag: OtpRequestConstants.TERMS_CONDITIONS_ACCEPTED }
        }
        service.getUserProfileOTP();
        service.updateAccountDetailsToStore();
        expect(store.dispatch).toHaveBeenCalled();
        expect(sessionStorage.getItem(SessionItems.ISLOGGEDIN)).toEqual('true');
    });

    fit('should save phone number to store when otp user id success for existing user with party list and and acceptedTCFlag is T.', () => {
        sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
        sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+485');
        mockUserIdResponse = {
            partylist: [{ user: { uid: 12345, acceptedTCFlag: OtpRequestConstants.TERMS_CONDITIONS_ACCEPTED } }]
        };
        service.getUserProfileOTP();
        service.updateAccountDetailsToStore();
        expect(store.dispatch).toHaveBeenCalled();
        expect(sessionStorage.getItem(SessionItems.ISLOGGEDIN)).toEqual('true');
    });

    fit('should save phone number to store when otp user id success for existing user with party list and and acceptedTCFlag is F.', () => {
        sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
        sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+485');
        mockUserIdResponse = {
            partylist: [{ user: { uid: 12345 } }]
        };
        service.getUserProfileOTP();
        service.updateAccountDetailsToStore();
        expect(store.dispatch).toHaveBeenCalled();
        expect(sessionStorage.getItem(SessionItems.ISLOGGEDIN)).toEqual('true');
    });

    fit('should navigate step0 page when otp validation success and country is Korea and acceptedTCFlag is T.', fakeAsync(() => {
        sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
        sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+82');
        mockUserIdResponse = {
            acceptedTCFlag: OtpRequestConstants.TERMS_CONDITIONS_ACCEPTED
        }

        service.getUserProfileOTP();
        tick(500);
        expect(routerStub.navigateByUrl).toHaveBeenCalledWith('/shipping/shipment-details');
    }));

    fit('should navigate terms and conditions page when otp validation success and country is Korea and acceptedTCFlag is F.', fakeAsync(() => {
        sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
        sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+82');
        service.countryCode = AppSupportedCountry.KR_COUNTRYCODE
        mockUserIdResponse = {
            acceptedTCFlag: OtpRequestConstants.TERMS_CONDITIONS_NOT_ACCEPTED
        }
        service.handleSuccessResponse(mockUserIdResponse);
        tick(500);
        expect(routerStub.navigateByUrl).toHaveBeenCalledWith('/terms-and-conditions-kr');
    }));

    fit('should navigate to shipment-details page when profile id success for Facebook user', fakeAsync(() => {
        mockUserIdResponse = { uid: 123456 };

        spyOn(window, 'dispatchEvent');

        spyOn(service, 'updateAccountDetailsToStore');
        service.getUserProfileFacebookLogin(mockUser);
        tick(500);
        expect(router.navigateByUrl).toHaveBeenCalledWith('/shipping/shipment-details');
        expect(service.updateAccountDetailsToStore).toHaveBeenCalled();
        expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('user:login'));
    }));

    fit('should navigate to shipment-details page when profile id success for Google user', fakeAsync(() => {
        mockUserIdResponse = { uid: 123456 };
        mockUser.provider = AccountType.GOOGLE;
        spyOn(window, 'dispatchEvent');

        spyOn(service, 'updateAccountDetailsToStore');
        service.getUserProfileGoogleLogin(mockUser);
        tick(500);
        expect(router.navigateByUrl).toHaveBeenCalledWith('/shipping/shipment-details');
        expect(service.updateAccountDetailsToStore).toHaveBeenCalled();
        expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('user:login'));
    }));

    fit('should navigate step0 page when otp validation success and country is Korea and terms and conditions are accepted.', fakeAsync(() => {
        sessionStorage.setItem(SessionItems.MOBILENUMBER, '123456789');
        sessionStorage.setItem(SessionItems.DIALINGPREFIX, '+82');
        sessionStorage.setItem(SessionItems.TERMSANDCONDITIONACCEPTED, 'true');
        mockUserIdResponse = {
            acceptedTCFlag: OtpRequestConstants.TERMS_CONDITIONS_NOT_ACCEPTED
        }

        service.getUserProfileOTP();
        tick(500);        
        expect(routerStub.navigateByUrl).toHaveBeenCalledWith('/terms-and-conditions-kr');
    }));

})