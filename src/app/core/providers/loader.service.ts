import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  public isLoading = new BehaviorSubject(false);
  loading: boolean;
  loadingPopup: any;
  isRequestFinished = false;

  constructor(
    private translate: TranslateService,
    public loadingController: LoadingController
  ) {
    this.isLoading.subscribe((v) => {
      this.loading = v;
      if (this.loading) {
        this.showLoadingPopup();
      } else {
        this.hideLoadingPopup();
      }
    });
  }

  show() {
    if (!this.loading) {
      this.isRequestFinished = false;
      this.isLoading.next(true);
    }
  }

  hide() {
    this.isRequestFinished = true;
    this.isLoading.next(false);
  }

  hideLoadingPopup() {
    if (this.loadingPopup) {
      this.loadingController.dismiss();
      this.loadingPopup = null;
    }
  }

  async showLoadingPopup() {
    this.loadingPopup = await this.loadingController.create({
      message: this.translate.instant('constants.pleaseWait'),
      backdropDismiss: false
    });

    if (!this.isRequestFinished) {
      await this.loadingPopup.present();
    }
  }
}
