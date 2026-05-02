// src/components/Button.jsx
import React, { useState } from 'react';

export default function Button({ children, variant = 'primary', className, style, disabled, ...props }) {
 

   return (
    <button
      className={`btn btn-${variant} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
