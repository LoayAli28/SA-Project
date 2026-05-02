// src/components/Input.jsx
import React, { useState } from 'react';

export default function Input({ label, type = 'text', style, ...props }) {
  const [focused, setFocused] = useState(false);

  const baseStyle = {
    padding: '12px 16px',
    borderRadius: 'var(--border-radius)',
    border: `1px solid ${focused ? 'var(--accent-orange)' : 'var(--border-color)'}`,
    backgroundColor: 'var(--bg-dark)',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color var(--transition-speed)',
    width: '100%',
    boxSizing: 'border-box',
    ...style
  };

  return (
    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {label && (
        <label style={{ marginBottom: '6px', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '500' }}>
          {label}
        </label>
      )}
      {type === 'textarea' ? (
        <textarea 
          style={{ ...baseStyle, resize: 'vertical', minHeight: '120px' }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      ) : (
        <input 
          type={type}
          style={baseStyle}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
      )}
    </div>
  );
}
