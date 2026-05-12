// src/pages/organizer/EditEvent.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventById, updateEvent, getCategories } from '../../services/eventService';
import './eventForm.css';

export default function EditEvent() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [categories,  setCategories]  = useState([]);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [coverPreview, setCoverPreview] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', location: '', venueName: '',
    category: '', date: '', price: '', totalTickets: '',
  });

  useEffect(() => {
    const cats = getCategories();
    setCategories(cats.data || []);
    loadEvent();
  }, []);

  const loadEvent = async () => {
    try {
      const res = await getEventById(id);
      const ev  = res?.data || res;
      if (ev.thumbnailUrl) setCoverPreview(ev.thumbnailUrl);
      
      const fmtDate = (d) => {
        if (!d) return '';
        try { return new Date(d).toISOString().slice(0, 16); } catch { return ''; }
      };

      setForm({
        title:        ev.title        || '',
        description:  ev.description  || '',
        location:     ev.location     || '',
        venueName:    ev.venueName    || '',
        category:     ev.category     || '',
        date:         fmtDate(ev.date),
        price:        ev.price        ?? '',
        totalTickets: ev.totalTickets ?? '',
      });
    } catch {
      setError('Failed to load event.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    if (!form.title || !form.location || !form.category || !form.date || !form.totalTickets) {
        setError('Please fill in all required fields.');
        return;
    }
    try {
      setSaving(true);
      const payload = {
        title:        form.title,
        description:  form.description,
        location:     form.location,
        category:     form.category,
        date:         new Date(form.date).toISOString(),
        price:        Number(form.price) || 0,
        totalTickets: Number(form.totalTickets),
      };
      await updateEvent(id, payload);
      setSuccess(' Event updated successfully');
      setTimeout(() => navigate('/organizer/events'), 1500);
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="page-container flex-center">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="page-container">

      <div className="ef-header">
        <div className="ef-header-left">
          <h1>Edit Event</h1>
          <p>Modify event details and save changes.</p>
        </div>
        <button className="ef-publish-btn" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error   && <div className="ef-alert-error">{error}</div>}
      {success && <div className="ef-alert-success">{success}</div>}

      {/* Basic Info */}
      <div className="ef-section">
        <div className="ef-section-label">
          <h3>Basic Info</h3>
          <p>The core details of your event.</p>
        </div>
        <div className="ef-section-fields">
          <div className="ef-field">
            <label className="ef-label">Event Title *</label>
            <input name="title" className="ef-input" placeholder="Event Title"
              value={form.title} onChange={handleChange} />
          </div>
          <div className="ef-field">
            <label className="ef-label">Event Description</label>
            <textarea name="description" className="ef-textarea" placeholder="Description"
              value={form.description} onChange={handleChange} rows={5} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="ef-section">
        <div className="ef-section-label">
          <h3>Details &amp; Logistics</h3>
          <p>Where and when it happens.</p>
        </div>
        <div className="ef-section-fields">
          <div className="ef-field">
            <label className="ef-label">Location / City *</label>
            <div className="ef-venue-wrap">
              <span className="ef-venue-icon">📍</span>
              <input name="location" className="ef-input" placeholder="Cairo, Egypt"
                value={form.location} onChange={handleChange} />
            </div>
          </div>
          <div className="ef-row">
            <div className="ef-field">
              <label className="ef-label">Category *</label>
              <select name="category" className="ef-select" value={form.category} onChange={handleChange}>
                <option value="">-- Select Category --</option>
                {categories.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="ef-field">
              <label className="ef-label">Event Date &amp; Time *</label>
              <input type="datetime-local" name="date" className="ef-select"
                value={form.date} onChange={handleChange} />
            </div>
          </div>
        </div>
      </div>

      {/* Ticketing */}
      <div className="ef-section">
        <div className="ef-section-label">
          <h3>Ticketing</h3>
          <p>Pricing and Capacity.</p>
        </div>
        <div className="ef-section-fields">
          <div className="ef-ticket-card">
            <div className="ef-ticket-price-row">
              <div className="ef-field">
                <label className="ef-label">Ticket Price (USD)</label>
                <div className="ef-price-display">
                  <span className="ef-price-prefix">$</span>
                  <input name="price" type="number" min="0" step="0.01"
                    className="ef-price-input" placeholder="0.00"
                    value={form.price} onChange={handleChange} />
                </div>
              </div>
              <div className="ef-field">
                <label className="ef-label">Total Tickets *</label>
                <input name="totalTickets" type="number" min="1"
                  className="ef-input" style={{ fontSize: '1.4rem', fontWeight: 700 }}
                  placeholder="100" value={form.totalTickets} onChange={handleChange} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ef-footer">
        <button className="ef-draft-btn" onClick={() => navigate('/organizer/events')} disabled={saving}>
          Cancel
        </button>
        <button className="ef-launch-btn" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Update Experience'}
        </button>
      </div>

    </div>
  );
}