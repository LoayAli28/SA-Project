// src/pages/organizer/EditEvent.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEventById, updateEvent } from '../../services/eventService';
import api from '../../services/api';
import './eventForm.css';

export default function EditEvent() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [categories,  setCategories]  = useState([]);
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [eventStatus, setEventStatus] = useState('');
  const [coverPreview, setCoverPreview] = useState(null);
  const [attachmentFiles, setAttachmentFiles] = useState([]);

  const [form, setForm] = useState({
    title: '', description: '', location: '', venueName: '',
    categoryId: '', startDate: '', endDate: '',
    ticketPrice: '', maxCapacity: '',
  });

  useEffect(() => {
    api.get('/events/categories')
      .then(res => {
        const cats = res.data?.data || res.data || [];
        setCategories(Array.isArray(cats) ? cats : []);
      })
      .catch(() => setCategories([]));

    loadEvent();
  }, []);

  const loadEvent = async () => {
    try {
      const res = await getEventById(id);
      const ev  = res?.data || res;
      setEventStatus(ev.status || '');
      if (ev.thumbnailUrl) setCoverPreview(ev.thumbnailUrl);
      const fmtDate = (d) => d ? new Date(d).toISOString().slice(0, 16) : '';
      setForm({
        title:       ev.title        || '',
        description: ev.description  || '',
        location:    ev.location     || '',
        venueName:   ev.venueName    || '',
        categoryId:  ev.categoryId   || '',
        startDate:   fmtDate(ev.startDate),
        endDate:     fmtDate(ev.endDate),
        ticketPrice: ev.ticketPrice  ?? '',
        maxCapacity: ev.maxCapacity  ?? '',
      });
    } catch {
      setError('Failed to load event.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAttachmentAdd = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachmentFiles(prev => [...prev, file]);
    e.target.value = '';
  };

  const removeAttachment = (idx) =>
    setAttachmentFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setError(''); setSuccess('');
    try {
      setSaving(true);
      const payload = {
        categoryId:  form.categoryId  || undefined,
        title:       form.title       || undefined,
        description: form.description || undefined,
        location:    form.location    || undefined,
        venueName:   form.venueName   || undefined,
        startDate:   form.startDate   ? new Date(form.startDate).toISOString() : undefined,
        endDate:     form.endDate     ? new Date(form.endDate).toISOString()   : undefined,
        ticketPrice: form.ticketPrice !== '' ? Number(form.ticketPrice) : undefined,
        maxCapacity: form.maxCapacity !== '' ? Number(form.maxCapacity) : undefined,
      };
      await updateEvent(id, payload);
      setSuccess(eventStatus === 'Approved'
        ? '✅ Event updated and re-submitted for admin approval.'
        : '✅ Event updated successfully!');
      setTimeout(() => navigate('/organizer/events'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
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
          {eventStatus === 'Approved' && (
            <p className="ef-status-warn pending">
              ⚠️ Editing an approved event will re-submit it for admin review
            </p>
          )}
          {eventStatus === 'Rejected' && (
            <p className="ef-status-warn rejected">
              ❌ This event was rejected — fix the issues and re-submit
            </p>
          )}
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
          <p>The soul of your event. Keep it catchy and clear to attract the right audience.</p>
        </div>
        <div className="ef-section-fields">
          <div className="ef-field">
            <label className="ef-label">Event Title</label>
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
          <p>Where and when the magic happens.</p>
        </div>
        <div className="ef-section-fields">
          <div className="ef-field">
            <label className="ef-label">Location / City</label>
            <div className="ef-venue-wrap">
              <span className="ef-venue-icon">📍</span>
              <input name="location" className="ef-input" placeholder="Cairo, Egypt"
                value={form.location} onChange={handleChange} />
            </div>
          </div>
          <div className="ef-field">
            <label className="ef-label">Venue Name</label>
            <input name="venueName" className="ef-input" placeholder="Venue Name"
              value={form.venueName} onChange={handleChange} />
          </div>
          <div className="ef-row">
            <div className="ef-field">
              <label className="ef-label">Category</label>
              <select name="categoryId" className="ef-select" value={form.categoryId} onChange={handleChange}>
                <option value="">-- Select Category --</option>
                {categories.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="ef-field">
              <label className="ef-label">Start Date &amp; Time</label>
              <input type="datetime-local" name="startDate" className="ef-select"
                value={form.startDate} onChange={handleChange} />
            </div>
          </div>
          <div className="ef-field">
            <label className="ef-label">End Date &amp; Time</label>
            <input type="datetime-local" name="endDate" className="ef-select"
              value={form.endDate} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* Ticketing */}
      <div className="ef-section">
        <div className="ef-section-label">
          <h3>Ticketing</h3>
          <p>Update your pricing and capacity.</p>
        </div>
        <div className="ef-section-fields">
          <div className="ef-ticket-card">
            <div className="ef-ticket-price-row">
              <div className="ef-field">
                <label className="ef-label">Ticket Price (USD)</label>
                <div className="ef-price-display">
                  <span className="ef-price-prefix">$</span>
                  <input name="ticketPrice" type="number" min="0" step="0.01"
                    className="ef-price-input" placeholder="0.00"
                    value={form.ticketPrice} onChange={handleChange} />
                </div>
              </div>
              <div className="ef-field">
                <label className="ef-label">Max Capacity</label>
                <input name="maxCapacity" type="number" min="1"
                  className="ef-input" style={{ fontSize: '1.4rem', fontWeight: 700 }}
                  placeholder="500" value={form.maxCapacity} onChange={handleChange} />
              </div>
            </div>
            <div className="ef-autosave">
              <div className="ef-autosave-icon">💾</div>
              <div className="ef-autosave-text">
                <p>Draft Auto-Saved</p>
                <p>Your changes are preserved. Last saved just now.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media */}
      <div className="ef-section">
        <div className="ef-section-label">
          <h3>Media &amp; Assets</h3>
          <p>Update event cover and attachments.</p>
        </div>
        <div className="ef-section-fields">
          <div className="ef-upload-box" style={{ minHeight: coverPreview ? '220px' : '180px' }}>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              if (file) setCoverPreview(URL.createObjectURL(file));
            }} />
            {coverPreview
              ? <img src={coverPreview} alt="cover" className="ef-upload-preview" />
              : <>
                  <div className="ef-upload-icon">⬆</div>
                  <div className="ef-upload-title">Drag and drop event cover</div>
                  <div className="ef-upload-sub">Recommended: 1920×1080px (Max 5MB)</div>
                </>
            }
          </div>
          {attachmentFiles.length > 0 && (
            <div className="ef-attachments">
              {attachmentFiles.map((f, i) => (
                <div key={i} className="ef-attachment-item">
                  <div className="ef-attachment-left">
                    <span className="ef-attachment-icon">📄</span>
                    <div>
                      <div className="ef-attachment-name">{f.name}</div>
                      <div className="ef-attachment-size">{(f.size / (1024 * 1024)).toFixed(1)} MB • Uploaded</div>
                    </div>
                  </div>
                  <button className="ef-attachment-remove" onClick={() => removeAttachment(i)}>✕</button>
                </div>
              ))}
            </div>
          )}
          <label className="ef-add-attachment">
            <input type="file" onChange={handleAttachmentAdd} />
            <span>📎</span>
            <span>ADD ATTACHMENT</span>
          </label>
        </div>
      </div>

      <div className="ef-footer">
        <button className="ef-draft-btn" onClick={() => navigate('/organizer/events')} disabled={saving}>
          Cancel
        </button>
        <button className="ef-launch-btn" onClick={handleSubmit} disabled={saving}>
          {saving ? 'Saving...' : 'Update Event'}
        </button>
      </div>

    </div>
  );
}