import { Component, OnInit, ViewChild, HostListener, ViewChildren, QueryList, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { Property, Publication } from 'src/app/app.models';
import { SwiperConfigInterface, SwiperDirective } from 'ngx-swiper-wrapper';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { AppSettings, Settings } from 'src/app/app.settings';
import { CompareOverviewComponent } from 'src/app/shared/compare-overview/compare-overview.component';
import { EmbedVideoService } from 'ngx-embed-video';
import { emailValidator } from 'src/app/theme/utils/app-validators';
import { Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { map, take, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss']
})
export class PropertyComponent implements OnInit {
  @ViewChild('sidenav') sidenav: any;
  @ViewChildren(SwiperDirective) swipers: QueryList<SwiperDirective>;
  public psConfig: PerfectScrollbarConfigInterface = {
    wheelPropagation: true
  };
  public storageAPI = environment.storageAPI;
  public defaulIconFeature = `${this.storageAPI}images/icons/tick.svg`
  public sidenavOpen: boolean = true;
  public config: SwiperConfigInterface = {};
  public config2: SwiperConfigInterface = {};
  private sub: any;
  public property: Property;
  public settings: Settings;
  public embedVideo: any;
  public relatedProperties: Publication[];
  public featuredProperties: Publication[];
  public agent: any;
  public mortgageForm: FormGroup;
  public monthlyPayment: any;
  public contactForm: FormGroup;
  publication: Publication;
  propertyFeatures: any[];

  constructor(public appSettings: AppSettings,
    public appService: AppService,
    private activatedRoute: ActivatedRoute,
    private embedService: EmbedVideoService,
    public fb: FormBuilder,
    private meta: Meta,
    private http: HttpClient,
    @Inject(DOCUMENT) private document) {
    this.settings = this.appSettings.settings;
    this.meta.addTags([
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@themeseason' },
      { name: 'twitter:title', content: 'Property Name' },
      { name: 'twitter:description', content: 'Property description' },
      { name: 'twitter:image', content: 'https://fakeimg.pl/600x400/' },
      { name: 'og:title', content: 'Property Name' },
      { name: 'og:description', content: 'Property description' },
      { name: 'og:image', content: 'https://fakeimg.pl/600x400/' },
      { name: 'og:url', content: 'http://themeseason.com' },
      { name: 'og:site_name', content: 'HouseKey' },
      { name: 'og:type', content: 'website' }
    ]);
  }

  ngOnInit() {
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.getPropertyById(params['id']);
    });
    this.getRelatedProperties();
    this.getFeaturedProperties();
    this.getAgent(1);
    if (window.innerWidth < 960) {
      this.sidenavOpen = false;
      if (this.sidenav) {
        this.sidenav.close();
      }
    };
    this.mortgageForm = this.fb.group({
      principalAmount: ['', Validators.required],
      downPayment: ['', Validators.required],
      interestRate: ['', Validators.required],
      period: ['', Validators.required]
    });
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', Validators.compose([Validators.required, emailValidator])],
      phone: ['', Validators.required],
      message: ['', Validators.required]
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
    this.meta.removeTag('name="twitter:card"');
    this.meta.removeTag('name="twitter:site"');
    this.meta.removeTag('name="twitter:title"');
    this.meta.removeTag('name="twitter:description"');
    this.meta.removeTag('name="twitter:image"');
    this.meta.removeTag('name="og:title"');
    this.meta.removeTag('name="og:description"');
    this.meta.removeTag('name="og:image"');
    this.meta.removeTag('name="og:url"');
    this.meta.removeTag('name="og:site_name"');
    this.meta.removeTag('name="og:type"');
  }

  @HostListener('window:resize')
  public onWindowResize(): void {
    (window.innerWidth < 960) ? this.sidenavOpen = false : this.sidenavOpen = true;
  }

  public getPropertyById(id) {
    this.appService.getPropertyById(id).subscribe((data: any) => {
      console.log(data);

      this.property = data.property;
      this.publication = data;


      ////Mapeamos y fomateamos las Features      
      this.propertyFeatures = this.property.features.map(
        f => {
          let similares = this.property.features.filter(v => v.feature_id === f.feature_id)
          return { name: f.feature.name, id: f.feature.id, features: [...similares] }
        }
      ).filter((f, index, self) =>
        index === self.findIndex((t) => (
          t.id === f.id && t.name === f.name
        ))
      )
      // console.log(this.propertyFeatures);
      //////////



      this.embedVideo = this.embedService.embed("https://www.360cities.net/video/home");
      setTimeout(() => {
        this.config.observer = true;
        this.config2.observer = true;
        this.swipers.forEach(swiper => {
          if (swiper) {
            swiper.setIndex(0);
          }
        });
      });

      let port = (this.document.location.port) ? ':' + this.document.location.port + '/' : '/';
      let url = this.document.location.protocol + '//' + this.document.location.hostname + port;
      this.meta.updateTag({ name: 'twitter:title', content: this.property.title });
      this.meta.updateTag({ name: 'twitter:description', content: this.property.description });
      this.meta.updateTag({ name: 'twitter:image', content: url + this.property.images[0] });
      this.meta.updateTag({ name: 'og:title', content: this.property.title });
      this.meta.updateTag({ name: 'og:description', content: this.property.description });
      this.meta.updateTag({ name: 'og:image', content: url + this.property.images[0] });

    });
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




    // this.http.get(`${this.storageAPI}images/icons/${slug}.svg`).pipe(take(1)).subscribe(
    //   res => res,
    //   error => console.log(error)



    // )

      

  

  public onOpenedChange() {
    this.swipers.forEach(swiper => {
      if (swiper) {
        swiper.update();
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

  public addToCompare() {
    this.appService.addToCompare(this.publication, CompareOverviewComponent, (this.settings.rtl) ? 'rtl' : 'ltr');
  }

  public onCompare() {
    return this.appService.Data.compareList.filter(item => item.id == this.property.id)[0];
  }

  public addToFavorites() {
    this.appService.addToFavorites(this.publication, (this.settings.rtl) ? 'rtl' : 'ltr');
  }

  public onFavorites() {
    return this.appService.Data.favorites.filter(item => item.id == this.property.id)[0];
  }

  public getRelatedProperties() {
    this.appService.getRelatedProperties().subscribe((publications: any) => {
      this.relatedProperties = publications;
    })
  }

  public getFeaturedProperties() {
    this.appService.getFeaturedProperties().subscribe((publications: any) => {
      this.featuredProperties = publications.slice(0, 3);
    })
  }

  public getAgent(agentId: number = 1) {
    var ids = [1, 2, 3, 4, 5]; //agent ids 
    agentId = ids[Math.floor(Math.random() * ids.length)]; //random agent id
    this.agent = this.appService.getAgents().filter(agent => agent.id == agentId)[0];
  }

  public onContactFormSubmit(values: Object) {
    if (this.contactForm.valid) {
      console.log(values);
    }
  }

  public onMortgageFormSubmit(values: Object) {
    if (this.mortgageForm.valid) {
      var principalAmount = values['principalAmount']
      var down = values['downPayment']
      var interest = values['interestRate']
      var term = values['period']
      this.monthlyPayment = this.calculateMortgage(principalAmount, down, interest / 100 / 12, term * 12).toFixed(2);
    }
  }
  public calculateMortgage(principalAmount: any, downPayment: any, interestRate: any, period: any) {
    return ((principalAmount - downPayment) * interestRate) / (1 - Math.pow(1 + interestRate, -period));
  }

}