import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { PageAnalytics } from '../types/constants/page-analytics.constants';

declare var sendPageView;
declare var setDebugging;

@Injectable()
export class PageAnalyticsService {

  constructor(private router: Router) { }

  /**
   * This method is used to subscribe to all the route navigation
   * No need to capture url invidually to send page view to analytics
   * 
   */
  registerPageViews() {
    if (environment.page_analytics) {
      setDebugging(environment.analytics_debug, environment.state);
      this.router.events.subscribe(event => {
        if (event instanceof NavigationEnd) {
          const pageId = PageAnalytics.getPageId(event.url);
          if (pageId) {
            sendPageView(pageId);
          } else {
            console.error('Data-Analytics: Page ID not found for route<', event.url, '>');
          }
        }
      });
    }
  }

  /**
    * This method is used to publish page views by manually 
    * entering route or mapping route to match with the 
    * given analytics page ids
    * 
    * This is used if the page/view is not able to capture via registerPageViews()
    * 
    * @param route 
    */
  publishPageView(route: string) {
    if (environment.page_analytics) {
      const pageId = PageAnalytics.getPageId(route);
      if (pageId) {
        sendPageView(pageId);
      } else {
        console.error('Data-Analytics: Page ID not found for route<', route, '>');
      }
    }
  }
}
