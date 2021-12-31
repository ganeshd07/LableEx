import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { IMessages } from 'src/app/interfaces/i-messages';
import { AppSupportedCountry } from '../../../types/enum/app-supported-country.enum';
import { MessageCentreService } from 'src/app/core/providers/local/message-centre.service';
import { MessageCentreResponse } from 'src/app/interfaces/api-service/response/message-centre-response.interface';
import { MessagesCategoryImages } from 'src/app/types/enum/messages-category-img.enum';
import { SessionItems } from 'src/app/types/enum/session-items.enum';
import { OAuthEnum } from 'src/app/types/enum/oauth-enum.enum';
import { interval, Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-message-centre',
  templateUrl: './message-centre.page.html',
  styleUrls: ['./message-centre.page.scss'],
})
export class MessageCentrePage implements OnInit {

  messageCenterList: MessageCentreResponse[];
  dummyMessages: IMessages[] = [];
  selectedLanguage: string;
  selectedCountry: string;
  msgLink: string;
  showBackButton = false;
  isMessagesLoaded = false;
  backNavPath: string;
  cardContent = 'cardContent';
  subscription: Subscription;
  timeInteval = interval(100);

  constructor(
    private translate: TranslateService,
    private router: Router,
    private messageCentreService: MessageCentreService
  ) {
  }

  ngOnInit() {
    this.selectedCountry = sessionStorage.getItem(SessionItems.SELECTEDCOUNTRY);
    this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    this.subscription = this.timeInteval.subscribe(() => {
      if (sessionStorage.getItem(OAuthEnum.LOCAL_STORE_KEY)) {        
        this.getMessageCentreList(this.selectedCountry, this.selectedLanguage);
        this.subscription.unsubscribe();
      }
    });    
  }

  getMessageCentreList(countryCode, language) {
    this.messageCentreService.getMessageCentreList(countryCode, language).subscribe(response => {
      if (response) {
        this.messageCenterList = response;
        this.isMessagesLoaded = true;
        this.updateMessageImgPath();
      }
    });
  }

  updateMessageImgPath() {
    for (const messageDetail of this.messageCenterList) {
      messageDetail.imgPath = MessagesCategoryImages[messageDetail.category];
    }
  }

  ngDoCheck() {
    if (this.selectedLanguage !== sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE)) {
      this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
      this.getMessageCentreList(this.selectedCountry, this.selectedLanguage);
    }
    this.displayBackButton();
  }

  goToLoginPage() {
    this.router.navigate(['/', 'login']);
  }

  displayBackButton() {
    if (sessionStorage.getItem(SessionItems.MESSAGECENTRE) === 'true') {
      this.showBackButton = true;
      this.backNavPath = sessionStorage.getItem(SessionItems.PREVIOUSURL);
      sessionStorage.removeItem(SessionItems.MESSAGECENTRE);
    }
  }

  toggleMessageDetail(index) {
    const itemClass = document.getElementById('cardContent' + index);
    if (this.messageCenterList[index].isExpanded) {
      this.messageCenterList[index].isExpanded = false;
      itemClass.classList.remove('expanded');
      itemClass.classList.add('closed');
    } else {
      this.messageCenterList[index].isExpanded = true;
      itemClass.classList.remove('closed');
      itemClass.classList.add('expanded');
    }
  }
}
