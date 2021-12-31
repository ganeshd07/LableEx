import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'signature-option-bubble-hint',
  templateUrl: './signature-option-bubble-hint.component.html',
  styleUrls: ['./signature-option-bubble-hint.component.scss'],
})
export class SignatureOptionBubbleHintComponent implements OnInit {

  constructor(public modalCtrl: ModalController) { }

  ngOnInit() {}

  closeNavigation() {
    this.modalCtrl.dismiss();
  }

}
