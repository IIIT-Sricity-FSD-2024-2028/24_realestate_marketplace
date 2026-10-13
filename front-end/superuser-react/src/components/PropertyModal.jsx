import { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import FormField from './FormField.jsx';
import { updateProperty } from '../api/superuserApi.js';
import { errorText } from '../api/client.js';
import { useToast } from '../context/ToastContext.jsx';

export default function PropertyModal({ open, onClose, property, onSaved }) {
  const showToast = useToast();

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'apartment',
    listingType: 'sale',
    price: '',
    areaSqft: '',
    bedrooms: '2',
    bathrooms: '2',
    address: '',
    city: '',
    state: '',
    status: 'available',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (property) {
      setForm({
        title: property.title || '',
        description: property.description || '',
        type: property.type || 'apartment',
        listingType: property.listingType || 'sale',
        price: property.price || '',
        areaSqft: property.areaSqft || '',
        bedrooms: property.bedrooms ?? '2',
        bathrooms: property.bathrooms ?? '2',
        address: property.address || '',
        city: property.city || '',
        state: property.state || '',
        status: property.status || 'available',
      });
    }
    setError('');
  }, [property, open]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!property) return;
    setError('');

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type,
      listingType: form.listingType,
      price: Number(form.price),
      areaSqft: Number(form.areaSqft),
      bedrooms: Number(form.bedrooms),
      bathrooms: Number(form.bathrooms),
      address: form.address.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      status: form.status,
    };

    setSubmitting(true);
    try {
      await updateProperty(property.id, payload);
      showToast('Property updated successfully');
      onClose();
      onSaved();
    } catch (err) {
      setError(errorText(err, 'Failed to save property'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit Property"
      maxWidth="38rem"
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="modal-body modal-scroll">
          {error && <div className="form-alert-error">{error}</div>}

          <FormField
            label="Property Title"
            type="text"
            required
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
          />

          <FormField
            label="Description"
            as="textarea"
            rows="3"
            required
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
          />

          <div className="form-row">
            <FormField
              label="Type"
              as="select"
              value={form.type}
              onChange={(e) => updateField('type', e.target.value)}
            >
              <option value="apartment">Apartment</option>
              <option value="villa">Villa</option>
              <option value="plot">Plot</option>
              <option value="commercial">Commercial</option>
              <option value="penthouse">Penthouse</option>
            </FormField>

            <FormField
              label="Listing Type"
              as="select"
              value={form.listingType}
              onChange={(e) => updateField('listingType', e.target.value)}
            >
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </FormField>
          </div>

          <div className="form-row">
            <FormField
              label="Price (₹)"
              type="number"
              min="1"
              required
              value={form.price}
              onChange={(e) => updateField('price', e.target.value)}
            />

            <FormField
              label="Area (sqft)"
              type="number"
              min="1"
              required
              value={form.areaSqft}
              onChange={(e) => updateField('areaSqft', e.target.value)}
            />
          </div>

          <div className="form-row">
            <FormField
              label="Bedrooms"
              type="number"
              min="0"
              max="20"
              value={form.bedrooms}
              onChange={(e) => updateField('bedrooms', e.target.value)}
            />

            <FormField
              label="Bathrooms"
              type="number"
              min="1"
              max="20"
              value={form.bathrooms}
              onChange={(e) => updateField('bathrooms', e.target.value)}
            />
          </div>

          <FormField
            label="Address"
            type="text"
            required
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
          />

          <div className="form-row">
            <FormField
              label="City"
              type="text"
              required
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
            />

            <FormField
              label="State"
              type="text"
              required
              value={form.state}
              onChange={(e) => updateField('state', e.target.value)}
            />
          </div>

          <FormField
            label="Status"
            as="select"
            value={form.status}
            onChange={(e) => updateField('status', e.target.value)}
          >
            <option value="available">Available</option>
            <option value="under_offer">Under Offer</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </FormField>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving…' : 'Save Property'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
