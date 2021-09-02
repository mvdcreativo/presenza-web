import { Component, OnInit, ViewChild, HostListener,Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { Property, Publication } from 'src/app/app.models';
import { AppSettings, Settings } from 'src/app/app.settings';
import { CompareOverviewComponent } from 'src/app/shared/compare-overview/compare-overview.component';
import { DomSanitizer, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';
import { MatIconRegistry } from '@angular/material/icon';

import { EmbedVideoService } from 'ngx-embed-video';


///icono check
const iconCheck = `
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs" version="1.1" width="512" height="512" x="0" y="0" viewBox="0 0 512.00533 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(0.6699999999999999,0,0,0.6699999999999999,84.48080566406247,102.44107421875015)"><path xmlns="http://www.w3.org/2000/svg" d="m306.582031 317.25c-12.074219 12.097656-28.160156 18.753906-45.25 18.753906-17.085937 0-33.171875-6.65625-45.246093-18.753906l-90.667969-90.664062c-12.09375-12.078126-18.75-28.160157-18.75-45.25 0-17.089844 6.65625-33.171876 18.75-45.246094 12.074219-12.097656 28.160156-18.753906 45.25-18.753906 17.085937 0 33.171875 6.65625 45.246093 18.753906l45.417969 45.394531 125.378907-125.375c-40.960938-34.921875-93.996094-56.10546875-152.042969-56.10546875-129.601563 0-234.667969 105.06640575-234.667969 234.66406275 0 129.601562 105.066406 234.667969 234.667969 234.667969 129.597656 0 234.664062-105.066407 234.664062-234.667969 0-24.253907-3.6875-47.636719-10.515625-69.652344zm0 0" fill="#96dfb9" data-original="#4caf50" style="" class=""/><path xmlns="http://www.w3.org/2000/svg" d="m261.332031 293.335938c-5.460937 0-10.921875-2.089844-15.082031-6.25l-90.664062-90.667969c-8.34375-8.339844-8.34375-21.824219 0-30.164063 8.339843-8.34375 21.820312-8.34375 30.164062 0l75.582031 75.582032 214.253907-214.25c8.339843-8.339844 21.820312-8.339844 30.164062 0 8.339844 8.34375 8.339844 21.824218 0 30.167968l-229.335938 229.332032c-4.15625 4.160156-9.621093 6.25-15.082031 6.25zm0 0" fill="#00ad7f" data-original="#2196f3" style="" class=""/></g></svg>`;

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss']
})
export class PropertyComponent implements OnInit {
  @ViewChild('sidenav') sidenav: any;

  public storageAPI = environment.storageAPI;
  public defaulIconFeature = `${this.storageAPI}images/icons/tick.svg`
  public sidenavOpen: boolean = true;

  private sub: any;
  public property: Property;
  public settings: Settings;
  public relatedProperties: Publication[];
  public featuredProperties: Publication[];
  public mortgageForm: FormGroup;
  public monthlyPayment: any;
  publication: Publication;
  propertyFeatures: any[];
//////
  params = {
    autoplay: 1,
    muted: 1,
    controls: 0,
    allow:"autoplay; fullscreen; picture-in-picture"
  };
  iframe_html: any;

  onMessage(event: CustomEvent<any>) {
    const message = event.detail;
    // ...
  }
/////
  constructor(
    public appSettings: AppSettings,
    public appService: AppService,
    private activatedRoute: ActivatedRoute,
    public fb: FormBuilder,
    private meta: Meta,
    @Inject(DOCUMENT) private document,
    public iconRegistry: MatIconRegistry, 
    public sanitizer: DomSanitizer,
    private embedService: EmbedVideoService
    ) 
  {
    iconRegistry.addSvgIconLiteral('iconCheck', sanitizer.bypassSecurityTrustHtml(iconCheck));
    this.settings = this.appSettings.settings;
    this.meta.addTags([
      { name: 'twitter:card', content: 'summary_large_image' },
      // { name: 'twitter:site', content: '@themeseason' },
      { name: 'twitter:title', content: this.property?.title },
      { name: 'twitter:description', content: this.property?.description },
      { name: 'twitter:image', content: this.property?.images[0].url_medium },
      { name: 'og:title', content: this.property?.title },
      { name: 'og:description', content: this.property?.description },
      { name: 'og:image', content: this.property?.images[0].url_medium },
      { name: 'og:url', content: 'https://www.presenzaprop.com.ar/propiedades/'+ this.publication?.id},
      { name: 'og:site_name', content: 'Inmobiliaria Presenza' },
      { name: 'og:type', content: 'website' }
    ]);
  }

  ngOnInit() {
    this.sub = this.activatedRoute.params.subscribe(params => {
      this.getPropertyBySlug(params['slug']);
      
    });
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

  public getPropertyBySlug(slug) {
    this.appService.getPropertyBySlug(slug).subscribe((data: any) => {
      this.getRelatedProperties();
      this.getFeaturedProperties();
      this.property = data.property;
      this.publication = data;
      this.property ? this.embedVideo() : false

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


      setTimeout(() => {
        // this.config.observer = true;
        // this.config2.observer = true;
        // this.swipers.forEach(swiper => {
        //   if (swiper) {
        //     swiper.setIndex(0);
        //   }
        // });
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


  int(value){
    // console.log(parseFloat(value));
    
    return parseFloat(value)
  }
      
  public getStatusBgColor(status){
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
  

 embedVideo(){
   if(this.property?.videos[0]?.url)
   {
     this.iframe_html = this.embedService.embed(this.property?.videos[0]?.url, {
       query: { 
         portrait: 0, 
         // color: '333',
         autopause:0,
         badge:0
       },
       attr: { 
          
         // height: 200 , 
         allow:"autoplay; fullscreen; picture-in-picture",
         frameborder:"0",
         allowfullscreen:"true"
       }
     });
    }

   }
//  <iframe src="https://player.vimeo.com/video/520589318?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" width="1332" height="720" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Configuraci&amp;oacute;n 2020-05-02 11-00-24.mp4"></iframe>

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
       
      this.relatedProperties = publications.filter(v => v.id != this.publication.id);
    })
  }

  public getFeaturedProperties() {
    this.appService.getFeaturedProperties().subscribe((publications: any) => {
      this.featuredProperties = publications.slice(0, 3);
    })
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