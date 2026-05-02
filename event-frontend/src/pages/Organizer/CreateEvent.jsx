// src/pages/organizer/CreateEvent.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createEvent, getCategories ,uploadThumbnail, uploadAttachment } from '../../services/eventService';
import api from '../../services/api';
import './eventForm.css';


export default function CreateEvent() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [coverFile, setCoverFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [attachmentFiles, setAttachmentFiles] = useState([]);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', location: '', venueName: '',
    categoryId: '', startDate: '', endDate: '',
    ticketPrice: '', maxCapacity: '',
  });

useEffect(() => {
  try {
    const res = getCategories(); // 
    if (res && res.data) {
      setCategories(res.data);
    }
  } catch (err) {
    console.error("Error loading categories:", err);
    setCategories([]);
  }
}, []);
  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleAttachmentAdd = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAttachmentFiles(prev => [...prev, file]);
    e.target.value = '';
  };

  const removeAttachment = (idx) =>
    setAttachmentFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    setError('');
    if (!form.title || !form.location || !form.categoryId || !form.startDate || !form.endDate || !form.maxCapacity) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        categoryId:  form.categoryId,
        title:       form.title,
        description: form.description,
        location:    form.location,
        venueName:   form.venueName,
        startDate:   new Date(form.startDate).toISOString(),
        endDate:     new Date(form.endDate).toISOString(),
        maxCapacity: Number(form.maxCapacity),
        ticketPrice: Number(form.ticketPrice) || 0,
      };
      const res = await createEvent(payload);
      const eventId = res?.data?.eventId;
      if (coverFile && eventId) {
        try { await uploadThumbnail(eventId, coverFile); } catch {}
      }
      if (eventId) {
        for (const file of attachmentFiles) {
          try { await uploadAttachment(eventId, file); } catch {}
        }
      }
      navigate('/organizer/events');
    } catch (err) {
      const msg = err.response?.data?.message || 'Error creating event';
      setError(msg.includes('approved')
        ? '⏳ Your organizer account is pending admin approval.'
        : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">

      <div className="ef-header">
        <div className="ef-header-left">
          <h1>Create New Event</h1>
          <p>Fill in the details and submit for admin approval.</p>
        </div>
        <button className="ef-publish-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit for Approval'}
        </button>
      </div>

      {error && <div className="ef-alert-error">{error}</div>}

      {/* Basic Info */}
      <div className="ef-section">
        <div className="ef-section-label">
          <h3>Basic Info</h3>
          <p>The soul of your event. Keep it catchy and clear to attract the right audience.</p>
        </div>
        <div className="ef-section-fields">
          <div className="ef-field">
            <label className="ef-label">Event Title *</label>
            <input name="title" className="ef-input"
              placeholder="e.g. Midnight Jazz Collective 2024"
              value={form.title} onChange={handleChange} />
          </div>
          <div className="ef-field">
            <label className="ef-label">Event Description</label>
            <textarea name="description" className="ef-textarea"
              placeholder="Describe the atmosphere, the lineup, and why people shouldn't miss it..."
              value={form.description} onChange={handleChange} rows={5} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="ef-section">
        <div className="ef-section-label">
          <h3>Details &amp; Logistics</h3>
          <p>Where and when the magic happens. Accuracy is key for your attendees.</p>
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
          <div className="ef-field">
            <label className="ef-label">Venue Name</label>
            <input name="venueName" className="ef-input" placeholder="The Grand Alchemist Hall"
              value={form.venueName} onChange={handleChange} />
          </div>
          <div className="ef-row">
            <div className="ef-field">
              <label className="ef-label">Category *</label>
              <select name="categoryId" className="ef-select" value={form.categoryId} onChange={handleChange}>
                <option value="">-- Select Category --</option>
                {categories.map(c => (
                  <option key={c.categoryId} value={c.categoryId}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="ef-field">
              <label className="ef-label">Start Date &amp; Time *</label>
              <input type="datetime-local" name="startDate" className="ef-select"
                value={form.startDate} onChange={handleChange} />
            </div>
          </div>
          <div className="ef-field">
            <label className="ef-label">End Date &amp; Time *</label>
            <input type="datetime-local" name="endDate" className="ef-select"
              value={form.endDate} onChange={handleChange} />
          </div>
        </div>
      </div>

      {/* Ticketing */}
      <div className="ef-section">
        <div className="ef-section-label">
          <h3>Ticketing</h3>
          <p>Define your access tiers. Use high-scarcity counts to drive demand.</p>
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
                <label className="ef-label">Max Capacity *</label>
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
          <p>Visuals create the first impression. Upload high-resolution 16:9 imagery.</p>
        </div>
        <div className="ef-section-fields">
          <div className="ef-upload-box" style={{ minHeight: coverPreview ? '220px' : '180px' }}>
            <input type="file" accept="image/*" onChange={handleCoverUpload} />
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
        <button className="ef-draft-btn" onClick={() => navigate('/organizer/events')} disabled={loading}>
          Cancel
        </button>
        <button className="ef-launch-btn" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Launch Experience'}
        </button>
      </div>

    </div>
  );
}