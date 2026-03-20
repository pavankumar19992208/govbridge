import React, { useRef, useCallback, memo } from 'react';

interface InputSectionProps {
  onAnalyze: (role: string, query: string, file: File | null) => void;
  loading: boolean;
  selectedRole: string;
}

const ROLES = [
  "Farmer",
  "Student",
  "Daily Wage Worker",
  "Artisan",
  "Healthcare Worker"
];

const PROMPT_MAP: Record<string, string> = {
  "Farmer": "Show me Indian crop insurance schemes specifically related to drought relief for small landholders.",
  "Student": "Find me central government scholarships for engineering students eligible in rural districts.",
  "Daily Wage Worker": "List me social security schemes available for unorganized sector construction workers.",
  "Artisan": "Retrieve me PM-VISWAKARMA loan details specifically for rural potters or textile weavers.",
  "Healthcare Worker": "Find me health insurance subsidies or child-care grants available for ASHAs or Anganwadi workers."
};

/**
 * InputSection Component - Pillar 4 (A11y) & Pillar 3 (Performance Memo)
 * Audited for Screen Readers and Keyboard Navigation.
 */
const InputSection: React.FC<InputSectionProps> = memo(({ onAnalyze, loading, selectedRole }) => {
  const queryRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const query = queryRef.current?.value || "";
    const file = fileRef.current?.files?.[0] || null;
    
    if (!query && !file) {
      queryRef.current?.focus();
      return;
    }
    
    onAnalyze(selectedRole, query, file);
  }, [selectedRole, onAnalyze]);

  const handleQuickHelp = (prompt: string) => {
    if (queryRef.current) {
      queryRef.current.value = prompt;
    }
  };

  return (
    <section className="bg-white p-8 rounded-3xl shadow-2xl border border-gray-100 fade-in" aria-labelledby="input-section-title">
      <header className="mb-6">
        <h2 id="input-section-title" className="text-2xl font-black text-gray-800 tracking-tight">
          How can GovBridge help you today?
        </h2>
        <p className="text-gray-500 font-medium">Identify yourself as a <span className="text-blue-600 font-bold">{selectedRole}</span> to get precise schemes.</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8" role="group" aria-label="Quick Query Suggestions">
        {PROMPT_MAP[selectedRole] && (
           <button
             type="button"
             onClick={() => handleQuickHelp(PROMPT_MAP[selectedRole])}
             aria-label={`Quick query template for ${selectedRole}`}
             className="px-4 py-2 bg-blue-50 text-blue-700 text-sm font-bold rounded-full hover:bg-blue-100 border border-blue-200 focus:ring-4 transition-all"
           >
             💡 Suggest a {selectedRole} Query
           </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label htmlFor="user-query" className="sr-only">Describe your needs or questions here</label>
        <textarea
          id="user-query"
          ref={queryRef}
          placeholder={`Describe your situation (e.g., "I need a loan for seeds" or "How to get a medical subsidy?")`}
          className="w-full h-40 p-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-blue-500 focus:bg-white resize-none transition-all font-medium text-gray-700"
          aria-required="true"
        />

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full relative group">
            <input
              type="file"
              id="file-upload"
              ref={fileRef}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              accept="image/*,.pdf"
              aria-label="Upload document image or PDF for analysis"
            />
            <div className="w-full p-4 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center gap-3 bg-gray-50 group-hover:border-blue-300 group-hover:bg-blue-50 transition-all">
              <span className="text-xl">📎</span>
              <span className="text-sm font-bold text-gray-500">Add Photo or Document (PDF)</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            aria-label="Find schemes now"
            className="w-full sm:w-auto btn-primary flex items-center justify-center gap-3 disabled:bg-gray-400"
          >
            {loading ? (
              <span className="animate-spin text-xl">⏳</span>
            ) : (
              <span className="text-xl">🚀</span>
            )}
            {loading ? "Discovering..." : "Find Schemes Now"}
          </button>
        </div>
      </form>
    </section>
  );
});

export default InputSection;
