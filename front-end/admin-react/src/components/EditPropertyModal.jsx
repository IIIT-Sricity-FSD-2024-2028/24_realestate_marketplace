import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';
import { getProperty, updateProperty } from '../api/adminApi.js';
import { errorText } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

const EMPTY = {
  title: '', description: '', type: 'apartment', listingType: 'sale', price: '', areaSqft: '',
  bedrooms: '2', bathrooms: '2', address: '', city: '', state: '', status: 'available',
};

/**
 * "Edit Property" dialog used by Manage Listings.
 * Opens when `propertyId` is set: GET /properties/:id fills the form, then
 * Save sends PATCH /properties/:id. The browser enforces the same field rules
 * as before (title 10–150 chars, description ≥ 20, price/area ≥ 1, …) and any
 * backend validation errors are listed under the form.
 *
 * Fix vs. the old page: `state` is NOT sent. The backend derives it from the
 * city and rejects it in the payload ("property state should not exist"),
 * which made every save on the old HTML page fail. State is shown read-only.
 */
export default function EditPropertyModal({ propertyId, onClose, onSaved }) {
  const showToast = useToast();
  const [values, setValues] = useState(EMPTY);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Load the property each time the dialog opens for a new id.
  useEffect(() => {
    if (!propertyId) return;
    setValues(EMPTY);
    setFormError('');
    getProperty(propertyId)
      .then((res) => {
        const p = res.data;
        setValues({
          title: p.title, description: p.description, type: p.type, listingType: p.listingType,
          price: String(p.price), areaSqft: String(p.areaSqft), bedrooms: String(p.bedrooms),
          bathrooms: String(p.bathrooms), address: p.address, city: p.city, state: p.state, status: p.status,
        });
      })
      .catch((err) => showToast(err.message || 'Failed to load property', 'error'));
  }, [propertyId, showToast]);

  const set = (field) => (value) => setValues((v) => ({ ...v, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    const payload = {
      title: values.title.trim(),
      description: values.description.trim(),
      type: values.type,
      listingType: values.listingType,
      price: Number(values.price),
      areaSqft: Number(values.areaSqft),
      bedrooms: Number(values.bedrooms),
      bathrooms: Number(values.bathrooms),
      address: values.address.trim(),
      city: values.city.trim(),
      // state is derived by the server from city — never sent.
      status: values.status,
    };
    setFormError('');
    setSaving(true);
    try {
      await updateProperty(propertyId, payload);
      showToast('Property updated successfully');
      onSaved();
    } catch (err) {
      setFormError(errorText(err, 'Failed to save property'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={!!propertyId} onClose={onClose} title="Edit Property" maxWidth="36rem">
      <form className="form-grid" onSubmit={submit}>
        <FormField className="span-all" label="Title" required minLength={10} maxLength={150}
          placeholder="e.g. 3BHK Spacious Apartment in Anna Nagar" value={values.title} onValueChange={set('title')} />
        <FormField className="span-all" label="Description" as="textarea" required minLength={20} rows={3}
          placeholder="At least 20 characters" value={values.description} onValueChange={set('description')} />
        <FormField label="Type" as="select" value={values.type} onValueChange={set('type')}>
          <option value="apartment">Apartment</option>
          <option value="villa">Villa</option>
          <option value="plot">Plot</option>
          <option value="commercial">Commercial</option>
          <option value="penthouse">Penthouse</option>
        </FormField>
        <FormField label="Listing Type" as="select" value={values.listingType} onValueChange={set('listingType')}>
          <option value="sale">Sale</option>
          <option value="rent">Rent</option>
        </FormField>
        <FormField label="Price (₹)" type="number" min="1" required value={values.price} onValueChange={set('price')} />
        <FormField label="Area (sqft)" type="number" min="1" required value={values.areaSqft} onValueChange={set('areaSqft')} />
        <FormField label="Bedrooms" type="number" min="0" max="20" required value={values.bedrooms} onValueChange={set('bedrooms')} />
        <FormField label="Bathrooms" type="number" min="1" max="20" required value={values.bathrooms} onValueChange={set('bathrooms')} />
        <FormField className="span-all" label="Address" required value={values.address} onValueChange={set('address')} />
        <FormField label="City" required restrict="alpha" value={values.city} onValueChange={set('city')} />
        <FormField label="State (set from city)" value={values.state} readOnly disabled onValueChange={set('state')} />
        <FormField className="span-all" label="Status" as="select" value={values.status} onValueChange={set('status')}>
          <option value="available">Available</option>
          <option value="under_offer">Under Offer</option>
          <option value="sold">Sold</option>
          <option value="rented">Rented</option>
        </FormField>
        {formError && <div className="form-error span-all">{formError}</div>}
        <div className="modal-actions span-all" style={{ marginTop: '0.5rem' }}>
          <button type="submit" className="btn btn-primary btn-grow" disabled={saving}>{saving ? 'Saving…' : 'Save Property'}</button>
          <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </Modal>
  );
}
