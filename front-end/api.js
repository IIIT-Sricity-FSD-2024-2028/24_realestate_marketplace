(function () {
  const DEFAULT_API_BASE = 'http://localhost:3000/api/v1';
  const API_BASE = (localStorage.getItem('truEstate_api_base') || DEFAULT_API_BASE).replace(/\/+$/, '');
  const VALID_ROLES = ['superuser', 'admin', 'agent', 'seller', 'buyer'];
  const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&q=80';

  function normalizeRole(role) {
    const value = String(role || '').trim().toLowerCase().replace(/\s+/g, '');
    if (value === 'superadmin' || value === 'superuser') return 'superuser';
    if (VALID_ROLES.includes(value)) return value;
    return '';
  }

  function inferRoleFromPage() {
    const page = window.location.pathname.toLowerCase();
    if (page.includes('superuser')) return 'superuser';
    if (page.includes('admin')) return 'admin';
    if (page.includes('agent')) return 'agent';
    if (page.includes('seller')) return 'seller';
    if (page.includes('buyer')) return 'buyer';
    return 'buyer';
  }

  function currentRole(explicitRole) {
    const explicit = normalizeRole(explicitRole);
    if (explicit) return explicit;
    try {
      const user = JSON.parse(localStorage.getItem('truEstate_user') || 'null');
      const stored = normalizeRole(user && user.role);
      if (stored) return stored;
    } catch (_) {}
    return inferRoleFromPage();
  }

  async function request(path, options = {}) {
    const method = options.method || 'GET';
    const headers = { Accept: 'application/json' };
    const role = options.role === null ? '' : currentRole(options.role);

    if (role) headers.role = role;
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';

    const response = await fetch(API_BASE + path, {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (_) {
        payload = { message: text };
      }
    }

    if (!response.ok) {
      const message = payload && (Array.isArray(payload.message) ? payload.message.join(', ') : payload.message);
      const error = new Error(message || 'API request failed');
      error.status = response.status;
      error.payload = payload;
      throw error;
    }

    return payload && Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload;
  }

  function numberFrom(value, fallback = 0) {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    const raw = String(value || '').trim();
    if (!raw) return fallback;
    const lower = raw.toLowerCase();
    let numeric = Number.parseFloat(raw.replace(/,/g, '').replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(numeric)) return fallback;
    if (lower.includes('cr') && numeric < 10000000) numeric *= 10000000;
    if ((lower.includes('lac') || lower.includes('lakh')) && numeric < 100000) numeric *= 100000;
    return numeric;
  }

  function intFrom(value, fallback = 0) {
    const parsed = Number.parseInt(String(value || '').replace(/[^0-9-]/g, ''), 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function titleCase(value) {
    return String(value || '')
      .replace(/[_-]+/g, ' ')
      .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
  }

  function safeTitle(value) {
    const title = String(value || 'New Property Listing').trim();
    return title.length >= 10 ? title : title + ' Property';
  }

  function safeDescription(input, title) {
    const description = String(input.description || input.desc || '').trim();
    if (description.length >= 20) return description;
    return `${title} listed through truEstate with complete property details and seller verification.`;
  }

  function propertyType(value) {
    const type = String(value || '').toLowerCase();
    if (type.includes('villa') || type.includes('house') || type.includes('home')) return 'villa';
    if (type.includes('plot') || type.includes('land')) return 'plot';
    if (type.includes('commercial') || type.includes('office')) return 'commercial';
    if (type.includes('pent')) return 'penthouse';
    return 'apartment';
  }

  function listingType(value) {
    return String(value || '').toLowerCase().includes('rent') ? 'rent' : 'sale';
  }

  function statusForBackend(value) {
    const status = String(value || 'pending').toLowerCase();
    if (status.includes('verify') || status.includes('approve') || status.includes('listed') || status.includes('available')) return 'approved';
    if (status.includes('reject') || status.includes('archive')) return 'rejected';
    if (status.includes('sold')) return 'sold';
    if (status.includes('rent')) return 'rented';
    if (status.includes('offer')) return 'under_offer';
    return 'pending';
  }

  function frontendStatusFromBackend(value) {
    const status = String(value || 'pending').toLowerCase();
    if (status === 'approved' || status === 'available') return 'approved';
    if (status === 'rejected') return 'rejected';
    if (status === 'sold' || status === 'rented') return status;
    if (status === 'under_offer') return 'under_offer';
    return 'pending';
  }

  function splitLocation(value) {
    const raw = String(value || '').trim();
    const parts = raw.split(',').map((part) => part.trim()).filter(Boolean);
    const knownStateByCity = {
      hyderabad: 'Telangana',
      bangalore: 'Karnataka',
      bengaluru: 'Karnataka',
      mumbai: 'Maharashtra',
      chennai: 'Tamil Nadu',
      coimbatore: 'Tamil Nadu',
      delhi: 'Delhi',
      pune: 'Maharashtra',
    };
    const joined = raw.toLowerCase();
    const cityKey = Object.keys(knownStateByCity).find((city) => joined.includes(city));
    const city = cityKey ? titleCase(cityKey === 'bengaluru' ? 'Bangalore' : cityKey) : (parts[parts.length - 1] || 'Hyderabad');
    const state = cityKey ? knownStateByCity[cityKey] : 'Telangana';
    const address = parts.length > 1 ? parts.slice(0, -1).join(', ') : (raw || city);
    return { address, city, state };
  }

  function imagesFrom(input) {
    if (Array.isArray(input.images) && input.images.length) return input.images;
    if (input.image) return [input.image];
    if (input.img) return [input.img];
    return [DEFAULT_IMAGE];
  }

  function toBackendProperty(input = {}) {
    const location = input.location || input.locationArea || input.address || input.area || '';
    const place = splitLocation(location);
    const title = safeTitle(input.title || input.name);
    const price = Math.max(1, numberFrom(input.price, numberFrom(input.priceValue, 75) * 100000));
    const areaSqft = Math.max(1, intFrom(input.areaSqft || input.sqft || input.area, 1200));
    const bedrooms = Math.max(0, intFrom(input.bedrooms || input.beds, 2));
    const bathrooms = Math.max(1, intFrom(input.bathrooms || input.baths, 2));

    return {
      title,
      description: safeDescription(input, title),
      type: propertyType(input.type),
      listingType: listingType(input.listingType || input.transactionType),
      price,
      areaSqft,
      bedrooms,
      bathrooms,
      address: input.address || place.address,
      city: input.city || place.city,
      state: input.state || place.state,
      status: statusForBackend(input.status),
      images: imagesFrom(input),
      agentId: input.agentId || 'usr_000002',
    };
  }

  function toBackendPropertyPatch(input = {}) {
    const patch = {};
    if (input.title || input.name) patch.title = safeTitle(input.title || input.name);
    if (input.description || input.desc) patch.description = safeDescription(input, patch.title || input.title || input.name || 'Updated Property');
    if (input.type) patch.type = propertyType(input.type);
    if (input.listingType) patch.listingType = listingType(input.listingType);
    if (input.price !== undefined) patch.price = Math.max(1, numberFrom(input.price, 1));
    if (input.areaSqft !== undefined || input.sqft !== undefined || input.area !== undefined) patch.areaSqft = Math.max(1, intFrom(input.areaSqft || input.sqft || input.area, 1200));
    if (input.bedrooms !== undefined || input.beds !== undefined) patch.bedrooms = Math.max(0, intFrom(input.bedrooms || input.beds, 0));
    if (input.bathrooms !== undefined || input.baths !== undefined) patch.bathrooms = Math.max(1, intFrom(input.bathrooms || input.baths, 1));
    if (input.location || input.address || input.city || input.state) {
      const place = splitLocation(input.location || input.address || input.city || '');
      patch.address = input.address || place.address;
      patch.city = input.city || place.city;
      patch.state = input.state || place.state;
    }
    if (input.status !== undefined) patch.status = statusForBackend(input.status);
    if (input.images || input.image || input.img) patch.images = imagesFrom(input);
    if (input.agentId !== undefined) patch.agentId = input.agentId;
    return patch;
  }

  function toBackendUser(input = {}) {
    const role = normalizeRole(input.role) || normalizeRole(input.userRole) || 'buyer';
    const name = String(input.name || `${titleCase(role)} User`).trim();
    const email = String(input.email || `${role}.${Date.now()}@truestate.local`).trim().toLowerCase();
    return {
      name,
      email,
      password: input.password || 'Eval@12345',
      role,
      phone: input.phone || undefined,
    };
  }

  function formatMoney(value) {
    const amount = numberFrom(value, 0);
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    } catch (_) {
      return 'Rs ' + Math.round(amount).toLocaleString('en-IN');
    }
  }

  function shortMoney(value) {
    const amount = numberFrom(value, 0);
    if (amount >= 10000000) return 'Rs ' + (amount / 10000000).toFixed(amount % 10000000 ? 2 : 0) + ' Cr';
    if (amount >= 100000) return 'Rs ' + (amount / 100000).toFixed(amount % 100000 ? 2 : 0) + ' Lac';
    return 'Rs ' + Math.round(amount).toLocaleString('en-IN');
  }

  function backendPropertyLocation(p) {
    return [p.address, p.city].filter(Boolean).join(', ') || p.city || p.state || 'Hyderabad';
  }

  function toSellerProperty(p) {
    return {
      id: p.id,
      name: p.title,
      title: p.title,
      type: titleCase(p.type),
      location: backendPropertyLocation(p),
      price: Math.round(numberFrom(p.price, 0)).toLocaleString('en-IN'),
      rawPrice: p.price,
      status: frontendStatusFromBackend(p.status),
      sqft: p.areaSqft,
      beds: p.bedrooms,
      baths: p.bathrooms,
      furnish: 'Unfurnished',
    };
  }

  function toLandingProperty(p, index) {
    const uiId = 5000 + index;
    return {
      id: uiId,
      backendId: p.id,
      name: p.title,
      type: titleCase(p.type),
      locationArea: p.address || p.city,
      location: backendPropertyLocation(p),
      image: (p.images && p.images[0]) || DEFAULT_IMAGE,
      rating: '4.8',
      beds: p.bedrooms,
      baths: p.bathrooms,
      area: `${p.areaSqft} sqft`,
      price: shortMoney(p.price),
      priceValue: Math.round(numberFrom(p.price, 0) / 100000),
      description: p.description,
    };
  }

  function toBuyerProperty(p, index) {
    const amount = numberFrom(p.price, 0);
    const uiId = 10000 + index;
    return {
      id: uiId,
      backendId: p.id,
      title: p.title,
      builder: p.agentId ? 'truEstate Verified Agent' : 'Independent Seller',
      type: titleCase(p.type),
      listingType: p.listingType === 'rent' ? 'Rent' : 'Buy',
      location: p.city || 'Hyderabad',
      area: backendPropertyLocation(p),
      price: amount,
      priceLabel: 'Rs\n' + Math.round(amount).toLocaleString('en-IN'),
      priceFmt: shortMoney(amount),
      perSqft: amount && p.areaSqft ? 'Rs ' + Math.round(amount / p.areaSqft).toLocaleString('en-IN') + ' per sqft' : 'N/A',
      beds: p.bedrooms,
      baths: p.bathrooms,
      balcony: 1,
      sqft: p.areaSqft,
      floor: '-',
      parking: 1,
      status: p.status === 'pending' ? 'Pending Review' : 'Ready to Move',
      tx: p.listingType === 'rent' ? 'Rental' : 'Resale',
      furnish: 'Semi-Furnished',
      img: (p.images && p.images[0]) || DEFAULT_IMAGE,
      photoCount: Math.max(1, (p.images || []).length),
      popular: index < 3,
      desc: p.description,
    };
  }

  function toSuperUser(user) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: titleCase(user.role),
      status: 'Active',
    };
  }

  function toSuperProperty(p) {
    const frontendStatus = frontendStatusFromBackend(p.status);
    const status = frontendStatus === 'approved' ? 'Listed' : frontendStatus === 'rejected' ? 'Archived' : 'Draft';
    return {
      id: p.id,
      name: p.title,
      title: p.title,
      location: backendPropertyLocation(p),
      price: Math.round(numberFrom(p.price, 0)).toLocaleString('en-IN'),
      priceFormatted: shortMoney(p.price),
      status,
    };
  }

  async function remove(path, role) {
    return request(path, { method: 'DELETE', role });
  }

  window.TruEstateApi = {
    baseUrl: API_BASE,
    normalizeRole,
    currentRole,
    request,
    numberFrom,
    formatMoney,
    shortMoney,
    titleCase,
    statusForBackend,
    frontendStatusFromBackend,
    toBackendProperty,
    toBackendPropertyPatch,
    toBackendUser,
    toSellerProperty,
    toLandingProperty,
    toBuyerProperty,
    toSuperUser,
    toSuperProperty,
    listProperties: () => request('/properties', { role: null }),
    createProperty: (property, role) => request('/properties', { method: 'POST', role: role || currentRole('seller'), body: toBackendProperty(property) }),
    updateProperty: (id, property, role) => request(`/properties/${encodeURIComponent(id)}`, { method: 'PATCH', role: role || currentRole('seller'), body: toBackendPropertyPatch(property) }),
    deleteProperty: (id, role) => remove(`/properties/${encodeURIComponent(id)}`, role || currentRole('seller')),
    listUsers: (role) => request('/users', { role: role || currentRole('superuser') }),
    createUser: (user, role) => request('/users', { method: 'POST', role: role || currentRole('superuser'), body: toBackendUser(user) }),
    updateUser: (id, user, role) => request(`/users/${encodeURIComponent(id)}`, { method: 'PATCH', role: role || currentRole('superuser'), body: toBackendUser(user) }),
    deleteUser: (id, role) => remove(`/users/${encodeURIComponent(id)}`, role || currentRole('superuser')),
    createVisit: (visit, role) => request('/visits', { method: 'POST', role: role || currentRole('buyer'), body: visit }),
    listVisits: () => request('/visits', { role: null }),
    updateVisit: (id, visit, role) => request(`/visits/${encodeURIComponent(id)}`, { method: 'PATCH', role: role || currentRole('buyer'), body: visit }),
    deleteVisit: (id, role) => remove(`/visits/${encodeURIComponent(id)}`, role || currentRole('buyer')),
    createBooking: (booking, role) => request('/bookings', { method: 'POST', role: role || currentRole('buyer'), body: booking }),
    listBookings: (role) => request('/bookings', { role: role || currentRole('admin') }),
    cancelBooking: (id, role) => remove(`/bookings/${encodeURIComponent(id)}/cancel`, role || currentRole('buyer')),
    createShortlist: (item, role) => request('/shortlists', { method: 'POST', role: role || currentRole('buyer'), body: item }),
    listShortlists: () => request('/shortlists', { role: null }),
    updateShortlist: (id, item, role) => request(`/shortlists/${encodeURIComponent(id)}`, { method: 'PATCH', role: role || currentRole('buyer'), body: item }),
    deleteShortlist: (id, role) => remove(`/shortlists/${encodeURIComponent(id)}`, role || currentRole('buyer')),
    createNegotiation: (item, role) => request('/negotiations', { method: 'POST', role: role || currentRole('buyer'), body: item }),
    listNegotiations: () => request('/negotiations', { role: null }),
    updateNegotiation: (id, item, role) => request(`/negotiations/${encodeURIComponent(id)}`, { method: 'PATCH', role: role || currentRole('agent'), body: item }),
    deleteNegotiation: (id, role) => remove(`/negotiations/${encodeURIComponent(id)}`, role || currentRole('agent')),
  };
})();
