import { Injectable, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Property, Response, Location, Publication, PropertyTypes, TransactionTypes, State, City, Municipality, Neighborhood, Feature, ResponsePaginate } from './app.models';
import { AppSettings } from './app.settings';
import { isPlatformBrowser } from '@angular/common';
import { environment } from 'src/environments/environment';
import { take, map } from 'rxjs/operators';

export class Data {
  constructor(public properties: Property[],
    public compareList: Publication[],
    public favorites: Publication[],
    public locations: Location[]) { }
}

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private resultSubject$: BehaviorSubject<ResponsePaginate> = new BehaviorSubject(null)
  public get resultItems$() {
    return this.resultSubject$
  }
  public setItemsrResult(value) {
    this.resultSubject$.next(value)

  }


  public Data = new Data(
    [], // properties
    [], // compareList
    [], // favorites
    []  // locations
  )

  public url = environment.API;//API url
  public assetsUrl = environment.urlAssets;

  public apiKey = environment.API_KEY_GM;
  features: any[];

  constructor(public http: HttpClient,
    private bottomSheet: MatBottomSheet,
    private snackBar: MatSnackBar,
    public appSettings: AppSettings,
    @Inject(PLATFORM_ID) private platformId: Object) {


  }



/////////////////PUBLICACIONES
  public getStatusProperties(status): Observable<Publication[]> {
    return this.http.get<ResponsePaginate>(`${environment.API}publications`, {
      params: new HttpParams()
        .set('page', '1')
        .set('status_id', status)
        .set('active', "1")
        .set('filter', '')
        .set('features_parameter', null)
        .set('sort', 'desc')
        .set('per_page', '100000')
      }).pipe(map(
        res => {
          // console.log(res);
          const resp = res.data.data
          return resp;
      }));
         
  }

 ///listar
 getProperties(currentPage = 1, perPage = 20, filter='', features_parameter=null, sort= 'desc') : Observable<ResponsePaginate>{
  return this.http.get<ResponsePaginate>(`${environment.API}publications`, {
    params: new HttpParams()
      .set('page', currentPage.toString())
      .set('active', "1")
      .set('filter', filter)
      .set('features_parameter', JSON.stringify(features_parameter))
      .set('sort', sort)
      .set('per_page', perPage.toString())

    }).pipe(map(
      res => {
        // console.log(res);
        
        this.setItemsrResult(res)
        const resp = res
        return resp;
    })
    
    )
  }

  getNexProperties(currentPage = 1, perPage = 20, filter='', features_parameter=null, sort= 'desc') : Observable<ResponsePaginate>{
    return this.http.get<ResponsePaginate>(`${environment.API}publications`, {
      params: new HttpParams()
        .set('page', currentPage.toString())
        .set('active', "1")
        .set('filter', filter)
        .set('features_parameter', JSON.stringify(features_parameter))
        .set('sort', sort)
        .set('per_page', perPage.toString())
  
      }).pipe(map(
        res => {
          // console.log(res);
          const items = this.resultSubject$.value.data.data;
          let respuesta: ResponsePaginate = Object.assign({}, res);
          respuesta.data.data = [...items, ...respuesta.data.data ]
          // console.log(respuesta);
          this.setItemsrResult(respuesta)
          // this.addItemsResult(res.data.data)
          const resp = res
          return resp;
      })
      
      )
  }
////////////////////////////

  public getPropertyById(id): Observable<Publication> {
    return this.http.get<Response>(`${this.url}publications/${id}`).pipe(map(v=> v.data));
  }

  public getPropertyBySlug(id,slug): Observable<Publication> {

    return this.http.get<Response>(`${this.url}publication_by_slug/${id}/${slug}`).pipe(map(v=> v.data));
  }

  public getFeaturedProperties(): Observable<Publication[]> {
    return this.http.get<ResponsePaginate>(`${this.url}publications`).pipe(map(v=> v.data.data));
  }

  public getRelatedProperties(): Observable<Publication[]> {

    return this.http.get<Response>(`${this.url}publications`, {
      params: new HttpParams()
        .set('active', "1")  
      }).pipe(map(v=> v.data.data));
  }

  public getPropertiesByAgentId(agentId): Observable<Publication[]> {
    return this.http.get<Publication[]>(this.url + 'properties-agentid-' + agentId + '.json');
  }

  public getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(this.url + 'locations.json');
  }

  public getAddress(lat = 40.714224, lng = -73.961452) {
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&key=' + this.apiKey);
  }

  public getLatLng(address) {
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?key=' + this.apiKey + '&address=' + address);
  }

  public getFullAddress(lat = 40.714224, lng = -73.961452) {
    return this.http.get('https://maps.googleapis.com/maps/api/geocode/json?latlng=' + lat + ',' + lng + '&key=' + this.apiKey).subscribe(data => {
      return data['results'][0]['formatted_address'];
    });
  }

  public addToCompare(publication: Publication, component, direction) {
    if (!this.Data.compareList.filter(item => item.id == publication.id)[0]) {
      this.Data.compareList.push(publication);
      this.bottomSheet.open(component, {
        direction: direction
      }).afterDismissed().subscribe(isRedirect => {
        if (isRedirect) {
          if (isPlatformBrowser(this.platformId)) {
            window.scrollTo(0, 0);
          }
        }
      });
    }
  }

  public addToFavorites(Publication: Publication, direction) {
    if (!this.Data.favorites.filter(item => item.id == Publication.id)[0]) {
      this.Data.favorites.push(Publication);
      this.snackBar.open('La propiedad "' + Publication.property.title + '" se agregó a tus favoritos.', '×', {
        verticalPosition: 'top',
        duration: 1000,
        direction: direction
      });
    }
  }

  public getPropertyTypes(): Observable<PropertyTypes[]> {
    return this.http.get<ResponsePaginate>(this.url + 'property_types').pipe(map(v=> v.data.data));
    // return [ 
    //   { id: 1, name: 'Office' },
    //   { id: 2, name: 'House' },
    //   { id: 3, name: 'Apartment' }
    // ]
  }

  public getPropertyStatuses(): Observable<TransactionTypes[]> {
    return this.http.get<ResponsePaginate>(this.url + 'transaction_types').pipe(map(v=> v.data.data));

  }

  public getStates(): Observable<State[]> {
    return this.http.get<ResponsePaginate>(this.url + 'provinces').pipe(map(v=> v.data.data));
  }

  public getCities(): Observable<City[]> {
    return this.http.get<ResponsePaginate>(this.url + 'cities').pipe(map(v=> v.data.data));
  }
  public getMunicipality(): Observable<Municipality[]> {
    return this.http.get<ResponsePaginate>(this.url + 'municipalities').pipe(map(v=> v.data.data));
  }

  public getNeighborhoods(): Observable<Neighborhood[]> {
    return this.http.get<ResponsePaginate>(this.url + 'neighborhoods').pipe(map(v=> v.data.data));
  }


  public getStreets() {
    return [

    ]
  }

  public getFeatures(): Observable<Feature[]> {
    return this.http.get<Response>(this.url + 'features_all').pipe(take(1)).pipe(map(v=> v.data));
  }


  public getHomeCarouselSlides() {
    return this.http.get<any[]>(this.assetsUrl + 'data/slides.json');
  }


  public filterData(data, params: any, sort?, page?, perPage?, features?: Feature[]) {
    console.log(data);
    console.log(params);


    this.getProperties()

    // if (params) {
    //   //FILTRO FEATURES

    //   features.forEach(feature => {
    //     const param = feature.slug;
    //     if (params[param]) {

    //       var properties = []

    //       data.forEach((publication: Publication) => {
    //         const properyFeatures: Feature[] = publication.property.features;
    //         properyFeatures.forEach(
    //           featurePublication => {


    //             if (
    //               featurePublication.pivot.value === params[param].toString()
    //               && featurePublication.slug === param
    //             ) {
    //               if (!properties.includes(publication)) {
    //                 properties.push(publication);
    //               }
    //             }

                



    //             if (featurePublication.type === "OPC"
    //               && params[param] === true
    //               && featurePublication.slug === param
    //             ) {
    //               if (!properties.includes(publication)) {
    //                 properties.push(publication);
    //               }
    //             }



    //             if (featurePublication.type === "VAL100"
    //               && featurePublication.slug === param
    //             ) {

    //               let rango = params[param].split("-")
    //               console.log(rango);
                  
    //               if(parseInt(featurePublication.pivot.value) >= parseInt(rango[0]) 
    //               && parseInt(featurePublication.pivot.value) <= parseInt(rango[1])
    //               ){
                    
    //                 if (!properties.includes(publication)) {
    //                   properties.push(publication);
    //                 }
    //               }
    //             }

    //           //   if (featurePublication.type === "VALSTR"
    //           //   && featurePublication.pivot.value === params[param]
    //           //   && featurePublication.slug === param
    //           //   ) {
    //           //   if (!properties.includes(publication)) {
    //           //     properties.push(publication);
    //           //   }
    //           // }


    //           }
    //         )
    //       })


    //       data = properties
    //       console.log(data);
    //     }

    //   });






    //   //////

    //   if (params.propertyType) {
    //     data = data.filter((publication: Publication) => publication.property.property_type_id === params.propertyType.id)
    //   }
    //   /// Filtro Tipo de Operación
    //   if (params.propertyStatus && params.propertyStatus.length) {
    //     let statuses = [];
    //     params.propertyStatus.forEach(status => { statuses.push(status.id) });
    //     let properties = [];
    //     data.filter((publication: Publication) =>
    //       publication.transaction_types.forEach(status => {
    //         // console.log(status);

    //         if (statuses.indexOf(status.id) > -1) {
    //           if (!properties.includes(publication)) {
    //             properties.push(publication);
    //           }
    //         }
    //       })
    //     );
    //     data = properties;
    //   }
    //   /// Filtro PREIO
    //   if (params?.price) {
    //     if (params.price.from) {
    //       data = data.filter((publication: Publication) => {
    //         let fromVerdadero = false
    //         publication.transaction_types.forEach(transaction => {
    //           if (transaction.pivot?.price >= params.price?.from) {
    //             console.log(transaction.pivot?.price);
    //             fromVerdadero = true
    //           }
    //         });
    //         return fromVerdadero
    //       });
    //     }
    //     if (params?.price?.to) {
    //       data = data.filter((publication: Publication) => {
    //         let toVerdadero = false
    //         publication.transaction_types.forEach(transaction => {
    //           if (transaction.pivot?.price <= params.price?.to) {
    //             console.log(transaction.pivot?.price);
    //             toVerdadero = true
    //           }
    //         });
    //         return toVerdadero
    //       });
    //     }
    //   }

    //   if (params.state) {
    //     data = data.filter(publication => publication.property.neighborhood.municipality.city.province_id == params.state.id)
    //   }
    //   if (params.municipality) {
    //     data = data.filter(publication => publication.property.neighborhood.municipality_id == params.municipality.id)
    //   }
    //   if (params.city) {
    //     data = data.filter(publication => publication.property.neighborhood.municipality.city_id == params.city.id)
    //   }

    //   // if(params.zipCode){
    //   //   data = data.filter(property => property.zipCode == params.zipCode)
    //   // }

    //   if (params.neighborhood && params.neighborhood.length) {
    //     let neighborhoods = [];
    //     params.neighborhood.forEach(item => { neighborhoods.push(item.id) });
    //     let properties = [];
    //     data.filter(publication => {
    //       if (neighborhoods.indexOf(publication.property.neighborhood.id) > -1) {
    //         if (!properties.includes(publication)) {
    //           return properties.push(publication);
    //         }
    //       }

    //     });
    //     data = properties;
    //   }

    //   // if (params.street && params.street.length) {
    //   //   let streets = [];
    //   //   params.street.forEach(item => { streets.push(item.name) });
    //   //   let properties = [];
    //   //   data.filter(property =>
    //   //     property.street.forEach(item => {
    //   //       if (streets.indexOf(item) > -1) {
    //   //         if (!properties.includes(property)) {
    //   //           properties.push(property);
    //   //         }
    //   //       }
    //   //     })
    //   //   );
    //   //   data = properties;
    //   // }

    //   // if (params.bedrooms) {
    //   //   if (params.bedrooms.from) {
    //   //     data = data.filter(property => property.bedrooms >= params.bedrooms.from)
    //   //   }
    //   //   if (params.bedrooms.to) {
    //   //     data = data.filter(property => property.bedrooms <= params.bedrooms.to)
    //   //   }
    //   // }

    //   // if (params.bathrooms) {
    //   //   if (params.bathrooms.from) {
    //   //     data = data.filter(property => property.bathrooms >= params.bathrooms.from)
    //   //   }
    //   //   if (params.bathrooms.to) {
    //   //     data = data.filter(property => property.bathrooms <= params.bathrooms.to)
    //   //   }
    //   // }

    //   // if (params.garages) {
    //   //   if (params.garages.from) {
    //   //     data = data.filter(property => property.garages >= params.garages.from)
    //   //   }
    //   //   if (params.garages.to) {
    //   //     data = data.filter(property => property.garages <= params.garages.to)
    //   //   }
    //   // }

    //   // if (params.area) {
    //   //   if (params.area.from) {
    //   //     data = data.filter(property => property.area.value >= params.area.from)
    //   //   }
    //   //   if (params.area.to) {
    //   //     data = data.filter(property => property.area.value <= params.area.to)
    //   //   }
    //   // }

    //   // if (params.yearBuilt) {
    //   //   if (params.yearBuilt.from) {
    //   //     data = data.filter(property => property.yearBuilt >= params.yearBuilt.from)
    //   //   }
    //   //   if (params.yearBuilt.to) {
    //   //     data = data.filter(property => property.yearBuilt <= params.yearBuilt.to)
    //   //   }
    //   // }

    //   // if (params.features) {
    //   //   let arr = [];
    //   //   params.features.forEach(feature => {
    //   //     if (feature.selected)
    //   //       arr.push(feature.name);
    //   //   });
    //   //   if (arr.length > 0) {
    //   //     let properties = [];
    //   //     data.filter(property =>
    //   //       property.features.forEach(feature => {
    //   //         if (arr.indexOf(feature) > -1) {
    //   //           if (!properties.includes(property)) {
    //   //             properties.push(property);
    //   //           }
    //   //         }
    //   //       })
    //   //     );
    //   //     data = properties;
    //   //   }

    //   // }

    // }


    // // //for show more properties mock data 
    // // for (var index = 0; index < 2; index++) {
    // //   data = data.concat(data);
    // // }

    // this.sortData(sort, data);
    // return this.paginator(data, page, perPage)
  }

  public sortData(sort, data) {
    if (sort) {
      switch (sort) {
        case 'Publicaciones más Nuevas':
          data = data.sort((a, b) => { return <any>new Date(b.created_at) - <any>new Date(a.created_at) });
          break;
        case 'Publicaciones más Antiguas':
          data = data.sort((a, b) => { return <any>new Date(a.created_at) - <any>new Date(b.created_at) });
          break;
        // case 'Popular':
        //   data = data.sort((a, b) => {
        //     if (a.ratingsValue / a.ratingsCount < b.ratingsValue / b.ratingsCount) {
        //       return 1;
        //     }
        //     if (a.ratingsValue / a.ratingsCount > b.ratingsValue / b.ratingsCount) {
        //       return -1;
        //     }
        //     return 0;
        //   });
        //   break;
        case 'Menor Precio':

            data = data.sort((a, b) => {
              a.transaction_types.forEach( (transaction , i)  => {

                let bx = b.transaction_types.find(x => x === transaction.id)
                if(transaction.id === bx?.id && transaction.pivot.currency === bx?.pivot.currency){
                  if (transaction.pivot?.price > bx.pivot?.price) {
                    return 1;
                  }
                  if (transaction.pivot?.price < bx.pivot?.price) {
                    return 1;
                  }
                }else{
                  return 0
                }

              });
         
            })
          
          break;
        case 'Mayor Precio':
          if (this.appSettings.settings.currency == 'USD') {
            data = data.sort((a, b) => {
              if ((a.priceDollar.sale || a.priceDollar.rent) < (b.priceDollar.sale || b.priceDollar.rent)) {
                return 1;
              }
              if ((a.priceDollar.sale || a.priceDollar.rent) > (b.priceDollar.sale || b.priceDollar.rent)) {
                return -1;
              }
              return 0;
            })
          }
          break;
        default:
          break;
      }
    }
    return data;
  }

  public paginator(items, page?, perPage?) {
    var page = page || 1,
      perPage = perPage || 4,
      offset = (page - 1) * perPage,
      paginatedItems = items.slice(offset).slice(0, perPage),
      totalPages = Math.ceil(items.length / perPage);
    return {
      data: paginatedItems,
      pagination: {
        page: page,
        perPage: perPage,
        prePage: page - 1 ? page - 1 : null,
        nextPage: (totalPages > page) ? page + 1 : null,
        total: items.length,
        totalPages: totalPages,
      }
    };
  }



  public getTestimonials() {
    return [
      {
        text: 'Donec molestie turpis ut mollis efficitur. Nam fringilla libero vel dictum vulputate. In malesuada, ligula non ornare consequat, augue nibh luctus nisl, et lobortis justo ipsum nec velit. Praesent lacinia quam ut nulla gravida, at viverra libero euismod. Sed tincidunt tempus augue vitae malesuada. Vestibulum eu lectus nisi. Aliquam erat volutpat.',
        author: 'Mr. Adam Sandler',
        position: 'General Director',
        image: 'assets/images/profile/adam.jpg'
      },
      {
        text: 'Donec molestie turpis ut mollis efficitur. Nam fringilla libero vel dictum vulputate. In malesuada, ligula non ornare consequat, augue nibh luctus nisl, et lobortis justo ipsum nec velit. Praesent lacinia quam ut nulla gravida, at viverra libero euismod. Sed tincidunt tempus augue vitae malesuada. Vestibulum eu lectus nisi. Aliquam erat volutpat.',
        author: 'Ashley Ahlberg',
        position: 'Housewife',
        image: 'assets/images/profile/ashley.jpg'
      },
      {
        text: 'Donec molestie turpis ut mollis efficitur. Nam fringilla libero vel dictum vulputate. In malesuada, ligula non ornare consequat, augue nibh luctus nisl, et lobortis justo ipsum nec velit. Praesent lacinia quam ut nulla gravida, at viverra libero euismod. Sed tincidunt tempus augue vitae malesuada. Vestibulum eu lectus nisi. Aliquam erat volutpat.',
        author: 'Bruno Vespa',
        position: 'Blogger',
        image: 'assets/images/profile/bruno.jpg'
      },
      {
        text: 'Donec molestie turpis ut mollis efficitur. Nam fringilla libero vel dictum vulputate. In malesuada, ligula non ornare consequat, augue nibh luctus nisl, et lobortis justo ipsum nec velit. Praesent lacinia quam ut nulla gravida, at viverra libero euismod. Sed tincidunt tempus augue vitae malesuada. Vestibulum eu lectus nisi. Aliquam erat volutpat.',
        author: 'Mrs. Julia Aniston',
        position: 'Marketing Manager',
        image: 'assets/images/profile/julia.jpg'
      }
    ];
  }

  public getAgents() {
    return [
      {
        id: 1,
        fullName: 'Lusia Manuel',
        desc: 'Phasellus sed metus leo. Donec laoreet, lacus ut suscipit convallis, erat enim eleifend nulla, at sagittis enim urna et lacus.',
        organization: 'HouseKey',
        email: 'lusia.m@housekey.com',
        phone: '(224) 267-1346',
        social: {
          facebook: 'lusia',
          twitter: 'lusia',
          linkedin: 'lusia',
          instagram: 'lusia',
          website: 'https://lusia.manuel.com'
        },
        ratingsCount: 6,
        ratingsValue: 480,
        image: 'assets/images/agents/a-1.jpg'
      },
      {
        id: 2,
        fullName: 'Andy Warhol',
        desc: 'Phasellus sed metus leo. Donec laoreet, lacus ut suscipit convallis, erat enim eleifend nulla, at sagittis enim urna et lacus.',
        organization: 'HouseKey',
        email: 'andy.w@housekey.com',
        phone: '(212) 457-2308',
        social: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: '',
          website: 'https://andy.warhol.com'
        },
        ratingsCount: 4,
        ratingsValue: 400,
        image: 'assets/images/agents/a-2.jpg'
      },
      {
        id: 3,
        fullName: 'Tereza Stiles',
        desc: 'Phasellus sed metus leo. Donec laoreet, lacus ut suscipit convallis, erat enim eleifend nulla, at sagittis enim urna et lacus.',
        organization: 'HouseKey',
        email: 'tereza.s@housekey.com',
        phone: '(214) 617-2614',
        social: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: '',
          website: 'https://tereza.stiles.com'
        },
        ratingsCount: 4,
        ratingsValue: 380,
        image: 'assets/images/agents/a-3.jpg'
      },
      {
        id: 4,
        fullName: 'Michael Blair',
        desc: 'Phasellus sed metus leo. Donec laoreet, lacus ut suscipit convallis, erat enim eleifend nulla, at sagittis enim urna et lacus.',
        organization: 'HouseKey',
        email: 'michael.b@housekey.com',
        phone: '(267) 388-1637',
        social: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: '',
          website: 'https://michael.blair.com'
        },
        ratingsCount: 6,
        ratingsValue: 480,
        image: 'assets/images/agents/a-4.jpg'
      },
      {
        id: 5,
        fullName: 'Michelle Ormond',
        desc: 'Phasellus sed metus leo. Donec laoreet, lacus ut suscipit convallis, erat enim eleifend nulla, at sagittis enim urna et lacus.',
        organization: 'HouseKey',
        email: 'michelle.o@housekey.com',
        phone: '(267) 388-1637',
        social: {
          facebook: '',
          twitter: '',
          linkedin: '',
          instagram: '',
          website: 'https://michelle.ormond.com'
        },
        ratingsCount: 6,
        ratingsValue: 480,
        image: 'assets/images/agents/a-5.jpg'
      }
    ];
  }



  public getClients() {
    return [
      { name: 'aloha', image: 'assets/images/clients/aloha.png' },
      { name: 'dream', image: 'assets/images/clients/dream.png' },
      { name: 'congrats', image: 'assets/images/clients/congrats.png' },
      { name: 'best', image: 'assets/images/clients/best.png' },
      { name: 'original', image: 'assets/images/clients/original.png' },
      { name: 'retro', image: 'assets/images/clients/retro.png' },
      { name: 'king', image: 'assets/images/clients/king.png' },
      { name: 'love', image: 'assets/images/clients/love.png' },
      { name: 'the', image: 'assets/images/clients/the.png' },
      { name: 'easter', image: 'assets/images/clients/easter.png' },
      { name: 'with', image: 'assets/images/clients/with.png' },
      { name: 'special', image: 'assets/images/clients/special.png' },
      { name: 'bravo', image: 'assets/images/clients/bravo.png' }
    ];
  }


}
