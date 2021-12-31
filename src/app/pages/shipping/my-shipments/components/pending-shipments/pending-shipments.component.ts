import { Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { AppState } from 'src/app/+store/app.state';
import { getPendingShipmentDetailsBegin } from '../../../+store/shipping.actions';
import * as fromShippingSelector from '../../../+store/shipping.selectors';
import { Subscription } from 'rxjs';
import { ShipmentTypesConstants } from 'src/app/types/constants/shipment-types.constants';
import { DisplayQrCodeComponent } from './components/display-qr-code.component';
import { ModalController } from '@ionic/angular';
import { IUser } from 'src/app/interfaces/shipping-app/user';

@Component({
  selector: 'pending-shipments',
  templateUrl: './pending-shipments.component.html',
  styleUrls: ['./pending-shipments.component.scss'],
})
export class PendingShipmentsComponent implements OnInit {
  subs = new Subscription();
  pendingShipments = [];
  displyMessage: boolean;
  constructor(
    private appStore: Store<AppState>,
    public modalCtrl: ModalController
  ) { }

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
          this.appStore.dispatch(getPendingShipmentDetailsBegin({ uid: userloginDetails.userId, status: ShipmentTypesConstants.PENDING }));
        }
      });
  }

  handlePendingShipmentSuccess() {
    this.subs.add(
      this.appStore.pipe(select(fromShippingSelector.selectPendingShipmentDetails)).subscribe((shipments) => {
        if (shipments != null && (Object.keys(shipments[0]).length === 0)) {
          this.displyMessage = true;
        }
        if (shipments && shipments[0].createDate) {
          this.pendingShipments = shipments.map(this.getMonthAndDay);
        }
      })
    );
  }

  getMonthAndDay(shipment: any) {
    const date = shipment.createDate.split('-');
    shipment = { ...shipment, month: date[0], date: date[1] };
    return shipment;
  }

  async onClickShipment(shipment: any) {
    const modal = await this.modalCtrl.create({
      component: DisplayQrCodeComponent,
      cssClass: 'qrCode-component-modal',
      componentProps: {
        referenceNumber: shipment.refNumber
      }
    });
    return await modal.present();
  };
}
