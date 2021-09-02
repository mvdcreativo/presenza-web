import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../../app.service';
import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { Settings, AppSettings } from '../../app.settings';
import { Subscription } from 'rxjs';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Property, Publication } from 'src/app/app.models';
import { environment } from 'src/environments/environment';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

///icono check
const iconCheck = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 512.00533 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(0.6699999999999999,0,0,0.6699999999999999,84.48080566406247,102.44107421875015)"><path xmlns="http://www.w3.org/2000/svg" d="m306.582031 317.25c-12.074219 12.097656-28.160156 18.753906-45.25 18.753906-17.085937 0-33.171875-6.65625-45.246093-18.753906l-90.667969-90.664062c-12.09375-12.078126-18.75-28.160157-18.75-45.25 0-17.089844 6.65625-33.171876 18.75-45.246094 12.074219-12.097656 28.160156-18.753906 45.25-18.753906 17.085937 0 33.171875 6.65625 45.246093 18.753906l45.417969 45.394531 125.378907-125.375c-40.960938-34.921875-93.996094-56.10546875-152.042969-56.10546875-129.601563 0-234.667969 105.06640575-234.667969 234.66406275 0 129.601562 105.066406 234.667969 234.667969 234.667969 129.597656 0 234.664062-105.066407 234.664062-234.667969 0-24.253907-3.6875-47.636719-10.515625-69.652344zm0 0" fill="#96dfb9" data-original="#4caf50" style="" class=""/><path xmlns="http://www.w3.org/2000/svg" d="m261.332031 293.335938c-5.460937 0-10.921875-2.089844-15.082031-6.25l-90.664062-90.667969c-8.34375-8.339844-8.34375-21.824219 0-30.164063 8.339843-8.34375 21.820312-8.34375 30.164062 0l75.582031 75.582032 214.253907-214.25c8.339843-8.339844 21.820312-8.339844 30.164062 0 8.339844 8.34375 8.339844 21.824218 0 30.167968l-229.335938 229.332032c-4.15625 4.160156-9.621093 6.25-15.082031 6.25zm0 0" fill="#00ad7f" data-original="#2196f3" style="" class=""/></g></svg>`;
@Component({
  selector: 'app-compare',
  templateUrl: './compare.component.html',
  styleUrls: ['./compare.component.scss']
})
export class CompareComponent implements OnInit {
  @ViewChild(SwiperDirective) directiveRef: SwiperDirective;
  public config: SwiperConfigInterface = {};
  public watcher: Subscription;
  public settings: Settings;
  public compareList: Publication[];
  constructor(
    public appSettings: AppSettings, 
    public appService: AppService, 
    public mediaObserver: MediaObserver,
    public iconRegistry: MatIconRegistry, 
    public sanitizer: DomSanitizer

    ) {
    this.settings = this.appSettings.settings;
    iconRegistry.addSvgIconLiteral('iconCheck', sanitizer.bypassSecurityTrustHtml(iconCheck));

  }

  public storageAPI = environment.storageAPI;
  public defaulIconFeature = `${this.storageAPI}images/icons/tick.svg`

  ngOnInit() {
    this.config = {
      observer: true,
      slidesPerView: 3,
      spaceBetween: 16,
      keyboard: false,
      navigation: false,
      pagination: false,
      simulateTouch: false,
      grabCursor: true,
      loop: false,
      preloadImages: true,
      lazy: false,
      breakpoints: {
        600: {
          slidesPerView: 1
        },
        960: {
          slidesPerView: 2,
        },
        1280: {
          slidesPerView: 3,
        }
      }
    }
    this.watchForChanges();

    this.compareList = this.appService.Data.compareList

  }

  ngOnDestroy() {
    this.watcher.unsubscribe();
  }


public formatFeatures (publication){
    ////Mapeamos y fomateamos las Features      
    const features = publication.property.features.map(
      f => {
        let similares = publication.property.features.filter(v => v.feature_id === f.feature_id)
        return { name: f.feature.name, id: f.feature.id, features: [...similares] }
      }
    ).filter((f, index, self) =>
      index === self.findIndex((t) => (
        t.id === f.id && t.name === f.name
      ))
    )

    return features
    // console.log(this.propertyFeatures);
    //////////
}

  public getStatusBgColor(status) {
    switch (status) {
      case 1:
        return '#3e92cc';
      case 3:
        return '#d8315b';
      case 4:
        return '#3e92cc';
      // case 'No Fees':
      //   return '#FFA000';
      // case 'Hot Offer':
      //   return '#F44336';
      // case 'Sold':
      //   return '#000';
      default:
        return '#0a2463';
    }
  }

  public disableSwiper() {
    setTimeout(() => {
      if (this.directiveRef) {
        this.config.keyboard = false;
        this.config.navigation = false;
        this.config.simulateTouch = false;
        this.directiveRef.update();
      }
    });
  }
  public enableSwiper() {
    setTimeout(() => {
      if (this.directiveRef) {
        this.config.keyboard = true;
        this.config.navigation = { nextEl: '.carousel-next', prevEl: '.carousel-prev' };
        this.config.simulateTouch = true;
        this.directiveRef.update();
      }
    });
  }

  public clear() {
    this.appService.Data.compareList.length = 0;
  }

  public remove(publication: Publication) {
    const index: number = this.appService.Data.compareList.indexOf(publication);
    if (index !== -1) {
      this.appService.Data.compareList.splice(index, 1);
    }
    this.watchForChanges();
  }

  public watchForChanges() {
    this.watcher = this.mediaObserver.media$.subscribe((change: MediaChange) => {
      if (change.mqAlias == 'xs' && this.appService.Data.compareList.length > 1) {
        this.enableSwiper();
      }
      else if (change.mqAlias == 'sm' && this.appService.Data.compareList.length > 2) {
        this.enableSwiper();
      }
      else if (change.mqAlias == 'md' && this.appService.Data.compareList.length > 3) {
        this.enableSwiper();
      }
      else if (change.mqAlias == 'lg' && this.appService.Data.compareList.length > 4) {
        this.enableSwiper();
      }
      else if (change.mqAlias == 'xl' && this.appService.Data.compareList.length > 4) {
        this.enableSwiper();
      }
      else {
        this.disableSwiper();
      }
    });
  }

}