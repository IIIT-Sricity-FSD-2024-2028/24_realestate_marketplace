/**
 * AddPropertySection.jsx
 * Purpose: "Add New Property" form — validates every field, creates the
 *          listing (it starts "pending" until an admin approves it), then
 *          uploads the chosen photos (public) and ownership documents
 *          (private, admins only). A full plan (HTTP 402) opens the upgrade
 *          dialog while keeping the form filled in.
 * Inputs (props): data – useSellerData(); goTo(section)
 * Outputs: the multi-card form.
 * API calls: POST /properties, POST /properties/:id/images (multipart),
 *            POST /properties/:id/documents (multipart)
 */
import { useState } from 'react';
import { Card } from '../../../components/common/ui.jsx';
import { FormField, TextInput } from '../../../components/forms/FormControls.jsx';
import { useToast } from '../../../components/feedback/ToastProvider.jsx';
import { propertiesApi } from '../../../api/services.js';
import { errorText } from '../../../api/client.js';
import { isPositiveNumber, toNumber } from '../../../utils/validation.js';
import { PROPERTY_TYPES, SERVICE_CITIES, SERVICE_CITY_STATE } from '../../../utils/constants.js';
import { capitalize } from '../../../utils/format.js';
import { QuotaNotice, QuotaUpgradeModal } from '../components/QuotaNotice.jsx';

const EMPTY = {
  title: '',
  type: 'apartment',
  listingType: 'sale',
  readiness: 'Ready to Move',
  city: '',
  address: '',
  price: '',
  areaSqft: '',
  bedrooms: '',
  bathrooms: '',
  balcony: '',
  furnishing: 'Unfurnished',
  description: '',
};
const MAX_FILES = 10; // server limit per upload (MAX_UPLOAD_FILES)
const MAX_FILE_MB = 10; // server limit per file (MAX_UPLOAD_FILE_MB)
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const DOC_TYPES = [...IMAGE_TYPES, 'application/pdf'];

/** Checks a FileList against count/size/type limits; returns an error or ''. */
export function checkFiles(files, allowedTypes, label) {
  const list = Array.from(files || []);
  if (list.length > MAX_FILES) return 'You can upload at most ' + MAX_FILES + ' ' + label + ' at once.';
  const tooBig = list.find((f) => f.size > MAX_FILE_MB * 1024 * 1024);
  if (tooBig) return tooBig.name + ' is larger than ' + MAX_FILE_MB + 'MB.';
  const wrongType = list.find((f) => !allowedTypes.includes(f.type));
  if (wrongType) return wrongType.name + ' is not an accepted file type.';
  return '';
}

/** Field-by-field validation (old tvValidateAddProperty + the API's limits). */
export function validateNewProperty(f) {
  const e = {};
  if (f.title.trim().length < 10) e.title = 'Property Name must be at least 10 characters';
  else if (f.title.trim().length > 150) e.title = 'Property Name must be at most 150 characters';
  if (!SERVICE_CITY_STATE[f.city]) e.city = 'Please select one of our four cities';
  if (!f.address.trim()) e.address = 'Full Address is required';
  if (!isPositiveNumber(f.price)) e.price = 'Price must be a valid positive number';
  if (!isPositiveNumber(f.areaSqft)) e.areaSqft = 'Area must be a valid positive number';
  const beds = toNumber(f.bedrooms);
  if (f.bedrooms === '' || !Number.isInteger(beds) || beds > 20) e.bedrooms = 'Bedrooms must be a whole number from 0 to 20';
  const baths = toNumber(f.bathrooms);
  if (!Number.isInteger(baths) || baths < 1 || baths > 20) e.bathrooms = 'Bathrooms must be a whole number from 1 to 20';
  if (f.description.trim().length < 20) e.description = 'Description must be at least 20 characters';
  return e;
}

export default function AddPropertySection({ data, goTo }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState(null); // FileList of photos
  const [documents, setDocuments] = useState(null); // FileList of documents
  const [fileInputsKey, setFileInputsKey] = useState(0); // bump to clear <input type=file>
  const [submitting, setSubmitting] = useState(false);
  const [quotaMessage, setQuotaMessage] = useState(''); // 402 dialog text

  const set = (field) => (value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const found = validateNewProperty(form);
    const imageError = checkFiles(images, IMAGE_TYPES, 'photos');
    const docError = checkFiles(documents, DOC_TYPES, 'documents');
    if (imageError) found.images = imageError;
    if (docError) found.documents = docError;
    setErrors(found);
    if (Object.keys(found).length) {
      showToast('Please fill in all required property fields.', 'error');
      return;
    }

    // The listing record has no columns for readiness/furnishing/balcony,
    // so they are appended to the description where buyers can read them.
    const extras = ['Status: ' + form.readiness, 'Furnishing: ' + form.furnishing, form.balcony ? 'Balconies: ' + toNumber(form.balcony) : null].filter(
      Boolean,
    );

    setSubmitting(true);
    try {
      // 1) Create the listing (it starts pending admin review).
      const created = (
        await propertiesApi.create({
          title: form.title.trim(),
          description: form.description.trim() + '\n\n' + extras.join(' · '),
          type: form.type,
          listingType: form.listingType,
          price: toNumber(form.price),
          areaSqft: toNumber(form.areaSqft),
          bedrooms: toNumber(form.bedrooms),
          bathrooms: toNumber(form.bathrooms),
          address: form.address.trim(),
          city: form.city, // the server derives the state from the city
        })
      ).data;

      // 2) Photos (public) — a failure here doesn't undo the listing.
      if (images && images.length) {
        try {
          await propertiesApi.uploadImages(created.id, images);
        } catch (err) {
          showToast('Property submitted, but photo upload failed: ' + err.message, 'error');
        }
      }
      // 3) Ownership documents (private, admins only).
      if (documents && documents.length) {
        try {
          await propertiesApi.uploadDocuments(created.id, documents);
        } catch (err) {
          showToast('Property submitted, but document upload failed: ' + err.message, 'error');
        }
      }

      showToast('Property submitted! It is now pending admin review.');
      setForm(EMPTY);
      setImages(null);
      setDocuments(null);
      setFileInputsKey((k) => k + 1);
      data.reload('listings');
      data.reload('billing');
      goTo('my-listings');
    } catch (err) {
      // 402 = valid submission, but the plan is full → actionable dialog.
      if (err.status === 402) setQuotaMessage(err.message);
      else showToast('⚠️ ' + errorText(err, 'Failed to submit property'), 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const plan = data.billing && data.billing.plan;
  return (
    <div className="content">
      <div className="row-center gap-sm">
        <button type="button" className="icon-btn" onClick={() => goTo('my-listings')} aria-label="Back to My Listings">
          ←
        </button>
        <h1 className="page-title mb-0">Add New Property</h1>
      </div>
      <p className="page-subtitle mb-4">Fill in the details to create a new listing</p>
      {/* Plan quota shown before the form, not only after a rejection. */}
      <QuotaNotice billing={data.billing} listings={data.listings} onUpgrade={() => goTo('billing')} />

      <form onSubmit={submit} noValidate>
        <Card>
          <h2 className="card-title">🏠 Basic Information</h2>
          <div className="form-grid-2">
            <FormField id="np-title" label="Property Name" required error={errors.title}>
              <TextInput
                id="np-title"
                placeholder="e.g., Luxury 3BHK Apartment"
                maxLength={150}
                value={form.title}
                onValueChange={set('title')}
                error={errors.title}
              />
            </FormField>
            <FormField id="np-type" label="Property Type" required>
              <select id="np-type" className="form-control" value={form.type} onChange={(e) => set('type')(e.target.value)}>
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {capitalize(t)}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="np-tx" label="Transaction Type" required>
              <select id="np-tx" className="form-control" value={form.listingType} onChange={(e) => set('listingType')(e.target.value)}>
                <option value="sale">Sell</option>
                <option value="rent">Rent</option>
              </select>
            </FormField>
            <FormField id="np-ready" label="Status" required>
              <select id="np-ready" className="form-control" value={form.readiness} onChange={(e) => set('readiness')(e.target.value)}>
                <option>Ready to Move</option>
                <option>Under Construction</option>
              </select>
            </FormField>
          </div>
        </Card>

        <Card>
          <h2 className="card-title">📍 Location Details</h2>
          <div className="form-grid-2">
            {/* Only the four launch cities have an admin to verify listings. */}
            <FormField id="np-city" label="City" required error={errors.city} hint="We currently operate in these four cities only.">
              <select
                id="np-city"
                className={'form-control' + (errors.city ? ' is-invalid' : '')}
                value={form.city}
                onChange={(e) => set('city')(e.target.value)}
              >
                <option value="">Select a city</option>
                {SERVICE_CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField id="np-state" label="State">
              <input id="np-state" className="form-control" readOnly placeholder="Set by the city you pick" value={SERVICE_CITY_STATE[form.city] || ''} />
            </FormField>
            <FormField id="np-address" label="Full Address" required error={errors.address} className="span-2">
              <TextInput
                id="np-address"
                placeholder="e.g., 123 Main Street, Sector 5, Banjara Hills"
                value={form.address}
                onValueChange={set('address')}
                error={errors.address}
              />
            </FormField>
          </div>
        </Card>

        <Card>
          <h2 className="card-title">⚙️ Property Details</h2>
          <div className="form-grid-2">
            <FormField id="np-price" label={'Price (₹)' + (form.listingType === 'rent' ? ' per month' : '')} required error={errors.price}>
              <TextInput
                id="np-price"
                restrict="number"
                inputMode="numeric"
                placeholder="e.g., 1,25,00,000"
                value={form.price}
                onValueChange={set('price')}
                error={errors.price}
              />
            </FormField>
            <FormField id="np-area" label="Super Area (sqft)" required error={errors.areaSqft}>
              <TextInput
                id="np-area"
                restrict="number"
                inputMode="numeric"
                placeholder="e.g., 1500"
                value={form.areaSqft}
                onValueChange={set('areaSqft')}
                error={errors.areaSqft}
              />
            </FormField>
            <FormField id="np-beds" label="Bedrooms" required error={errors.bedrooms}>
              <TextInput
                id="np-beds"
                restrict="number"
                inputMode="numeric"
                placeholder="e.g., 3"
                value={form.bedrooms}
                onValueChange={set('bedrooms')}
                error={errors.bedrooms}
              />
            </FormField>
            <FormField id="np-baths" label="Bathrooms" required error={errors.bathrooms}>
              <TextInput
                id="np-baths"
                restrict="number"
                inputMode="numeric"
                placeholder="e.g., 2"
                value={form.bathrooms}
                onValueChange={set('bathrooms')}
                error={errors.bathrooms}
              />
            </FormField>
            <FormField id="np-balcony" label="Balcony">
              <TextInput id="np-balcony" restrict="number" inputMode="numeric" placeholder="e.g., 1" value={form.balcony} onValueChange={set('balcony')} />
            </FormField>
            <FormField id="np-furnishing" label="Furnishing" required>
              <select id="np-furnishing" className="form-control" value={form.furnishing} onChange={(e) => set('furnishing')(e.target.value)}>
                <option>Unfurnished</option>
                <option>Semi-Furnished</option>
                <option>Fully Furnished</option>
              </select>
            </FormField>
          </div>
          <p className="field-hint">Status, balconies and furnishing are added to the end of your description so buyers can see them.</p>
        </Card>

        <Card>
          <h2 className="card-title">📝 Property Description</h2>
          <FormField id="np-desc" label="Description" required error={errors.description}>
            <textarea
              id="np-desc"
              rows={5}
              className={'form-control' + (errors.description ? ' is-invalid' : '')}
              placeholder="Describe your property, its features, amenities, and any additional information (min 20 characters)..."
              value={form.description}
              onChange={(e) => set('description')(e.target.value)}
            />
          </FormField>
        </Card>

        <Card className="card-dashed">
          <h2 className="card-title">🖼️ Property Photos</h2>
          <FormField
            id="np-images"
            label="Photos buyers will see on the listing. JPG, PNG, or WEBP — up to 10MB each."
            error={errors.images}
            hint="Uploaded automatically once the listing is created. Public — shown to buyers."
          >
            <input
              key={'img-' + fileInputsKey}
              id="np-images"
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp"
              className="form-control"
              onChange={(e) => setImages(e.target.files)}
            />
          </FormField>
        </Card>

        <Card className="card-dashed">
          <h2 className="card-title">📄 Verification Documents</h2>
          <FormField
            id="np-docs"
            label="Upload proof of ownership (deed, tax receipt, ID) so an admin can verify this listing. PDF, JPG, or PNG — up to 10MB each."
            error={errors.documents}
            hint="Uploaded automatically once the listing is created. Private — only visible to admins (never shown to buyers)."
          >
            <input
              key={'doc-' + fileInputsKey}
              id="np-docs"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="form-control"
              onChange={(e) => setDocuments(e.target.files)}
            />
          </FormField>
        </Card>

        <div className="button-row">
          <button type="button" className="btn btn-outline" onClick={() => goTo('my-listings')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit for Review'}
          </button>
        </div>
      </form>

      <QuotaUpgradeModal
        open={!!quotaMessage}
        message={quotaMessage}
        planName={plan && plan.planName}
        onClose={() => setQuotaMessage('')}
        onUpgrade={() => {
          setQuotaMessage('');
          goTo('billing');
        }}
      />
    </div>
  );
}
