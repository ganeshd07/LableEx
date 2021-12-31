import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { select, Store } from '@ngrx/store';
import { TranslateService } from '@ngx-translate/core';
import { AppState } from 'src/app/+store/app.state';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import * as fromShippingSelector from 'src/app/pages/shipping/+store/shipping.selectors';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import { P4eOtpService } from 'src/app/core/providers/local/p4e-otp.service';

@Component({
  selector: 'terms-and-conditions-kr',
  templateUrl: './terms-and-conditions-kr.page.html',
  styleUrls: ['./terms-and-conditions-kr.page.scss'],
})
export class TermsAndConditionsKrPage implements OnInit {

  selectedCountry: string;
  selectedLanguage: string;
  checkBoxTwoLink: string;
  checkBoxThreeLink: string;
  checkBoxTextList: any;
  checkBoxFourLink: string;
  checkBoxFiveLink: string;
  checkBoxSevenLink: string;
  checkBoxEight: string;
  checkBoxNineLink: string;
  checkBoxEightLink: string;
  backNavPath = '/login';
  disableAgreeButton = true;
  isTnCChecked: boolean;
  termsAndConditionsForm: FormGroup;
  isAgreementChecked: boolean;
  userId;

  constructor(
    private appStore: Store<AppState>,
    public p4eOtpService: P4eOtpService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    public router: Router
  ) { }

  ngOnInit() {
    this.checkBoxTextList = this.getCheckBoxTextList();
    this.termsAndConditionsForm = this.formBuilder.group({
      requiredcheckBoxOne: [],
      requiredcheckBoxTwo: [],
      requiredcheckBoxThree: [],
      requiredcheckBoxFour: [],
      requiredcheckBoxFive: [],
      requiredcheckBoxSix: []
    });
  }

  getCheckBoxTextList(): any {
    return [
      {
        checkBoxText: this.translate.instant('termsAndCondition.checkBoxTwo').replace('{{msgLink}}', this.checkBoxTwoLink)
      },
      {
        checkBoxText: this.translate.instant('termsAndCondition.checkBoxThree').replace('{{msgLink}}', this.checkBoxThreeLink)
      },
      {
        checkBoxText: this.translate.instant('termsAndCondition.checkBoxFour').replace('{{msgLink}}', this.checkBoxFourLink)
      },
      {
        checkBoxText: this.translate.instant('termsAndCondition.checkBoxFive').replace('{{msgLink}}', this.checkBoxFiveLink)
      },
      {
        checkBoxText: this.translate.instant('termsAndCondition.checkBoxSeven').replace('{{msgLink}}', this.checkBoxSevenLink)
      },
      {
        checkBoxText: this.translate.instant('termsAndCondition.checkBoxEight').replace('{{msgLink}}', this.checkBoxEightLink)
      },
      {
        checkBoxText: this.translate.instant('termsAndCondition.checkBoxNine').replace('{{msgLink}}', this.checkBoxNineLink)
      }
    ];
  }

  ngDoCheck() {
    this.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    if (this.selectedCountry === 'KR' && this.selectedLanguage === 'en') {
      this.checkBoxTwoLink = 'https://www.fedex.com/en-kr/open-account/consent/personal-info.html';
      this.checkBoxThreeLink = 'https://www.fedex.com/en-kr/open-account/consent/personal-info-transfer.html';
      this.checkBoxFourLink = 'https://www.fedex.com/en-kr/open-account/consent/personal-info-overseas-transfer.html';
      this.checkBoxFiveLink = 'https://www.fedex.com/en-kr/open-account/consent/personal-info-usage.html';
      this.checkBoxSevenLink = 'https://www.fedex.com/en-kr/terms-of-use.html';
      this.checkBoxEightLink = 'https://www.fedex.com/content/dam/fedex/apac-asia-pacific/downloads/fedex-terms-of-service-kr.pdf';
      this.checkBoxNineLink = 'https://www.fedex.com/en-kr/privacy-policy.html';
    } else if (this.selectedCountry === 'KR' && this.selectedLanguage === 'ko_kr') {
      this.checkBoxTwoLink = 'https://www.fedex.com/ko-kr/open-account/consent/personal-info.html';
      this.checkBoxThreeLink = 'https://www.fedex.com/ko-kr/open-account/consent/personal-info-transfer.html';
      this.checkBoxFourLink = 'https://www.fedex.com/ko-kr/open-account/consent/personal-info-overseas-transfer.html';
      this.checkBoxFiveLink = 'https://www.fedex.com/ko-kr/open-account/consent/personal-info-usage.html';
      this.checkBoxSevenLink = 'https://www.fedex.com/ko-kr/terms-of-use.html';
      this.checkBoxEightLink = 'https://www.fedex.com/content/dam/fedex/apac-asia-pacific/downloads/fedex-terms-of-service-kr.pdf';
      this.checkBoxNineLink = 'https://www.fedex.com/ko-kr/privacy-policy.html';
    }
    this.checkBoxTextList = this.getCheckBoxTextList();
    this.enableAgreeButton();
  }

  onTnCCheckBoxChecked(event) {
    this.isTnCChecked = event.target.checked;
    setTimeout(() => {
      this.enableAgreeButton();
    }, 0);
  }

  onAgreementCheckBoxChecked(event) {
    this.isAgreementChecked = event.target.checked;
    setTimeout(() => {
      this.enableAgreeButton();
    }, 0);
  }

  enableAgreeButton() {
    if (this.termsAndConditionsForm.get('requiredcheckBoxOne').value && this.termsAndConditionsForm.get('requiredcheckBoxTwo').value
      && this.termsAndConditionsForm.get('requiredcheckBoxThree').value && this.termsAndConditionsForm.get('requiredcheckBoxFour').value
      && this.termsAndConditionsForm.get('requiredcheckBoxFive').value && this.termsAndConditionsForm.get('requiredcheckBoxSix').value) {
      this.disableAgreeButton = false;
    } else {
      this.disableAgreeButton = true;
    }
  }

  onClickAgreeTermsAndCondition() {
    sessionStorage.setItem(SessionItems.TERMSANDCONDITIONACCEPTED, 'true');
    if (sessionStorage.getItem(SessionItems.ISLOGGEDIN)) {
      this.getUserProfileDetails();
      this.p4eOtpService.updateAcceptedTCFlag(true, this.userId)?.subscribe();
    }
    this.router.navigate(['/shipping/shipment-details']);
  }

  getUserProfileDetails() {
    this.appStore.pipe(select(fromShippingSelector.selectUserLoginDetails))
      .subscribe((userloginDetails: IUser) => {
        if (userloginDetails) {
          this.userId = userloginDetails.userId;
        }
      });
  }
}
