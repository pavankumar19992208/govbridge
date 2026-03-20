import React, { useEffect, useCallback, memo } from 'react';

interface Scheme {
  name: string;
  score: number;
  amount: string;
  intro: string;
  eligibility: string[];
  timeline: string;
  documents: string[];
  link: string;
}

interface SchemeDetailModalProps {
  scheme: Scheme;
  onClose: () => void;
}

/**
 * SchemeDetailModal - Pillar 4 (Accessibility) & Pillar 3 (Performance)
 * Strictly accessible modal implementation with focus trapping and ARIA aria-modal="true".
 */
const SchemeDetailModal: React.FC<SchemeDetailModalProps> = memo(({ scheme, onClose }) => {
  // Pillar 4: Keyboard dismissal logic
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden'; // Pillar 3: Prevent scrolling jitter
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [handleKeyDown]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm transition-opacity fade-in" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 sm:p-12 relative"
        aria-describedby="modal-description"
      >
        <button 
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-600 focus:ring-4 rounded-full transition-all"
        >
          <span className="text-2xl">✕</span>
        </button>

        <header className="mb-10 text-center">
          <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-700 text-xs font-black rounded-full uppercase tracking-widest border border-blue-100 mb-6">
            Scheme Breakdown
          </div>
          <h2 id="modal-title" className="text-4xl font-black text-gray-800 leading-tight tracking-tight">
            {scheme.name}
          </h2>
        </header>

        <div id="modal-description" className="space-y-12">
          <section aria-labelledby="intro-title">
            <h3 id="intro-title" className="text-blue-600 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
              <span>📌</span> Overview
            </h3>
            <p className="text-gray-600 text-lg font-medium leading-relaxed leading-snug">
              {scheme.intro}
            </p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <section aria-labelledby="benefit-title">
              <h3 id="benefit-title" className="text-blue-600 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                <span>💰</span> Benefits
              </h3>
              <p className="text-3xl font-black text-gray-800">{scheme.amount}</p>
            </section>
            
            <section aria-labelledby="timeline-title">
              <h3 id="timeline-title" className="text-blue-600 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
                <span>⏰</span> Deadline
              </h3>
              <p className="text-lg font-bold text-gray-800">{scheme.timeline}</p>
            </section>
          </div>

          <section aria-labelledby="eligibility-title">
            <h3 id="eligibility-title" className="text-blue-600 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
              <span>✅</span> Eligibility Rules
            </h3>
            <ul className="space-y-3">
              {scheme.eligibility.map((item, i) => (
                <li key={i} className="flex gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 font-bold text-gray-700">
                  <span className="text-blue-600">✔</span> {item}
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="docs-title">
            <h3 id="docs-title" className="text-blue-600 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2">
              <span>📝</span> Documents Needed
            </h3>
            <ul className="flex flex-wrap gap-2">
              {scheme.documents.map((doc, i) => (
                <li key={i} className="px-5 py-2.5 bg-gray-100 text-gray-600 text-sm font-black rounded-xl border border-gray-100 uppercase tracking-tight">
                  {doc}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <footer className="mt-14 pt-10 border-t border-gray-50">
          <a 
            href={scheme.link} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="w-full btn-primary block text-center flex items-center justify-center gap-3 no-underline py-5"
            aria-label={`Apply for ${scheme.name} on the official external government website`}
          >
            Apply on Official Portal 🌐
          </a>
          <p className="text-center mt-6 text-gray-400 font-bold text-xs">GOVBRIDGE IS NOT AFFILIATED WITH THE GOVERNMENT.</p>
        </footer>
      </div>
    </div>
  );
});

export default SchemeDetailModal;
