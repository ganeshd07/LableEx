import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { ConfigService } from '@ngx-config/core';
import { Subscription } from 'rxjs';
import { AppState } from 'src/app/+store/app.state';
import { IUser } from 'src/app/interfaces/shipping-app/user';
import { Util } from 'src/app/providers/util.service';
import { CountryLocale } from 'src/app/types/constants/country-locale.constants';
import { ShipmentTypesConstants } from 'src/app/types/constants/shipment-types.constants';
import { getConfirmedShipmentDetailsBegin } from '../../../+store/shipping.actions';
import * as fromShippingSelector from '../../../+store/shipping.selectors';

@Component({
  selector: 'recently-shipped',
  templateUrl: './recently-shipped.component.html',
  styleUrls: ['./recently-shipped.component.scss'],
})
export class RecentlyShippedComponent implements OnInit {
  subs = new Subscription();
  confirmedShipments = [];
  trackingUrl = '';
  displyMessage: boolean;
  constructor(
    private appStore: Store<AppState>,
    private config: ConfigService,
    public util: Util
  ) {
    const FEDEX_DOMAIN = this.config.getSettings('FEDEX_DOMAIN');
    this.trackingUrl = this.util.joinStrings('', FEDEX_DOMAIN.HOST, FEDEX_DOMAIN.APPS_ISLAND);
  }

  ngOnInit() {
    this.handlePendingShipmentSuccess();
    this.getShipmentDetails();
  }

  ngOnDestroy() {
    if (this.subs) {
      this.subs.unsubscribe();
    }
  }

  getShipmentDetails() {
    this.appStore.pipe(select(fromShippingSelector.selectUserLoginDetails))
      .subscribe((userloginDetails: IUser) => {
        if (userloginDetails) {
          this.appStore.dispatch(getConfirmedShipmentDetailsBegin({ uid: userloginDetails.userId, status: ShipmentTypesConstants.CONFIRMED }));
        }
      });
  }

  handlePendingShipmentSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectConfirmedShipmentDetails)).subscribe((shipments) => {
        if (shipments != null && (Object.keys(shipments[0])?.length === 0)) {
          this.displyMessage = true;
        }
        if (shipments && shipments[0].shipDate) {
          this.confirmedShipments = shipments.map(this.getMonthAndDay);
        }
      })
    );
  }

  getMonthAndDay(shipment: any) {
    const date = shipment.shipDate.split('-');
    shipment = { ...shipment, month: date[0], date: date[1] };
    return shipment;
  }

  openTrackingUrl(shipment: any) {
    const trackingnumber = shipment.trackingNumbers[0].masterTrackingNumber;
    const countryCode = shipment.shipper.address.countryCode;
    const locale = CountryLocale.getAPIHeaderLocale();
    const trackingUrl = this.trackingUrl.concat(`?trknbr=${trackingnumber}`);
    window.open(trackingUrl, '_blank');
  }
}