import { useEffect, useState } from 'react';

export default function ShortcutsDialog({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Ctrl + K', desc: 'Open Command Palette' },
    { key: '?', desc: 'Show Keyboard Shortcuts' },
    { key: 'Ctrl + S', desc: 'Save Form (in Builder)' },
    { key: 'Escape', desc: 'Close Modals' },
  ];

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '400px', 
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-xl)',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-heading)' }}>Keyboard Shortcuts</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {shortcuts.map((s, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-body)', fontSize: '0.95rem' }}>{s.desc}</span>
              <kbd style={{ 
                background: 'var(--bg-elevated)', 
                padding: '4px 8px', 
                borderRadius: '4px', 
                fontSize: '0.8rem', 
                border: '1px solid var(--border-default)',
                color: 'var(--text-heading)',
                fontFamily: 'monospace'
              }}>
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          <button className="btn btn-primary w-full" onClick={onClose}>Got it</button>
        </div>
      </div>
    </div>
  );
}
