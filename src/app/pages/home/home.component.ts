import { Component, OnInit } from '@angular/core';
import { Settings, AppSettings } from '../../app.settings';
import { AppService } from '../../app.service';
import { Property, Pagination, Publication, ResponsePaginate, Feature } from '../../app.models';

import { Observable, Subscription } from 'rxjs';
import { MediaChange, MediaObserver } from '@angular/flex-layout'; 
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  watcher: Subscription;
  activeMediaQuery = ''; 

  public slides = [];
  public properties: Observable<Publication[]>;
  public viewType: string = 'grid';
  public viewCol: number = 25;
  public sort: string;
  public searchFields: any;
  public removedSearchField: string;
  public message:string;
  public featuredProperties: Observable<Publication[]>;

  hotOfferToday_id = 3;
  public features: Feature[];

  totalResut: number;
  page = 1;
  perPage: number = 8;
  orden: string = 'desc';
  filter: string = '';
  result: Observable<ResponsePaginate>;
  subscriptions: Subscription[]=[];
  lastPage: number;

  public settings: Settings;
  
  constructor(public appSettings:AppSettings, public appService:AppService, public mediaObserver: MediaObserver) {
    this.settings = this.appSettings.settings;
    this.result = this.appService.resultItems$;

    this.watcher = mediaObserver.media$.subscribe((change: MediaChange) => {
      // console.log(change)
      if(change.mqAlias == 'xs') {
        this.viewCol = 100;
      }
      else if(change.mqAlias == 'sm'){
        this.viewCol = 50;
      }
      else if(change.mqAlias == 'md'){
        this.viewCol = 33.3;
      }
      else{
        this.viewCol = 25;
      }
    });

  }

  ngOnInit() {  
    this.getSlides();
    
    this.appService.getFeatures().subscribe(
      resFeatures => {
        this.features = resFeatures.filter(
          feature => {
            return feature.features.length === 0 && feature.type !== "MUTY"
          }
        )

        this.getProperties(this.page, this.perPage, this.filter, this.searchFields, this.orden)
        
        
    })
    // if (this.mediaObserver.isActive('xs')) {
    //    console.log('mobile version -XS')
    // }
    
  }
  

  loadData() {
    this.properties = this.result.pipe(map(v => v.data.data))

    
    this.subscriptions.push(
      this.result.subscribe(
        res=> {
          this.page = res.data.current_page;
          this.perPage = res.data.per_page;
          this.totalResut = res.data.total;
          this.lastPage = res.data.last_page;
          this.getFeaturedProperties()

        }
      )
    )
  }

  
  ngDoCheck(){
    if(this.settings.loadMore.load){     
      this.settings.loadMore.load = false;     
      this.getProperties();  
    }
  }

  ngOnDestroy(){
    // this.resetLoadMore();
    this.watcher.unsubscribe();
  }

  public getSlides(){
    this.appService.getHomeCarouselSlides().subscribe(res=>{
      this.slides = res;
    })
  }

  public getProperties(currentPage?, perPage?, filter?, features_parameter?, sort?) {

    this.appService.getProperties(currentPage, perPage, filter, features_parameter, sort).subscribe(data => {
      // console.log(data.data);
      this.loadData()
      
      this.message = null;
    })
  }

  public searchClicked(){ 
    // this.properties.length = 0;
    // this.getProperties(); 
  }

  public searchChanged(event: FormGroup) {
    event.valueChanges.subscribe(() => {
      // this.resetPagination(); 
      this.searchFields = event.value

      setTimeout(() => {
        this.removedSearchField = null;
      });
      if (!this.settings.searchOnBtnClick) {
        // this.properties.length = 0;  
      }
    });
    event.valueChanges.pipe(debounceTime(500), distinctUntilChanged()).subscribe(() => {
      if (!this.settings.searchOnBtnClick) {

        // borra criterios null
        function clean(obj) {
          for (var propName in obj) {
            if (obj[propName] === null || obj[propName] === undefined || obj[propName] === false) {
              delete obj[propName];
            }

          }
        }
        clean(this.searchFields);
        console.log(this.searchFields);
        
        //////////////////////////
        this.page = 1;
        this.getProperties(this.page, this.perPage, this.filter, this.searchFields, this.orden)
        // console.log(this.searchFields);

      }
    });
  }



  public removeSearchField(field){ 
    this.message = null;   
    this.removedSearchField = field; 
  } 
 


  // public changeCount(count){
  //   this.count = count;
  //   this.resetLoadMore();   
  //   this.properties.length = 0;
  //   this.getProperties();

  // }
  public changeSorting(sort){    
   
    // this.properties.length = 0;
    switch (sort) {
      case 'Orden por Defecto':
        this.orden = 'desc';
        break;
      case 'Publicaciones más Nuevas':
        this.orden = 'desc';
        break;
      case 'Publicaciones más Antiguas':
        this.orden = 'asc';
        break;

      default:
        this.orden = 'desc';
        break;
    }
    this.page = 1;
    this.getProperties(this.page, this.perPage, this.filter, this.searchFields, this.orden)
  }
  public changeViewType(obj){ 
    this.viewType = obj.viewType;
    this.viewCol = obj.viewCol; 
  }


  public getFeaturedProperties(){
    /////status 3 son los destacados. si se cambia ese dato en backend se debe modificar aquí
    this.featuredProperties = this.appService.getStatusProperties(3)
    // this.appService.getFeaturedProperties().subscribe((publications:any)=>{
    //   this.featuredProperties = publications.property;
    // })
  } 

}
