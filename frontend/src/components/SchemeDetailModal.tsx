import type { SchemeResult } from '../types';
import { useEffect, useRef } from 'react';

interface Props {
  scheme: SchemeResult | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SchemeDetailModal({ scheme, isOpen, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen && dialogRef.current) {
      dialogRef.current.showModal();
    } else if (!isOpen && dialogRef.current) {
      dialogRef.current.close();
    }
  }, [isOpen]);

  if (!scheme) return null;

  return (
    <dialog 
      ref={dialogRef}
      onClose={onClose}
      className="backdrop:bg-slate-900/60 p-0 rounded-2xl shadow-2xl border-0 w-full max-w-2xl text-slate-800 open:flex flex-col focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 m-auto"
      aria-labelledby="modal-title"
      aria-modal="true"
    >
      <div className="p-6 md:p-8 overflow-y-auto max-h-[85vh]">
        <div className="flex justify-between items-start mb-5">
          <h2 id="modal-title" className="text-3xl font-black tracking-tight text-slate-900 pr-8">{scheme.name}</h2>
          <button 
            onClick={onClose}
            aria-label="Close modal dialog"
            className="text-slate-500 hover:text-slate-800 bg-slate-200 hover:bg-slate-300 focus:ring-4 focus:ring-blue-600 rounded-lg p-2 transition-colors aspect-square flex-shrink-0"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="bg-blue-100/50 text-blue-900 p-5 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-2 border-blue-200">
          <span className="font-bold flex items-center gap-2 text-lg">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Match Score: {scheme.score}%
          </span>
          <span className="font-black bg-white px-4 py-2 rounded-lg text-blue-800 shadow-sm border border-blue-100 text-lg">{scheme.amount}</span>
        </div>

        <p className="text-slate-800 font-medium mb-6 leading-relaxed text-lg">{scheme.intro}</p>

        <div className="mb-6 bg-slate-100 p-5 rounded-xl border border-slate-200">
          <h3 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
            Eligibility Criteria
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-slate-800 font-medium text-lg">
            {scheme.eligibility.map((req, idx) => <li key={idx} className="pl-1">{req}</li>)}
          </ul>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-black text-slate-900 mb-3 flex items-center gap-2">
            Documents Required
          </h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-800 font-medium">
            {scheme.documents.map((doc, idx) => (
              <li key={idx} className="bg-white border-2 border-slate-200 rounded-lg p-3 text-base flex items-center shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 mr-3 flex-shrink-0"></span>
                {doc}
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
            Timeline
          </h3>
          <p className="text-slate-900 bg-orange-100 font-bold p-4 rounded-xl border-2 border-orange-200 text-lg">{scheme.timeline}</p>
        </div>

        <div className="flex flex-col sm:flex-row justify-end pt-5 border-t-2 border-slate-200 gap-3">
          <button onClick={onClose} className="px-6 py-3 rounded-xl font-bold text-slate-700 hover:bg-slate-200 transition-colors focus:ring-4 focus:ring-slate-400 text-lg border-2 border-slate-300">
            Close
          </button>
          <a 
            href={scheme.link}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-black transition-colors shadow-md focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 text-lg"
          >
            Apply Now (External Portal)
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </a>
        </div>
      </div>
    </dialog>
  );
}
