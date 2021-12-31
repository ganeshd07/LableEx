import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable()
export class BrowserService {
    public isbrowser: boolean;
    constructor(@Inject(PLATFORM_ID) private platformId: any) {
        if (isPlatformBrowser(this.platformId)) {
            this.isbrowser = true;
        } else {
            this.isbrowser = false;
        }
    }
}
