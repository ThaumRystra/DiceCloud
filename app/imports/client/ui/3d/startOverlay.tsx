import { createRoot } from 'react-dom/client';
import App from './App';
import { Leva } from 'leva';
import React from 'react';

export default function startOverlay() {
  const container = document.getElementById('3d-overlay');
  if (!container) throw new Error('3D overlay element not found');
  createRoot(container).render(<>
    <App />
    <Leva collapsed />
  </>);
}
