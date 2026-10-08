export declare enum ServiceCity {
    HYDERABAD = "Hyderabad",
    CHENNAI = "Chennai",
    BANGALORE = "Bangalore",
    KOCHI = "Kochi"
}
export declare const SERVICE_CITIES: ServiceCity[];
export declare const CITY_STATE: Record<ServiceCity, string>;
export declare function normalizeCity(value?: string | null): ServiceCity | null;
export declare function citySpellings(city: ServiceCity): RegExp[];
export declare function isServiceCity(value?: string | null): value is ServiceCity;
export declare const FALLBACK_CITY: ServiceCity;
