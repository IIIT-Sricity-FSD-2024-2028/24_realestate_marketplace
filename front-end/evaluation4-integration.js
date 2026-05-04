(function () {
  const API = window.TruEstateApi;
  if (!API) return;

  const BUYER_ID = 'usr_eval_buyer';
  const SELLER_ID = 'usr_eval_seller';

  function ready(fn) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function toast(message, type) {
    if (typeof window.showToast === 'function') window.showToast(message, type || 'success');
    else console.log(message);
  }

  function handleError(error, fallback) {
    console.error('[Evaluation 4 API]', error);
    toast((fallback || 'Backend request failed') + ': ' + (error.message || 'Check the backend server'), 'error');
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function jsString(value) {
    return String(value == null ? '' : value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  async function getProperties() {
    const properties = await API.listProperties();
    const legacy = properties.map(API.toSellerProperty);
    localStorage.setItem('properties', JSON.stringify(legacy));
    return properties;
  }

  function visibleCatalogProperties(properties) {
    return properties.filter((property) => ['approved', 'available'].includes(String(property.status).toLowerCase()));
  }

  function activeOfferStatus(status) {
    return !['accepted', 'completed', 'rejected', 'withdrawn', 'cancelled'].includes(String(status || 'pending').toLowerCase());
  }

  function readSubmittedOffers() {
    try {
      const offers = JSON.parse(localStorage.getItem('submittedOffers') || '[]');
      return Array.isArray(offers) ? offers : [];
    } catch (_) {
      return [];
    }
  }

  function assignSubmittedOffers(offers) {
    try {
      submittedOffers = offers;
    } catch (_) {}
  }

  function writeSubmittedOffers(offers) {
    localStorage.setItem('submittedOffers', JSON.stringify(offers));
    assignSubmittedOffers(offers);
  }

  function offerMatchesId(offer, id) {
    return String(offer && offer.id) === String(id) || String(offer && offer.backendId) === String(id);
  }

  function backendNegotiationId(offer, fallback) {
    const candidate = (offer && offer.backendId) || (offer && offer.id) || fallback;
    return String(candidate || '').startsWith('negotiations_') ? candidate : null;
  }

  function backendPropertyIdFromOffer(offer) {
    const candidates = [offer && offer.backendPropertyId, offer && offer.propertyId];
    return candidates.find((candidate) => String(candidate || '').startsWith('prop_')) || null;
  }

  async function setBackendPropertyStatus(propertyId, status, role) {
    if (!String(propertyId || '').startsWith('prop_')) return;
    await API.updateProperty(propertyId, { status }, role || 'agent');
  }

  async function syncNegotiationPropertyLocks(properties, negotiations) {
    const byId = new Map((properties || []).map((property) => [String(property.id), property]));
    const desiredStatuses = new Map();

    (negotiations || []).forEach((negotiation) => {
      const propertyId = String(negotiation.propertyId || '');
      if (!propertyId.startsWith('prop_')) return;
      const status = String(negotiation.status || 'pending').toLowerCase();
      if (activeOfferStatus(status)) desiredStatuses.set(propertyId, 'under_offer');
      if (status === 'accepted') desiredStatuses.set(propertyId, 'sold');
    });

    await Promise.all(Array.from(desiredStatuses.entries()).map(async ([propertyId, desiredStatus]) => {
      const property = byId.get(propertyId);
      const currentStatus = String((property && property.status) || '').toLowerCase();
      if (!property || currentStatus === desiredStatus) return;
      if (desiredStatus === 'under_offer' && !['approved', 'available'].includes(currentStatus)) return;
      if (desiredStatus === 'sold' && ['sold', 'rented'].includes(currentStatus)) return;
      await setBackendPropertyStatus(propertyId, desiredStatus, 'agent');
      property.status = desiredStatus;
    }));
  }

  function updateSellerCounts() {
    const tbody = document.getElementById('listings-table');
    if (!tbody) return;
    const rows = tbody.querySelectorAll('tr[data-status]');
    const pending = tbody.querySelectorAll('tr[data-status="pending"]').length;
    const approved = tbody.querySelectorAll('tr[data-status="approved"]').length;
    const all = document.getElementById('pill-count-all');
    const pendingEl = document.getElementById('pill-count-pending');
    const approvedEl = document.getElementById('pill-count-approved');
    if (all) all.textContent = rows.length;
    if (pendingEl) pendingEl.textContent = pending;
    if (approvedEl) approvedEl.textContent = approved;
  }

  function sellerBadge(status) {
    if (status === 'approved') return '<span class="status-badge badge-green">* Approved</span>';
    if (status === 'rejected') return '<span class="status-badge badge-red">* Rejected</span>';
    if (status === 'sold' || status === 'rented') return '<span class="status-badge badge-green">* ' + API.titleCase(status) + '</span>';
    if (status === 'under_offer') return '<span class="status-badge badge-orange">* Under Offer</span>';
    return '<span class="status-badge badge-orange">* Pending</span>';
  }

  async function renderSellerListingsFromApi() {
    const tbody = document.getElementById('listings-table');
    if (!tbody) return;
    try {
      const rows = (await getProperties()).map(API.toSellerProperty);
      tbody.innerHTML = rows.length ? rows.map((property) => `
        <tr data-status="${escapeHtml(property.status)}" data-id="${escapeHtml(property.id)}">
          <td style="color:#fff;">${escapeHtml(property.name)}</td>
          <td style="color:#9ca3af;">${escapeHtml(property.type)}</td>
          <td style="color:#9ca3af;">${escapeHtml(property.location)}</td>
          <td style="color:#fff;">${escapeHtml(API.shortMoney(property.rawPrice))}</td>
          <td>${sellerBadge(property.status)}</td>
          <td>
            <button onclick="editProperty('${jsString(property.id)}')" style="background:none;border:none;color:#3b82f6;cursor:pointer;margin-right:0.5rem;" title="Edit">Edit</button>
            <button onclick="deleteProperty('${jsString(property.id)}')" style="background:none;border:none;color:#ef4444;cursor:pointer;" title="Delete">Delete</button>
          </td>
        </tr>`).join('') : '<tr><td colspan="6" style="text-align:center;color:#9ca3af;padding:2rem;">No backend properties yet.</td></tr>';
      updateSellerCounts();
    } catch (error) {
      handleError(error, 'Could not load seller listings');
    }
  }

  async function syncNegotiationsToLocal() {
    try {
      const [properties, negotiations] = await Promise.all([API.listProperties(), API.listNegotiations()]);
      await syncNegotiationPropertyLocks(properties, negotiations);
      const byId = new Map(properties.map((property) => [String(property.id), property]));
      const localOffers = negotiations.map((negotiation) => {
        const property = byId.get(String(negotiation.propertyId)) || {};
        const status = String(negotiation.status || 'pending').toLowerCase();
        return {
          id: negotiation.id,
          backendId: negotiation.id,
          propertyId: negotiation.propertyId,
          backendPropertyId: negotiation.propertyId,
          title: property.title || negotiation.propertyId,
          area: [property.address, property.city].filter(Boolean).join(', ') || 'Backend property',
          img: property.images && property.images[0],
          listingPrice: property.price || negotiation.offeredPrice,
          priceFmt: API.shortMoney(property.price || negotiation.offeredPrice),
          offerAmt: negotiation.offeredPrice,
          status: status === 'pending' ? 'pending' : status,
          dealStatus: status === 'accepted' ? 'in-progress' : undefined,
          payMode: 'Backend',
          date: new Date(negotiation.createdAt || Date.now()).toLocaleDateString('en-IN'),
        };
      });
      localStorage.setItem('submittedOffers', JSON.stringify(localOffers));
      if (typeof window.renderSellerNegotiations === 'function') window.renderSellerNegotiations();
      if (typeof window.renderSellerTrackPayment === 'function') window.renderSellerTrackPayment();
    } catch (error) {
      console.warn('[Evaluation 4 API] Negotiation cache skipped', error);
    }
  }

  function fileToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Could not read image file'));
      reader.readAsDataURL(file);
    });
  }

  async function sellerUploadedImageDataUrls() {
    const files = Array.from(window.__teSellerUploadedFiles || []).filter((file) => /^image\//i.test(file.type || ''));
    if (!files.length) return [];
    const limited = files.slice(0, 10);
    const urls = await Promise.all(limited.map(fileToDataUrl));
    window.__teSellerUploadedImages = urls;
    return urls;
  }

  function clearSellerUploadedImages() {
    window.__teSellerUploadedFiles = [];
    window.__teSellerUploadedImages = [];
    const selectedText = document.getElementById('new-prop-images-selected');
    if (selectedText) selectedText.textContent = '';
    const input = document.getElementById('new-prop-images');
    if (input) input.value = '';
  }

  function installSellerFileUpload() {
    const form = document.getElementById('addPropertyForm');
    if (!form || document.getElementById('new-prop-images')) return;

    const chooseButton = Array.from(form.querySelectorAll('button'))
      .find((button) => /choose\s+files/i.test(button.textContent || ''));
    if (!chooseButton) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.id = 'new-prop-images';
    input.accept = 'image/png,image/jpeg,image/jpg';
    input.multiple = true;
    input.style.display = 'none';
    form.appendChild(input);

    const uploadBox = chooseButton.closest('div');
    const selectedText = document.createElement('p');
    selectedText.id = 'new-prop-images-selected';
    selectedText.style.cssText = 'color:#1DB954;font-size:0.8125rem;margin-top:0.75rem;';
    if (uploadBox) uploadBox.appendChild(selectedText);

    const openPicker = (event) => {
      if (event) event.preventDefault();
      input.click();
    };

    chooseButton.onclick = openPicker;
    if (uploadBox) {
      uploadBox.addEventListener('click', (event) => {
        if (event.target !== chooseButton && !event.target.closest('button')) openPicker(event);
      });
      uploadBox.addEventListener('dragover', (event) => {
        event.preventDefault();
        uploadBox.style.borderColor = '#1DB954';
      });
      uploadBox.addEventListener('dragleave', () => {
        uploadBox.style.borderColor = 'rgba(255,255,255,0.1)';
      });
      uploadBox.addEventListener('drop', (event) => {
        event.preventDefault();
        uploadBox.style.borderColor = 'rgba(255,255,255,0.1)';
        window.__teSellerUploadedFiles = Array.from(event.dataTransfer.files || []).slice(0, 10);
        window.__teSellerUploadedImages = [];
        selectedText.textContent = window.__teSellerUploadedFiles.length
          ? window.__teSellerUploadedFiles.length + ' file(s) selected'
          : '';
        sellerUploadedImageDataUrls().catch((error) => console.warn('[Evaluation 4 API] Image preview skipped', error));
      });
    }

    input.addEventListener('change', () => {
      window.__teSellerUploadedFiles = Array.from(input.files || []).slice(0, 10);
      window.__teSellerUploadedImages = [];
      selectedText.textContent = window.__teSellerUploadedFiles.length
        ? window.__teSellerUploadedFiles.map((file) => file.name).join(', ')
        : '';
      sellerUploadedImageDataUrls().catch((error) => console.warn('[Evaluation 4 API] Image preview skipped', error));
      if (window.__teSellerUploadedFiles.length) toast(window.__teSellerUploadedFiles.length + ' file(s) selected');
    });
  }

  function installSellerCrud() {
    if (!document.getElementById('addPropertyForm')) return;
    installSellerFileUpload();

    window.submitNewProperty = async function submitNewProperty(event) {
      event.preventDefault();
      if (typeof window.tvValidateAddProperty === 'function' && !window.tvValidateAddProperty()) {
        toast('Please fill in all required property fields.', 'error');
        return;
      }

      const uploadedImages = await sellerUploadedImageDataUrls();
      const property = {
        name: document.getElementById('new-prop-name').value.trim(),
        type: document.getElementById('new-prop-type').value,
        location: document.getElementById('new-prop-location').value.trim(),
        price: document.getElementById('new-prop-price').value.trim(),
        sqft: document.getElementById('new-prop-sqft') ? document.getElementById('new-prop-sqft').value.trim() : '1200',
        beds: document.getElementById('new-prop-beds') ? document.getElementById('new-prop-beds').value.trim() : '2',
        baths: document.getElementById('new-prop-baths') ? document.getElementById('new-prop-baths').value.trim() : '2',
        furnish: document.getElementById('new-prop-furnishing') ? document.getElementById('new-prop-furnishing').value : 'Unfurnished',
        status: 'pending',
        images: uploadedImages.length ? uploadedImages : undefined,
      };

      try {
        await API.createProperty(property, 'seller');
        document.getElementById('addPropertyForm').reset();
        clearSellerUploadedImages();
        await renderSellerListingsFromApi();
        if (typeof window.switchPage === 'function') window.switchPage(null, 'my-listings');
        toast('Property saved to the NestJS backend and sent for admin review.');
      } catch (error) {
        handleError(error, 'Could not create property');
      }
    };

    window.editProperty = async function editProperty(id) {
      const newPrice = prompt('Enter updated price:', '');
      if (newPrice === null || !newPrice.trim()) return;
      try {
        await API.updateProperty(id, { price: newPrice }, 'seller');
        await renderSellerListingsFromApi();
        toast('Property updated through backend.');
      } catch (error) {
        handleError(error, 'Could not update property');
      }
    };

    window.deleteProperty = async function deleteProperty(id) {
      if (!confirm('Delete this property from the backend?')) return;
      try {
        await API.deleteProperty(id, 'seller');
        await renderSellerListingsFromApi();
        toast('Property deleted from backend.');
      } catch (error) {
        handleError(error, 'Could not delete property');
      }
    };

    window.sellerAcceptOffer = async function sellerAcceptOfferApi(id) {
      const offers = readSubmittedOffers();
      const offer = offers.find((item) => offerMatchesId(item, id));
      if (!offer) {
        toast('Offer not found. Refresh negotiations and try again.', 'error');
        return;
      }

      try {
        const negotiationId = backendNegotiationId(offer, id);
        if (negotiationId) await API.updateNegotiation(negotiationId, { status: 'accepted' }, 'seller');
        await setBackendPropertyStatus(backendPropertyIdFromOffer(offer), 'sold', 'seller');
        offer.status = 'accepted';
        offer.dealStatus = 'in-progress';
        writeSubmittedOffers(offers);
        if (typeof window.renderSellerNegotiations === 'function') window.renderSellerNegotiations();
        if (typeof window.renderSellerTrackPayment === 'function') window.renderSellerTrackPayment();
        await syncNegotiationsToLocal();
        toast('Offer accepted. Buyer purchase initiation is now active.');
      } catch (error) {
        handleError(error, 'Could not accept offer');
      }
    };

    window.sellerRejectOffer = async function sellerRejectOfferApi(id) {
      const offers = readSubmittedOffers();
      const offer = offers.find((item) => offerMatchesId(item, id));
      if (!offer) {
        toast('Offer not found. Refresh negotiations and try again.', 'error');
        return;
      }

      try {
        const negotiationId = backendNegotiationId(offer, id);
        if (negotiationId) await API.updateNegotiation(negotiationId, { status: 'rejected' }, 'seller');
        await setBackendPropertyStatus(backendPropertyIdFromOffer(offer), 'approved', 'seller');
        offer.status = 'rejected';
        writeSubmittedOffers(offers);
        if (typeof window.renderSellerNegotiations === 'function') window.renderSellerNegotiations();
        await syncNegotiationsToLocal();
        toast('Offer rejected and the property is available again.');
      } catch (error) {
        handleError(error, 'Could not reject offer');
      }
    };

    window.sellerCounterOffer = async function sellerCounterOfferApi(id) {
      const offers = readSubmittedOffers();
      const offer = offers.find((item) => offerMatchesId(item, id));
      if (!offer) {
        toast('Offer not found. Refresh negotiations and try again.', 'error');
        return;
      }

      const amount = prompt('Enter counter offer amount (numeric values only):');
      if (!amount || Number.isNaN(Number.parseFloat(amount))) return;

      try {
        const parsed = Number.parseFloat(amount);
        const negotiationId = backendNegotiationId(offer, id);
        if (negotiationId) await API.updateNegotiation(negotiationId, { offeredPrice: parsed, status: 'pending' }, 'seller');
        offer.counterAmt = parsed;
        offer.status = 'pending';
        writeSubmittedOffers(offers);
        if (typeof window.renderSellerNegotiations === 'function') window.renderSellerNegotiations();
        toast('Counter offer recorded.');
      } catch (error) {
        handleError(error, 'Could not record counter offer');
      }
    };

    renderSellerListingsFromApi();
    syncNegotiationsToLocal();
  }

  function adminState(status) {
    const value = String(status || '').toLowerCase();
    if (value === 'approved' || value === 'available') return 'Verified';
    if (value === 'rejected') return 'Rejected';
    return 'Pending';
  }

  function adminBadge(state) {
    if (state === 'Verified') return { style: 'background:rgba(29,185,84,0.1);color:#1DB954;', text: '* Verified' };
    if (state === 'Rejected') return { style: 'background:rgba(239,68,68,0.1);color:#ef4444;', text: '* Rejected' };
    return { style: 'background:rgba(234,179,8,0.2);color:#eab308;', text: '* Pending' };
  }

  function adminCard(property) {
    const state = adminState(property.status);
    const badge = adminBadge(state);
    const actions = state === 'Pending'
      ? `<button onclick="viewDocument(this)" style="flex:1;background:#282828;color:#fff;padding:0.625rem;border-radius:0.5rem;border:none;font-size:0.8125rem;font-weight:600;cursor:pointer;">View Document</button>
         <button onclick="verifyProperty(this)" style="flex:1;background:#1DB954;color:#000;padding:0.625rem;border-radius:0.5rem;border:none;font-size:0.8125rem;font-weight:600;cursor:pointer;">Verify</button>
         <button onclick="rejectProperty(this)" style="flex:1;background:rgba(239,68,68,0.15);color:#ef4444;padding:0.625rem;border-radius:0.5rem;border:none;font-size:0.8125rem;font-weight:600;cursor:pointer;">Reject</button>`
      : `<button onclick="viewDocument(this)" style="flex:1;background:#282828;color:#fff;padding:0.625rem;border-radius:0.5rem;border:none;font-size:0.8125rem;font-weight:600;cursor:pointer;">View Document</button>`;

    return `
      <div class="prop-card" data-prop-status="${state}" data-seller="Backend Seller" data-name="${escapeHtml(property.title)}" data-doctype="Ownership Document" data-id="${escapeHtml(property.id)}" data-location="${escapeHtml([property.address, property.city].filter(Boolean).join(', '))}" style="background:#1a1a1a;border-radius:0.75rem;border:1px solid rgba(255,255,255,0.1);overflow:hidden;">
        <div style="padding:1.25rem;display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="display:flex;gap:0.75rem;align-items:center;">
            <div style="width:2.25rem;height:2.25rem;border-radius:0.5rem;background:rgba(29,185,84,0.1);display:flex;align-items:center;justify-content:center;color:#1DB954;">H</div>
            <div>
              <div style="font-weight:600;font-size:0.9375rem;" class="prop-name">${escapeHtml(property.title)}</div>
              <div style="color:#9ca3af;font-size:0.8125rem;">${escapeHtml([property.address, property.city].filter(Boolean).join(', '))}</div>
            </div>
          </div>
          <span class="prop-status-badge" style="${badge.style}padding:0.25rem 0.75rem;border-radius:9999px;font-size:0.75rem;font-weight:600;">${badge.text}</span>
        </div>
        <div style="padding:0 1.25rem 1rem;">
          <div style="background:#111;border-radius:0.5rem;padding:0.875rem;display:grid;grid-template-columns:repeat(2,1fr);gap:0.75rem;">
            <div><div style="font-size:0.6875rem;color:#6b7280;text-transform:uppercase;">Property ID</div><div style="font-weight:600;color:#fff;">${escapeHtml(property.id)}</div></div>
            <div><div style="font-size:0.6875rem;color:#6b7280;text-transform:uppercase;">Seller</div><div class="prop-seller" style="font-weight:600;color:#fff;">Backend Seller</div><div style="font-size:0.8125rem;color:#9ca3af">${escapeHtml(SELLER_ID)}</div></div>
            <div><div style="font-size:0.6875rem;color:#6b7280;text-transform:uppercase;">Document</div><div class="prop-doctype" style="font-weight:600;color:#fff;">Ownership Document</div></div>
            <div><div style="font-size:0.6875rem;color:#6b7280;text-transform:uppercase;">Submitted</div><div style="font-weight:600;color:#fff;">${new Date(property.createdAt || Date.now()).toLocaleDateString('en-IN')}</div></div>
          </div>
        </div>
        <div class="prop-actions" style="padding:0 1.25rem 1.25rem;display:flex;gap:0.75rem;">${actions}</div>
      </div>`;
  }

  async function renderAdminPropertiesFromApi() {
    const container = document.getElementById('property-cards');
    if (!container) return;
    try {
      const properties = await getProperties();
      container.innerHTML = properties.length ? properties.map(adminCard).join('') : '<div style="grid-column:1/-1;color:#9ca3af;text-align:center;padding:2rem;">No backend properties found.</div>';
      if (typeof window.updatePropCounts === 'function') window.updatePropCounts();
      if (typeof window.filterPropStatusApply === 'function') window.filterPropStatusApply();
    } catch (error) {
      handleError(error, 'Could not load admin properties');
    }
  }

  function installAdminCrud() {
    if (!document.getElementById('property-cards')) return;

    window.verifyProperty = async function verifyProperty(btn) {
      const card = btn.closest('.prop-card');
      const id = card && card.dataset.id;
      if (!id) return;
      try {
        await API.updateProperty(id, { status: 'approved' }, 'admin');
        await renderAdminPropertiesFromApi();
        toast('Property verified in backend.');
      } catch (error) {
        handleError(error, 'Could not verify property');
      }
    };

    window.rejectProperty = async function rejectProperty(btn) {
      const card = btn.closest('.prop-card');
      const id = card && card.dataset.id;
      if (!id) return;
      try {
        await API.updateProperty(id, { status: 'rejected' }, 'admin');
        await renderAdminPropertiesFromApi();
        toast('Property rejected in backend.');
      } catch (error) {
        handleError(error, 'Could not reject property');
      }
    };

    window.viewDocument = function viewDocument(btn) {
      const card = btn.closest('.prop-card');
      if (!card) return;
      window.__teCurrentAdminCard = card;
      const set = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || '-';
      };
      set('modal-doctype', card.dataset.doctype);
      set('modal-propname', card.dataset.name);
      set('modal-seller', card.dataset.seller);
      set('modal-selleremail', SELLER_ID);
      set('modal-propid', card.dataset.id);
      set('modal-location', card.dataset.location);
      set('modal-doctypefull', card.dataset.doctype);
      set('modal-date', new Date().toLocaleDateString('en-IN'));
      set('modal-filepath', '/docs/' + String(card.dataset.id || 'property') + '-document.pdf');
      const actions = document.getElementById('modal-actions');
      if (actions) {
        actions.innerHTML = card.dataset.propStatus === 'Pending'
          ? '<button onclick="modalVerify()" style="flex:1;background:#1DB954;color:#000;padding:0.75rem;border-radius:0.5rem;border:none;font-weight:600;cursor:pointer;font-size:0.875rem;">Verify Document</button><button onclick="modalReject()" style="flex:1;background:rgba(239,68,68,0.15);color:#ef4444;padding:0.75rem;border-radius:0.5rem;border:none;font-weight:600;cursor:pointer;font-size:0.875rem;">Reject Document</button>'
          : '<div style="flex:1;text-align:center;padding:0.75rem;border-radius:0.5rem;font-size:0.875rem;font-weight:600;background:#282828;color:#fff;">Backend status: ' + card.dataset.propStatus + '</div>';
      }
      const modal = document.getElementById('docModal');
      if (modal) modal.style.display = 'flex';
    };

    window.modalVerify = function modalVerify() {
      const card = window.__teCurrentAdminCard;
      if (card) window.verifyProperty(card.querySelector('.prop-actions button'));
      if (typeof window.closeDocModal === 'function') window.closeDocModal();
    };

    window.modalReject = function modalReject() {
      const card = window.__teCurrentAdminCard;
      if (card) window.rejectProperty(card.querySelector('.prop-actions button'));
      if (typeof window.closeDocModal === 'function') window.closeDocModal();
    };

    renderAdminPropertiesFromApi();
  }

  async function loadIndexProperties() {
    if (!document.getElementById('property-grid') || typeof window.renderPropertyCards !== 'function') return;
    try {
      const properties = visibleCatalogProperties(await getProperties()).map(API.toLandingProperty);
      if (typeof allProperties !== 'undefined') {
        allProperties.length = 0;
        properties.forEach((property) => allProperties.push(property));
      }
      if (typeof featuredProperties !== 'undefined') {
        Object.keys(featuredProperties).forEach((key) => delete featuredProperties[key]);
        properties.forEach((property) => {
          featuredProperties[property.id] = property;
        });
      }
      window.renderPropertyCards(properties);
    } catch (error) {
      handleError(error, 'Could not load landing properties');
    }
  }

  function installSignupApiWrite() {
    if (!document.querySelector('#auth-page form') || typeof window.handleLogin !== 'function') return;
    const original = window.handleLogin;
    window.handleLogin = async function handleLoginWithApi(event) {
      if (typeof currentTab !== 'undefined' && currentTab === 'signup') {
        event.preventDefault();
        const form = event.target;
        const emailInput = form.querySelector('input[type="email"]');
        const passwordInput = document.getElementById('password');
        const nameInput = form.querySelector('#name-field input');
        const confirmInput = form.querySelector('#confirm-password-field input');
        const password = passwordInput ? passwordInput.value : '';
        if (confirmInput && confirmInput.value !== password) {
          toast('Passwords do not match.', 'error');
          return;
        }
        try {
          await API.createUser({
            name: nameInput && nameInput.value ? nameInput.value : 'truEstate User',
            email: emailInput ? emailInput.value : '',
            password,
            role: typeof selectedRole !== 'undefined' ? selectedRole : 'buyer',
          }, 'buyer');
        } catch (error) {
          handleError(error, 'Could not create signup user');
          return;
        }
      }
      return original.call(this, event);
    };
  }

  function findBuyerProperty(id) {
    try {
      if (typeof currentProperties !== 'undefined') {
        const match = currentProperties.find((property) => String(property.id) === String(id));
        if (match) return match;
      }
      if (typeof allProperties !== 'undefined') {
        return allProperties.find((property) => String(property.id) === String(id));
      }
    } catch (_) {}
    return null;
  }

  async function loadBuyerProperties() {
    if (!document.getElementById('recommendations-list') || typeof window.renderRecommendations !== 'function') return;
    try {
      const mapped = visibleCatalogProperties(await getProperties()).map(API.toBuyerProperty);
      if (typeof allProperties !== 'undefined') {
        allProperties.length = 0;
        mapped.forEach((property) => allProperties.push(property));
      }
      if (typeof currentProperties !== 'undefined') currentProperties = [...allProperties];
      if (typeof window.renderPopularCards === 'function') window.renderPopularCards(currentProperties);
      window.renderRecommendations(currentProperties);
      if (typeof window.updateUnderConsiderationPage === 'function') window.updateUnderConsiderationPage();
      if (typeof window.updateShortlistPage === 'function') window.updateShortlistPage();
    } catch (error) {
      handleError(error, 'Could not load buyer properties');
    }
  }

  function selectedVisitIso() {
    try {
      const year = typeof svCurrentDate !== 'undefined' ? svCurrentDate.getFullYear() : new Date().getFullYear();
      const month = typeof svCurrentDate !== 'undefined' ? svCurrentDate.getMonth() : new Date().getMonth();
      const day = typeof svSelectedDay !== 'undefined' && svSelectedDay ? svSelectedDay : new Date().getDate() + 1;
      const selected = new Date(year, month, day, 10, 0, 0);
      if (selected <= new Date()) selected.setDate(selected.getDate() + 1);
      return selected.toISOString();
    } catch (_) {
      return new Date(Date.now() + 86400000).toISOString();
    }
  }

  async function syncBuyerNegotiationsFromApi() {
    if (!document.getElementById('dynamic-offers') && !document.getElementById('dynamic-purchases')) return;
    try {
      const [properties, negotiations] = await Promise.all([API.listProperties(), API.listNegotiations()]);
      await syncNegotiationPropertyLocks(properties, negotiations);
      const byId = new Map(properties.map((property) => [String(property.id), property]));
      const offers = negotiations.map((negotiation) => {
        const property = byId.get(String(negotiation.propertyId)) || {};
        const status = String(negotiation.status || 'pending').toLowerCase();
        return {
          id: negotiation.id,
          backendId: negotiation.id,
          propertyId: negotiation.propertyId,
          backendPropertyId: negotiation.propertyId,
          title: property.title || negotiation.propertyId,
          area: [property.address, property.city].filter(Boolean).join(', ') || 'Backend property',
          img: property.images && property.images[0],
          listingPrice: property.price || negotiation.offeredPrice,
          priceFmt: API.shortMoney(property.price || negotiation.offeredPrice),
          offerAmt: negotiation.offeredPrice,
          payMode: 'Backend',
          status: status === 'pending' ? 'pending' : status,
          dealStatus: status === 'accepted' ? 'in-progress' : undefined,
          date: new Date(negotiation.createdAt || Date.now()).toLocaleDateString('en-IN'),
        };
      });
      writeSubmittedOffers(offers);
      if (typeof window.updateNegotiatePage === 'function') window.updateNegotiatePage();
      if (typeof window.updatePurchaseInitiationPage === 'function') window.updatePurchaseInitiationPage();
    } catch (error) {
      console.warn('[Evaluation 4 API] Buyer negotiation refresh skipped', error);
    }
  }

  function installBuyerNegotiationViews() {
    if (typeof window.updateNegotiatePage === 'function' && !window.__teActiveNegotiationFilter) {
      const originalUpdateNegotiatePage = window.updateNegotiatePage;
      window.updateNegotiatePage = function updateActiveNegotiationsOnly() {
        const allOffers = readSubmittedOffers();
        const activeOffers = allOffers.filter((offer) => activeOfferStatus(offer.status));
        const previousOffers = typeof submittedOffers !== 'undefined' ? submittedOffers : allOffers;

        if (!activeOffers.length) {
          const container = document.getElementById('dynamic-offers');
          if (container) {
            container.innerHTML = '<div class="card" style="text-align:center;color:#9ca3af;padding:2rem;">No active negotiations. Accepted offers are shown in Purchase Initiation.</div>';
          }
          assignSubmittedOffers(allOffers);
          return;
        }

        assignSubmittedOffers(activeOffers);
        try {
          return originalUpdateNegotiatePage.apply(this, arguments);
        } finally {
          assignSubmittedOffers(previousOffers);
          localStorage.setItem('submittedOffers', JSON.stringify(allOffers));
        }
      };
      window.__teActiveNegotiationFilter = true;
    }

    if (typeof window.withdrawOffer === 'function' && !window.__teWithdrawOfferApi) {
      const originalWithdrawOffer = window.withdrawOffer;
      window.withdrawOffer = async function withdrawOfferWithApi(id) {
        const offers = readSubmittedOffers();
        const offer = offers.find((item) => offerMatchesId(item, id));
        try {
          const negotiationId = backendNegotiationId(offer, id);
          if (negotiationId) await API.updateNegotiation(negotiationId, { status: 'withdrawn' }, 'buyer');
          await setBackendPropertyStatus(backendPropertyIdFromOffer(offer), 'approved', 'agent');
        } catch (error) {
          console.warn('[Evaluation 4 API] Withdraw sync skipped', error);
        }
        const result = originalWithdrawOffer.apply(this, arguments);
        await loadBuyerProperties();
        await syncBuyerNegotiationsFromApi();
        return result;
      };
      window.__teWithdrawOfferApi = true;
    }

    if (typeof window.acceptSellerOffer === 'function' && !window.__teBuyerAcceptCounterApi) {
      const originalAcceptSellerOffer = window.acceptSellerOffer;
      window.acceptSellerOffer = async function acceptSellerOfferWithApi(id) {
        const offers = readSubmittedOffers();
        const offer = offers.find((item) => offerMatchesId(item, id));
        try {
          const negotiationId = backendNegotiationId(offer, id);
          if (negotiationId) await API.updateNegotiation(negotiationId, { status: 'accepted' }, 'buyer');
          await setBackendPropertyStatus(backendPropertyIdFromOffer(offer), 'sold', 'agent');
        } catch (error) {
          console.warn('[Evaluation 4 API] Counter accept sync skipped', error);
        }
        const result = originalAcceptSellerOffer.apply(this, arguments);
        await syncBuyerNegotiationsFromApi();
        return result;
      };
      window.__teBuyerAcceptCounterApi = true;
    }
  }

  function installBuyerApiWrites() {
    if (!document.getElementById('recommendations-list')) return;
    installBuyerNegotiationViews();

    if (typeof window.openModal === 'function') {
      const originalOpenModal = window.openModal;
      window.openModal = function openModalWithStableId(id) {
        const result = originalOpenModal.apply(this, arguments);
        try {
          currentPropertyId = id;
        } catch (_) {}
        return result;
      };
    }

    if (typeof window.addToShortlistDirect === 'function') {
      const originalShortlist = window.addToShortlistDirect;
      window.addToShortlistDirect = async function addToShortlistDirectWithApi(id) {
        const property = findBuyerProperty(id);
        let wasShortlisted = false;
        try {
          wasShortlisted = typeof shortlistList !== 'undefined' && shortlistList.some((item) => String(item) === String(id));
        } catch (_) {}
        const result = originalShortlist.apply(this, arguments);
        if (!property) return result;

        try {
          const propertyId = property.backendId || property.id;
          const map = JSON.parse(localStorage.getItem('truEstate_shortlist_map') || '{}');
          if (!wasShortlisted) {
            const created = await API.createShortlist({ userId: BUYER_ID, propertyId }, 'buyer');
            if (created && created.id) map[String(propertyId)] = created.id;
          } else if (map[String(propertyId)]) {
            await API.deleteShortlist(map[String(propertyId)], 'buyer');
            delete map[String(propertyId)];
          }
          localStorage.setItem('truEstate_shortlist_map', JSON.stringify(map));
        } catch (error) {
          handleError(error, 'Could not sync shortlist');
        }
        return result;
      };
    }

    if (typeof window.submitOffer === 'function') {
      const originalSubmitOffer = window.submitOffer;
      window.submitOffer = async function submitOfferWithApi() {
        const property = findBuyerProperty(typeof currentPropertyId !== 'undefined' ? currentPropertyId : null);
        const amount = API.numberFrom(document.getElementById('offer-amount') && document.getElementById('offer-amount').value, 0);
        let createdNegotiation = null;
        const propertyId = property && (property.backendId || property.id);

        if (property && amount > 0) {
          try {
            const backendProperty = (await API.listProperties()).find((item) => String(item.id) === String(propertyId));
            const backendStatus = String((backendProperty && backendProperty.status) || '').toLowerCase();
            if (backendProperty && !['approved', 'available'].includes(backendStatus)) {
              toast('This property is already blocked for another offer. Please choose another property.', 'error');
              await loadBuyerProperties();
              return;
            }

            createdNegotiation = await API.createNegotiation({
              propertyId,
              buyerId: BUYER_ID,
              offeredPrice: amount,
              status: 'pending',
            }, 'buyer');
            await setBackendPropertyStatus(propertyId, 'under_offer', 'agent');
          } catch (error) {
            handleError(error, 'Could not submit offer');
            return;
          }
        }

        const result = originalSubmitOffer.apply(this, arguments);

        if (createdNegotiation && property) {
          const offers = readSubmittedOffers();
          const latest = offers.slice().reverse().find((offer) => {
            return !offer.backendId && (String(offer.propertyId) === String(property.id) || offer.title === property.title);
          });
          if (latest) {
            latest.id = createdNegotiation.id;
            latest.backendId = createdNegotiation.id;
            latest.propertyId = propertyId;
            latest.backendPropertyId = propertyId;
            latest.status = 'pending';
          }
          writeSubmittedOffers(offers);
          if (typeof window.updateNegotiatePage === 'function') window.updateNegotiatePage();
          await loadBuyerProperties();
        }

        return result;
      };
    }

    if (typeof window.confirmScheduleVisit === 'function') {
      const originalConfirmVisit = window.confirmScheduleVisit;
      window.confirmScheduleVisit = async function confirmScheduleVisitWithApi() {
        const property = findBuyerProperty(typeof currentPropertyId !== 'undefined' ? currentPropertyId : null);
        const scheduledDate = selectedVisitIso();
        if (property) {
          try {
            const propertyId = property.backendId || property.id;
            const visit = await API.createVisit({ propertyId, visitorId: BUYER_ID, scheduledDate }, 'buyer');
            const map = JSON.parse(localStorage.getItem('truEstate_visit_map') || '{}');
            if (visit && visit.id) map[String(propertyId)] = visit.id;
            localStorage.setItem('truEstate_visit_map', JSON.stringify(map));
            try {
              await API.createBooking({
                propertyId,
                buyerId: BUYER_ID,
                date: scheduledDate.slice(0, 10),
                time: scheduledDate.slice(11, 16),
                notes: 'Buyer requested a site visit from the frontend',
              }, 'buyer');
            } catch (bookingError) {
              console.warn('[Evaluation 4 API] Booking mirror skipped', bookingError);
            }
          } catch (error) {
            handleError(error, 'Could not schedule visit');
            return;
          }
        }
        return originalConfirmVisit.apply(this, arguments);
      };
    }

    loadBuyerProperties();
    syncBuyerNegotiationsFromApi().then(loadBuyerProperties);
  }

  function installSuperuserCrud() {
    if (!document.getElementById('section-users') || !document.getElementById('section-properties')) return;

    async function loadUsersFromApi() {
      try {
        const users = (await API.listUsers('superuser')).map(API.toSuperUser);
        if (typeof currentUsers !== 'undefined') currentUsers = users;
        if (typeof window.renderUsersTable === 'function') window.renderUsersTable(users);
        const total = document.getElementById('stat-total-users');
        const active = document.getElementById('stat-active-users');
        if (total) total.textContent = users.length;
        if (active) active.textContent = users.filter((user) => user.status === 'Active').length;
      } catch (error) {
        handleError(error, 'Could not load users');
      }
    }

    async function loadPropertiesFromApi() {
      try {
        const properties = (await API.listProperties()).map(API.toSuperProperty);
        if (typeof currentProps !== 'undefined') currentProps = properties;
        if (typeof window.renderPropertiesTable === 'function') window.renderPropertiesTable(properties);
        const total = document.getElementById('stat-total-props');
        if (total) total.textContent = properties.length;
      } catch (error) {
        handleError(error, 'Could not load properties');
      }
    }

    window.loadUsers = loadUsersFromApi;
    window.loadProperties = loadPropertiesFromApi;
    window.initDashboardStats = async function initDashboardStatsApi() {
      await Promise.all([loadUsersFromApi(), loadPropertiesFromApi()]);
    };

    window.deleteUser = async function deleteUserApi(id) {
      if (!confirm('Delete this user from the backend?')) return;
      try {
        await API.deleteUser(id, 'superuser');
        await loadUsersFromApi();
        toast('User deleted from backend.');
      } catch (error) {
        handleError(error, 'Could not delete user');
      }
    };

    window.deleteProperty = async function deletePropertyApi(id) {
      if (!confirm('Delete this property from the backend?')) return;
      try {
        await API.deleteProperty(id, 'superuser');
        await loadPropertiesFromApi();
        toast('Property deleted from backend.');
      } catch (error) {
        handleError(error, 'Could not delete property');
      }
    };

    const userForm = document.getElementById('user-form');
    if (userForm) {
      userForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        try {
          const role = document.getElementById('user-role').value;
          await API.createUser({
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            role,
            password: 'Eval@12345',
          }, 'superuser');
          document.getElementById('user-modal').classList.remove('active');
          await loadUsersFromApi();
          toast('User created in backend.');
        } catch (error) {
          handleError(error, 'Could not create user');
        }
      }, true);
    }

    const propertyForm = document.getElementById('prop-form');
    if (propertyForm) {
      propertyForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        try {
          await API.createProperty({
            title: document.getElementById('prop-title').value,
            location: document.getElementById('prop-location').value,
            price: document.getElementById('prop-price').value,
            status: document.getElementById('prop-status').value,
          }, 'superuser');
          document.getElementById('prop-modal').classList.remove('active');
          await loadPropertiesFromApi();
          toast('Property created in backend.');
        } catch (error) {
          handleError(error, 'Could not create property');
        }
      }, true);
    }

    setTimeout(() => {
      loadUsersFromApi();
      loadPropertiesFromApi();
    }, 0);
  }

  ready(() => {
    installSignupApiWrite();
    loadIndexProperties();
    installSellerCrud();
    installAdminCrud();
    installBuyerApiWrites();
    installSuperuserCrud();
  });

  window.TruEstateEvaluation4 = {
    renderSellerListingsFromApi,
    renderAdminPropertiesFromApi,
    loadBuyerProperties,
    syncBuyerNegotiationsFromApi,
    loadIndexProperties,
  };
})();
