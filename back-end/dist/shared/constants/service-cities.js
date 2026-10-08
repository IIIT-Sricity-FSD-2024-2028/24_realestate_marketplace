"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FALLBACK_CITY = exports.CITY_STATE = exports.SERVICE_CITIES = exports.ServiceCity = void 0;
exports.normalizeCity = normalizeCity;
exports.citySpellings = citySpellings;
exports.isServiceCity = isServiceCity;
var ServiceCity;
(function (ServiceCity) {
    ServiceCity["HYDERABAD"] = "Hyderabad";
    ServiceCity["CHENNAI"] = "Chennai";
    ServiceCity["BANGALORE"] = "Bangalore";
    ServiceCity["KOCHI"] = "Kochi";
})(ServiceCity || (exports.ServiceCity = ServiceCity = {}));
exports.SERVICE_CITIES = Object.values(ServiceCity);
exports.CITY_STATE = {
    [ServiceCity.HYDERABAD]: 'Telangana',
    [ServiceCity.CHENNAI]: 'Tamil Nadu',
    [ServiceCity.BANGALORE]: 'Karnataka',
    [ServiceCity.KOCHI]: 'Kerala',
};
const CITY_ALIASES = {
    hyderabad: ServiceCity.HYDERABAD,
    hyd: ServiceCity.HYDERABAD,
    secunderabad: ServiceCity.HYDERABAD,
    chennai: ServiceCity.CHENNAI,
    madras: ServiceCity.CHENNAI,
    bangalore: ServiceCity.BANGALORE,
    bengaluru: ServiceCity.BANGALORE,
    blr: ServiceCity.BANGALORE,
    kochi: ServiceCity.KOCHI,
    cochin: ServiceCity.KOCHI,
    ernakulam: ServiceCity.KOCHI,
};
function normalizeCity(value) {
    if (!value)
        return null;
    return CITY_ALIASES[value.trim().toLowerCase()] ?? null;
}
function citySpellings(city) {
    return Object.entries(CITY_ALIASES)
        .filter(([, target]) => target === city)
        .map(([alias]) => new RegExp(`^\\s*${alias}\\s*$`, 'i'));
}
function isServiceCity(value) {
    return !!value && exports.SERVICE_CITIES.includes(value);
}
exports.FALLBACK_CITY = ServiceCity.HYDERABAD;
//# sourceMappingURL=service-cities.js.map