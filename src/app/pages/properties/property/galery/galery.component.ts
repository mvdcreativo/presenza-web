import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { PaginationOptions, ScrollbarOptions, SwiperOptions } from 'swiper';


@Component({
  selector: 'app-galery',
  templateUrl: './galery.component.html',
  styleUrls: ['./galery.component.scss']
})
export class GaleryComponent implements OnInit, AfterViewInit {
  @Input()images = []
  @Output() addCompare: EventEmitter<any> = new EventEmitter();
  @Output() onCompareCheck: EventEmitter<any> = new EventEmitter();

  public index;
  public config: SwiperConfigInterface = {};
  public config2: SwiperConfigInterface = {};
  constructor() { }

  @ViewChildren(SwiperDirective) swipers: QueryList<SwiperDirective>;


  ngOnInit(): void {
  }


  ngAfterViewInit() {
    this.config = {
      observer: false,
      slidesPerView: 1,
      spaceBetween: 0,
      keyboard: true,
      navigation: true,
      pagination: false,
      grabCursor: true,
      loop: false,
      preloadImages: false,
      lazy: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false
      }
    };

    this.config2 = {
      observer: false,
      slidesPerView: 10,
      spaceBetween: 16,
      keyboard: true,
      navigation: false,
      pagination: false,
      grabCursor: true,
      loop: false,
      preloadImages: false,
      lazy: true,
      breakpoints: {
        480: {
          slidesPerView: 4
        },
        600: {
          slidesPerView: 6,
        }
      }
    }

  }


  public onIndexChange(index: number) {
    this.swipers.forEach(swiper => {
      let elem = swiper['elementRef'].nativeElement;
      if (elem.id == 'small-carousel') {
        swiper.setIndex(index);
        for (let i = 0; i < elem.children[0].children.length; i++) {
          const element = elem.children[0].children[i];
          if (element.classList.contains('thumb-' + index)) {
            element.classList.add('active-thumb');
          }
          else {
            element.classList.remove('active-thumb');
          }
        }
      }
    });
  }

  public selectImage(index: number) {
    this.swipers.forEach(swiper => {
      if (swiper['elementRef'].nativeElement.id == 'main-carousel') {
        swiper.setIndex(index);
      }
    });
  }


  addToCompare(){
    this.addCompare.emit()
  }

  onCompare(){
    this.onCompareCheck.emit()
  }
}
