/**
 * The cities truEstate operates in at launch.
 *
 * This list is the single source of truth for the whole location model:
 *  - a seller may only list a property in one of these cities (the add-property
 *    form is a dropdown, and CreatePropertyDto validates against this enum);
 *  - each city has exactly one admin account, seeded from `cityAdmins` in
 *    config, whose `User.city` matches one of these values;
 *  - every admin queue (verification, site visits, negotiations, purchases) is
 *    scoped to the admin's own city, so a Hyderabad listing is only ever
 *    handled by the Hyderabad admin.
 *
 * Adding a fifth city means adding it here, adding its admin to
 * `cityAdmins` in configuration.ts, and re-running the seeder.
 */
export enum ServiceCity {
  HYDERABAD = 'Hyderabad',
  CHENNAI = 'Chennai',
  BANGALORE = 'Bangalore',
  KOCHI = 'Kochi',
}

export const SERVICE_CITIES: ServiceCity[] = Object.values(ServiceCity);

/** The state each service city belongs to. `state` is derived from the chosen
 *  city rather than typed by the seller, so the two can never disagree. */
export const CITY_STATE: Record<ServiceCity, string> = {
  [ServiceCity.HYDERABAD]: 'Telangana',
  [ServiceCity.CHENNAI]: 'Tamil Nadu',
  [ServiceCity.BANGALORE]: 'Karnataka',
  [ServiceCity.KOCHI]: 'Kerala',
};

/**
 * Alternate spellings seen in data created before the city list was fixed.
 * Used by `normalizeCity` so an old "Bengaluru" listing resolves to the
 * Bangalore desk instead of being orphaned with no admin.
 */
const CITY_ALIASES: Record<string, ServiceCity> = {
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

/** Resolves free-text city input to a service city, or `null` if unserviced. */
export function normalizeCity(value?: string | null): ServiceCity | null {
  if (!value) return null;
  return CITY_ALIASES[value.trim().toLowerCase()] ?? null;
}

/**
 * Every spelling that resolves to `city`, case-insensitively matched. Used by
 * the boot-time migration to find legacy documents ("Bengaluru") that should
 * belong to this city's desk.
 */
export function citySpellings(city: ServiceCity): RegExp[] {
  return Object.entries(CITY_ALIASES)
    .filter(([, target]) => target === city)
    .map(([alias]) => new RegExp(`^\\s*${alias}\\s*$`, 'i'));
}

export function isServiceCity(value?: string | null): value is ServiceCity {
  return !!value && SERVICE_CITIES.includes(value as ServiceCity);
}

/**
 * The desk that takes anything we can't file anywhere else: a listing in a
 * city we don't operate in (Mumbai, Gurugram, ...), or one whose city is
 * missing entirely. Without a catch-all such a listing has no `adminId`, so
 * it sits in no admin's verification / visit / negotiation / purchase queue
 * and nobody can act on it. Hyderabad is the head-office desk, so it absorbs
 * them — see `PropertiesService.syncCityAdmins`, which enforces this on boot.
 */
export const FALLBACK_CITY: ServiceCity = ServiceCity.HYDERABAD;
