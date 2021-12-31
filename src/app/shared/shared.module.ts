import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header.component';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { TimeFormatPipe } from '../providers/directives/time-format.pipe';
import { DateFormatPipe } from 'src/app/providers/directives/date-format.pipe';
import { HtmlSanitizer } from 'src/app/providers/directives/html-sanitizer.pipe';
import { ReplaceLeadingZerosDirective } from '../providers/directives/replace-leading-zeros.directive';
import { RestrictInputLengthDirective } from '../providers/directives/restrict-input-length.directive';
import { RestrictInputDirective } from '../providers/directives/restrict-input.directive';
import { CustomRestrictInputDirective } from '../providers/directives/custom-restrict-input.directive';
import { LocalDateFormatPipe } from '../providers/directives/local-date-format.pipe';
import { LazyLoadingImgDirective } from '../providers/directives/lazy-loading-img.directive';
import { AppArialFontDirective } from '../providers/directives/app-arial-font.directive';
import { config } from 'src/assets/config/development';
import { SessionItems } from '../types/enum/session-items.enum';

@NgModule({
  declarations: [
    HeaderComponent,
    DateFormatPipe,
    LocalDateFormatPipe,
    TimeFormatPipe,
    HtmlSanitizer,
    ReplaceLeadingZerosDirective,
    RestrictInputLengthDirective,
    RestrictInputDirective,
    CustomRestrictInputDirective,
    LazyLoadingImgDirective,
    AppArialFontDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    IonicModule
  ],
  exports: [
    HeaderComponent,
    IonicModule,
    DateFormatPipe,
    LocalDateFormatPipe,
    TimeFormatPipe,
    HtmlSanitizer,
    ReplaceLeadingZerosDirective,
    RestrictInputLengthDirective,
    RestrictInputDirective,
    CustomRestrictInputDirective,
    LazyLoadingImgDirective,
    AppArialFontDirective
  ]
})
export class SharedModule { }
