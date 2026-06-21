import { useState } from 'react';

const TEMPLATES = [
  { id: 'contact', title: 'Contact Form', icon: '📬', desc: 'Standard contact form with name, email, and message fields.', category: 'Basic' },
  { id: 'survey', title: 'Customer Feedback', icon: '📝', desc: 'Gather feedback with ratings, multiple choice, and comments.', category: 'Surveys' },
  { id: 'event', title: 'Event Registration', icon: '🎟️', desc: 'Register attendees, collect dietary requirements, and track headcount.', category: 'Events' },
  { id: 'job', title: 'Job Application', icon: '💼', desc: 'Collect applicant details, resume uploads, and cover letters.', category: 'HR' },
  { id: 'lead', title: 'Lead Generation', icon: '🚀', desc: 'High-converting form to capture business leads and contact info.', category: 'Marketing' },
  { id: 'support', title: 'Support Ticket', icon: '🔧', desc: 'Allow customers to report issues, upload screenshots, and set priority.', category: 'Support' }
];

export default function TemplatesGallery({ isOpen, onClose, onSelect }) {
  const [filter, setFilter] = useState('All');

  if (!isOpen) return null;

  const categories = ['All', ...new Set(TEMPLATES.map(t => t.category))];
  const filteredTemplates = filter === 'All' ? TEMPLATES : TEMPLATES.filter(t => t.category === filter);

  return (
    <div className="modal-backdrop animate-fade-in" onClick={onClose} style={{ zIndex: 9999 }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()}
        style={{ 
          maxWidth: '800px', width: '90%', maxHeight: '90vh',
          background: 'var(--bg-card)', borderRadius: 'var(--radius-card)',
          boxShadow: 'var(--shadow-xl)', padding: 0, display: 'flex', flexDirection: 'column'
        }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-heading)' }}>Template Gallery</h2>
            <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)' }}>Start your next project with a pre-built professional form.</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', flex: 1, minHeight: '400px' }}>
          {/* Sidebar */}
          <div style={{ width: '200px', borderRight: '1px solid var(--border-subtle)', padding: '16px', background: 'var(--bg-base)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Categories</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {categories.map(cat => (
                <button 
                  key={cat}
                  style={{
                    textAlign: 'left', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer',
                    background: filter === cat ? 'var(--color-primary-glow)' : 'transparent',
                    color: filter === cat ? 'var(--color-primary)' : 'var(--text-body)',
                    fontWeight: filter === cat ? 600 : 400
                  }}
                  onClick={() => setFilter(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '20px', alignContent: 'start' }}>
            {filteredTemplates.map(template => (
              <div 
                key={template.id}
                style={{
                  border: '1px solid var(--border-default)', borderRadius: 'var(--radius-card)', padding: '20px',
                  background: 'var(--bg-surface)', cursor: 'pointer', transition: 'var(--transition)',
                  display: 'flex', flexDirection: 'column', gap: '12px'
                }}
                className="template-card"
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-default)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
                onClick={() => { onSelect(template); onClose(); }}
              >
                <div style={{ fontSize: '2.5rem' }}>{template.icon}</div>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--text-heading)' }}>{template.title}</h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{template.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
