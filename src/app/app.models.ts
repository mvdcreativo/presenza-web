export interface Publication {
    id?:number;
    property_id?:number;
    status_id?:string;
    transaction_types?:TransactionTypes[];
    currency_id?:number;
    price?:string;
    property?: Property;
    currency?: any;
    created_at?: string;
    updated_at?:string;
    
}

export interface ResponsePaginate {
    message?: string;
    data?: Paginate;
    success?: boolean;
}

export interface Response {
    message?: string;
    data?: any;
    success?: boolean;
}

export interface Paginate {
    current_page: number;
    data: any[];
    first_page_url: string;
    from?: any;
    last_page: number;
    last_page_url: string;
    next_page_url?: any;
    path: string;
    per_page: number;
    prev_page_url?: any;
    to?: any;
    total: number;
}

export interface Property {
    id?: number;
    title?: string;
    code?: string;
    address?:string;
    description?: string;
    status_id?: number;
    property_type_id?: number;
    neighborhood_id?: number;
    latitude?: string;
    longitude?: string;
    user_owner_id?: number;
    user_customer_id?: number;
    images?: Image[];
    created_at?: string;
    updated_at?: string;
    deleted_at?: string;
    videos?: Video[];
    features?: Feature[];
    property_type: PropertyTypes;
    neighborhood: Neighborhood
    //ORIGINAL DEL THEMPLATE
    // id: number;
    // title: string; 
    // desc: string;
    // propertyType: string;
    // propertyStatus: string[]; 
    // city: string;
    // zipCode: string[];
    // neighborhood: string[];
    // street: string[];
    // location: Location;
    // formattedAddress: string;
    // features: string[];
    // featured: boolean;
    // priceDollar: Price;
    // priceEuro: Price;
    // bedrooms: number;
    // bathrooms: number;
    // garages: number;
    // area: Area;
    // yearBuilt: number;
    // ratingsCount: number;
    // ratingsValue: number;
    // additionalFeatures: AdditionalFeature[];
    // gallery: Gallery[];
    // plans: Plan[];
    // videos: Video[];
    // published: string;
    // lastUpdate: string;
    // views: number;
}

export interface Image {
    id?: number;
    url: string;
    url_small: string;
    url_medium: string;
    title?: string;
    subtitle?: string;
    description?: string;

}
export interface Video {
    id?: number;
    url: string;
    title?: string;
    subtitle?: string;
    description?: string;

}
export interface PropertyTypes {
    id?:number;
    name:string;
    description?:string;
    status_id?:number;
}
export interface TransactionTypes {
    id?: number;
    name: string;
    created_at?: any;
    updated_at?: any;
    pivot: TransactionPivot;

}
export interface TransactionPivot {
    publication_id: number;
    transaction_type_id: number;
    price: any;
    currency_id: number;
    currency: {
        id: number;
        name: string;
        symbol: string;
        value?: any;
        status?: string;
        created_at?: string;
        updated_at?: string;
    }

}

export interface State {
    id?: number;
    name: string;
    code?: string;
    country_id: number;
    created_at?: any;
    updated_at?: any;

}
export interface City {
    id?: number;
    name: string;
    code?: string;
    province_id: number;
    // province: Province;
    created_at?: any;
    updated_at?: any;

}
export interface Municipality {
    id?: number;
    name: string;
    code?: string;
    city_id: number;
    city: City;
    created_at?: any;
    updated_at?: any;

}
export interface Neighborhood {
    id?: number;
    name: string;
    code?: string;
    municipality_id: number;
    created_at?: any;
    updated_at?: any;
    municipality: Municipality;

}

export interface Feature {
    id?: number;
    name: string;
    slug: string;
    feature_id?: number;
    type?: string;
    value?: string;
    created_at?: any;
    updated_at?: any;
    feature?: Feature;
    features?: Feature[];
    pivot?: {
        property_id: number;
        feature_id: number;
        value: any;
    }

}
// export class Property {
//     public id: number;
//     public title: string; 
//     public desc: string;
//     public propertyType: string;
//     public propertyStatus: string[];
//     public city: string;
//     public zipCode: string;
//     public neighborhood: string[];
//     public street: string[];
//     public location: Location;
//     public formattedAddress: string;
//     public features: string[];
//     public featured: boolean;
//     public priceDollar: Price;
//     public priceEuro: Price;
//     public bedrooms: number;
//     public bathrooms: number;
//     public garages: number;
//     public area: Area;
//     public yearBuilt: number;
//     public ratingsCount: number;
//     public ratingsValue: number;
//     public additionalFeatures: AdditionalFeature[];
//     public gallery: Gallery[];
//     public plans: Plan[];
//     public videos: Video[];
//     public published: string;
//     public lastUpdate: string;
//     public views: number
// }


export class Area {
    constructor(public id: number, 
                public value: number,
                public unit: string){ }
}

export class AdditionalFeature {
    constructor(public id: number, 
                public name: string,
                public value: string){ }
}

export class Location {
    constructor(public id: number, 
                public lat: number,
                public lng: number){ }
}

export class Price {
    public sale: number;
    public rent: number;
}


export class Gallery {
    constructor(public id: number, 
                public small: string,
                public medium: string,
                public big: string){ }
}

export class Plan {
    constructor(public id: number, 
                public name: string,
                public desc: string,
                public area: Area,
                public rooms: number,
                public baths: number,
                public image: string){ }
}

export class Pagination {
    constructor(public page: number,
                public perPage: number,
                public prePage: number,
                public nextPage: number,
                public total: number,
                public totalPages: number){ }
}



