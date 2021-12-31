import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'shipment-purpose-bubble-hint',
  templateUrl: './shipment-purpose-bubble-hint.component.html',
  styleUrls: ['./shipment-purpose-bubble-hint.component.scss'],
})
export class ShipmentPurposeBubbleHintComponent implements OnInit {

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {}

  closeNavigation() {
    this.modalCtrl.dismiss();
  }

}
