import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './SearchBar.css';

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function SearchBar() {
  const navigate  = useNavigate();
  const panelRef  = useRef(null);

  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched,setSearched]= useState(false);

  const debouncedQuery = useDebounce(query, 350);

  // Auto-search on query change
  useEffect(() => {
    if (!open) return;
    if (!debouncedQuery.trim()) { setResults([]); setSearched(false); return; }
    runSearch(debouncedQuery);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const runSearch = useCallback(async (q) => {
    setLoading(true);
    setSearched(true);
    try {
      // GET /api/events?search=q&pageSize=5
      const res = await api.get('/events', { params: { search: q, pageSize: 5 } });
      // ServiceResult<PagedResult<EventResponseDto>> → .data.data.items
      const items = res.data?.data?.items || [];
      setResults(items);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (query.trim()) navigate(`/events?search=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  const goToEvent = (eventId) => {
    navigate(`/events/${eventId}`);
    setOpen(false);
    setQuery('');
    setResults([]);
  };

  return (
    <div className="searchbar-wrapper" ref={panelRef}>

      {/* Toggle button */}
      <button
        className="searchbar-toggle"
        onClick={() => setOpen(o => !o)}
        title="Search events"
        aria-label="Toggle search"
      >
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"
             strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8.5" cy="8.5" r="5.5"/>
          <line x1="13" y1="13" x2="18" y2="18"/>
        </svg>
      </button>

      {/* Expanded panel */}
      {open && (
        <div className="searchbar-panel">
          <form onSubmit={handleSubmit}>
            <div className="searchbar-top">
              <input
                autoFocus
                className="searchbar-input"
                type="text"
                placeholder="Search events…"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <button type="submit" className="searchbar-submit">Search</button>
            </div>
          </form>

          {/* Results */}
          {searched && (
            <div className="searchbar-results">
              {loading && <p className="searchbar-status loading">Searching…</p>}

              {!loading && results.length === 0 && (
                <p className="searchbar-status">No events found.</p>
              )}

              {!loading && results.map(event => (
                <div
                  key={event.eventId}
                  className="searchbar-result-item"
                  onClick={() => goToEvent(event.eventId)}
                >
                  {event.thumbnailUrl ? (
                    <img className="result-img" src={event.thumbnailUrl} alt={event.title} />
                  ) : (
                    <div className="result-img-placeholder">🎪</div>
                  )}

                  <div className="result-info">
                    <div className="result-title">{event.title}</div>
                    <div className="result-meta">
                      {event.venueName && <span>📍 {event.venueName}</span>}
                      {!event.venueName && event.location && <span>📍 {event.location}</span>}
                      {event.startDate && (
                        <span>📅 {new Date(event.startDate).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                        })}</span>
                      )}
                      {event.categoryName && (
                        <span className="result-category-tag">{event.categoryName}</span>
                      )}
                    </div>
                  </div>

                  <div className="result-price">
                    {event.ticketPrice === 0 ? 'Free' : event.ticketPrice ? `$${event.ticketPrice}` : ''}
                  </div>
                </div>
              ))}

              {!loading && results.length > 0 && (
                <button
                  onClick={handleSubmit}
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'var(--primary)', fontSize: '0.82rem',
                    cursor: 'pointer', padding: '6px 0 2px',
                    textAlign: 'center', width: '100%', fontWeight: '600',
                  }}
                >
                  View all results →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
