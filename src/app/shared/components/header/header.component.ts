import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() title = '';
  @Input() backbuttonFlag = false;
  @Input() defaultHref = '';
  @Input() backNavigation = '';
  @Input() menuButtonFlag = true;
  constructor() { }

  ngOnInit() {
  }

}
