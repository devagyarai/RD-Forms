import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CommandPalette({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  // Handle escape to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'home', icon: '⊞', label: 'Go to Dashboard', action: () => navigate('/dashboard') },
    { id: 'settings', icon: '⚙️', label: 'Go to Settings', action: () => navigate('/settings') },
    { id: 'analytics', icon: '📈', label: 'Go to Analytics', action: () => navigate('/analytics') },
    { id: 'create', icon: '✨', label: 'Create New Form', action: () => { onClose(); /* Trigger global create modal if possible, or just nav to dash */ navigate('/dashboard?create=true'); } },
    { id: 'shortcuts', icon: '⌨️', label: 'Keyboard Shortcuts', action: () => { onClose(); window.dispatchEvent(new Event('open-shortcuts')); } },
    { id: 'theme', icon: '🎨', label: 'Change Theme', action: () => navigate('/settings?tab=appearance') },
  ];

  const filteredCommands = commands.filter(cmd => 
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '500px', 
          marginTop: '10vh', 
          padding: 0, 
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-card)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <div style={{ padding: '16px', borderBottom: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="form-input"
            style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '1.1rem', flex: 1, boxShadow: 'none' }}
            placeholder="Type a command or search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div style={{ fontSize: '0.7rem', padding: '4px 8px', background: 'var(--bg-elevated)', borderRadius: '4px', color: 'var(--text-muted)' }}>
            ESC
          </div>
        </div>

        <div style={{ padding: '12px', maxHeight: '300px', overflowY: 'auto' }}>
          {filteredCommands.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No commands found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {filteredCommands.map((cmd) => (
                <button
                  key={cmd.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    width: '100%', border: 'none', background: 'transparent', textAlign: 'left',
                    borderRadius: 'var(--radius-sm)', cursor: 'pointer', color: 'var(--text-body)',
                    transition: 'var(--transition)'
                  }}
                  className="cmd-item"
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-heading)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-body)'; }}
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                >
                  <span style={{ fontSize: '1.2rem' }}>{cmd.icon}</span>
                  <span style={{ fontWeight: 500 }}>{cmd.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
