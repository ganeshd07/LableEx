import { Component, OnInit } from '@angular/core';
import { ThankYouPageConstants } from '../../../../app/types/constants/thank-you-page.constants';
import { selectCreateShipmentSuccess, selectShipmentFeedbackSuccess } from '../+store/shipping.selectors';
import { Subscription } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import { FormBuilder, FormGroup } from '@angular/forms';
import { postShipmentFeedbackBegin } from '../+store/shipping.actions';
import { CreateShipmentResponse } from 'src/app/interfaces/api-service/response/create-shipment-response';
import { NotificationService } from 'src/app/core/providers/notification-service';
import { TranslateService } from '@ngx-translate/core';
import { SessionItems } from 'src/app/types/enum/session-items.enum';


@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.page.html',
  styleUrls: ['./thank-you.page.scss'],
})
export class ThankYouPage implements OnInit {
  commentArea = true;
  starRatings = 5;
  pageConstants = ThankYouPageConstants;
  private subs: Subscription;
  thankYouForm: FormGroup;
  shipmentData: CreateShipmentResponse = {
    shipmentId: '',
    shipmentRefNumber: '',
    barcodeURI: ''
  };

  constructor(
    private appStore: Store<AppState>,
    private notif: NotificationService,
    private translate: TranslateService,
    public formBuilder: FormBuilder
  ) {
    this.subs = new Subscription();
  }

  ngOnInit() {
    setTimeout(() => {
      this.starRatings = 0;
    }, 0);
    this.thankYouForm = this.formBuilder.group({
      commentText: ['']
    });
    this.getFinalizedShipmentData();
    this.handleSubmitFeedbackSuccess();
  }

  getFinalizedShipmentData() {
    this.subs.add(
      this.appStore.pipe(select(selectCreateShipmentSuccess)).subscribe((shipmentSuucessData: any) => {
        if (shipmentSuucessData) {
          this.shipmentData = shipmentSuucessData;
        }
      })
    );
  }

  handleSubmitFeedbackSuccess() {
    this.subs.add(
      this.appStore.pipe(select(selectShipmentFeedbackSuccess)).subscribe((shipmentFeedbackSuccessData: any) => {
        if (shipmentFeedbackSuccessData) {
          this.commentArea = false;
        }
      })
    );
  }

  submitFeedback() {
    const commentTextValue = this.thankYouForm.controls.commentText.value;
    if (commentTextValue === '') {
      this.notif.showAlertMessage(this.translate.instant('thankYouPage.feedBackAlertMessage'));
    } else if (commentTextValue.length > 450) {
      this.notif.showAlertMessage(this.translate.instant('thankYouPage.maxLimitAlertMessage'));
    } else {
      this.appStore.dispatch(postShipmentFeedbackBegin({
        shipmentId: this.shipmentData.shipmentId,
        comment: this.thankYouForm.controls.commentText.value,
        score: this.starRatings.toString()
      }));
    }
  }

  selectStarRating(rating) {
    this.starRatings = rating;
  }

  onClickFindLocation() {
    const selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    const countryCode = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY).toLowerCase();
    const language = selectedLanguage.split('_');
    let locationUrl = '';

    if (language[0] === this.pageConstants.LANGCODEEN) {
      locationUrl = this.getFormattedUrl(language[0], countryCode);
    } else {
      locationUrl = this.getLocalFormattedUrl(countryCode);
    }
    window.open(locationUrl, '_blank');
  }

  getLocalFormattedUrl(countryCode) {
    let url = '';
    switch (countryCode) {
      case this.pageConstants.CN:
        url = this.getFormattedUrl(this.pageConstants.LANGCODECN, countryCode);
        break;
      case this.pageConstants.HK:
        url = this.getFormattedUrl(this.pageConstants.LANGCODECN, countryCode);
        break;
      case this.pageConstants.ID:
        url = this.getFormattedUrl(this.pageConstants.LANGCODEID, countryCode);
        break;
      case this.pageConstants.JP:
        url = this.getFormattedUrl(this.pageConstants.LANGCODEJP, countryCode);
        break;
      case this.pageConstants.KR:
        url = this.getFormattedUrl(this.pageConstants.LANGCODEKR, countryCode);
        break;
      case this.pageConstants.TH:
        url = this.getFormattedUrl(this.pageConstants.LANGCODETH, countryCode);
        break;
      case this.pageConstants.TW:
        url = this.getFormattedUrl(this.pageConstants.LANGCODECN, countryCode);
        break;
      case this.pageConstants.VN:
        url = this.getFormattedUrl(this.pageConstants.LANGCODEVN, countryCode);
        break;
      default:
        url = this.getFormattedUrl(this.pageConstants.LANGCODEEN, countryCode);

    }
    return url;
  }

  getFormattedUrl(language, countryCode) {
    return this.pageConstants.LOCATIONURL + language + '-' + countryCode + '/';
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

}
