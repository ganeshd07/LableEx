import { Component, OnInit } from '@angular/core';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

@Component({
  selector: 'my-shipments',
  templateUrl: './my-shipments.page.html',
  styleUrls: ['./my-shipments.page.scss'],
})
export class MyShipmentsPage implements OnInit {
  defaultHref: string = '';
  backNavPath: string;
  constructor() { }

  ngOnInit() { }

  ngDoCheck() {
    this.backNavPath = sessionStorage.getItem(SessionItems.PREVIOUSURL);
  }

}
