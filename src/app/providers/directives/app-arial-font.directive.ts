
import { Directive, DoCheck, ElementRef } from '@angular/core';
import { ConfigService } from '@ngx-config/core';
import { SessionItems } from 'src/app/types/enum/session-items.enum';

@Directive({
  selector:
    'div,' +
    'span,' +
    'ion-label,' +
    'ion-title,' +
    'ion-input,' +
    'ion-text,' +
    'ion-button,' +
    'ion-card-title,' +
    'ion-col,' +
    'ion-note,' +
    'button,' +
    'a,' +
    'p,' +
    'h2,' +
    'h3,' +
    'h4,' +
    'inputs,' +
    'ion-select-option' +
    'button'
})
export class AppArialFontDirective implements DoCheck {
  selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
  constructor(public element: ElementRef<HTMLElement>,
    private readonly config: ConfigService) { }

  ngDoCheck() {
    if (this.selectedLanguage !== sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE))
      this.selectedLanguage = sessionStorage.getItem(SessionItems.SELECTEDLANGUAGE);
    this.changeCssClass();
  }

  changeCssClass() {
    const isToApplyArialFont = this.config.getSettings('ARIAL_FONT_LANGUAGE_LIST').includes(this.selectedLanguage) ? true : false;
    if (isToApplyArialFont) {
      this.element.nativeElement.classList.add('arial-font');
      if (this.element.nativeElement.tagName === 'ION-LABEL')
        this.element.nativeElement.classList.add('arial-font-padding');
    } else {
      this.element.nativeElement.classList.remove('arial-font');
      this.element.nativeElement.classList.remove('arial-font-padding');
    }
  }
}
