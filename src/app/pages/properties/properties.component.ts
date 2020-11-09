import { Component, OnInit, ViewChild, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, pairwise, throttleTime } from 'rxjs/operators';
import { Settings, AppSettings } from '../../app.settings';
import { AppService } from '../../app.service';
import { Property, Pagination, Publication, Feature, ResponsePaginate } from '../../app.models';
import { isPlatformBrowser } from '@angular/common';
import { toFormData } from 'src/app/shared/utils/forms/to-form-data';
import { FormArray, FormGroup } from '@angular/forms';


@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss']
})
export class PropertiesComponent implements OnInit {
  @ViewChild('sidenav') sidenav: any;
  public sidenavOpen: boolean = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;


  public psConfig: PerfectScrollbarConfigInterface = {
    wheelPropagation: true
  };
  public properties: Observable<Publication[]>;
  public viewType: string = 'grid';
  public viewCol: number = 33.3;
  public count: number = 12;
  public sort: string;
  public searchFields: any;
  public removedSearchField: string;
  public message: string;

  public settings: Settings
  public features: Feature[];

  totalResut: number;
  page = 1;
  perPage: number = 6;
  orden: string = 'desc';
  filter: string = '';
  result: Observable<ResponsePaginate>;
  subscriptions: Subscription[]=[];
  lastPage: number;

  constructor(public appSettings: AppSettings,
    public appService: AppService,
    public mediaObserver: MediaObserver,
    public ngZone: NgZone,
    @Inject(PLATFORM_ID) private platformId: Object) {
    this.result = this.appService.resultItems$;

    this.settings = this.appSettings.settings;
    this.subscriptions.push(
        mediaObserver.media$.subscribe((change: MediaChange) => {
        if (change.mqAlias == 'xs') {
          this.sidenavOpen = false;
          this.viewCol = 100;
        }
        else if (change.mqAlias == 'sm') {
          this.sidenavOpen = false;
          this.viewCol = 50;
        }
        else if (change.mqAlias == 'md') {
          this.viewCol = 50;
          this.sidenavOpen = true;
        }
        else {
          this.viewCol = 33.3;
          this.sidenavOpen = true;
        }
      })
    )

  }

  ngOnInit() {
    this.appService.getFeatures().subscribe(
      resFeatures => {
        this.features = resFeatures.filter(
          feature => {
            return feature.features.length === 0 && feature.type !== "MUTY"
          }
        )

        this.getProperties(this.page, this.perPage, this.filter, this.searchFields, this.orden)

    })


  }



  ngOnDestroy() {
    this.subscriptions.map(v=> v.unsubscribe() );
  }

  public getProperties(currentPage?, perPage?, filter?, features_parameter?, sort?) {

    this.appService.getProperties(currentPage, perPage, filter, features_parameter, sort).subscribe(data => {
      console.log(data.data);
      this.loadData()

      this.message = null;
    })
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

        }
      )
    )
  }


  // public filterData(data) {
  //   // return this.appService.filterData(data, this.searchFields, this.sort, this.pagination.page, this.pagination.perPage, this.features);
  // }

  public searchClicked() {
    // this.properties.length = 0;
    // this.getProperties(); 
    // if (isPlatformBrowser(this.platformId)) {
    //   window.scrollTo(0,0);
    // }
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

  public removeSearchField(field) {
    this.message = null;
    this.removedSearchField = field;
  }


  public changeSorting(sort) {    
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
  public changeViewType(obj) {
    this.viewType = obj.viewType;
    this.viewCol = obj.viewCol;
  }


  onScroll(){
    console.log("scroll");
    if(this.lastPage > this.page){
      this.page++;
      this.subscriptions.push(
        this.appService.getNexProperties(this.page, this.perPage, this.filter, this.searchFields, this.orden).subscribe()
      ) 
    }
  }
}