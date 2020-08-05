import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../../app.service';
import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { Settings, AppSettings } from '../../app.settings';
import { Subscription } from 'rxjs';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { Property, Publication } from 'src/app/app.models';
import { environment } from 'src/environments/environment';

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
  constructor(public appSettings: AppSettings, public appService: AppService, public mediaObserver: MediaObserver) {
    this.settings = this.appSettings.settings;
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