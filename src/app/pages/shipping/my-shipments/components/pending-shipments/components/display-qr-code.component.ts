import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ConfigService } from '@ngx-config/core';
import { Util } from 'src/app/providers/util.service';

@Component({
  selector: 'display-qr-code',
  templateUrl: './display-qr-code.component.html',
  styleUrls: ['./display-qr-code.component.scss'],
})
export class DisplayQrCodeComponent implements OnInit {
  @Input() referenceNumber: string;
  qrCodeURL = '';
  qrCodeAPI = '';

  constructor(
    public modalController: ModalController,
    private config: ConfigService,
    public util: Util) {
    const API_ISLAND = this.config.getSettings('LOCAL').API_ISLAND;
    this.qrCodeAPI = this.util.joinStrings('', this.config.getSettings('LOCAL').HOST, API_ISLAND.pendingShipmentQrCode);
  }

  ngOnInit() {
    this.getQrCodeImage();
  }

  getQrCodeImage() {
    this.qrCodeURL = this.qrCodeAPI.concat(`?refNumber=${this.referenceNumber}`);
  }

  closeModal() {
    this.modalController.dismiss();
  }
}
