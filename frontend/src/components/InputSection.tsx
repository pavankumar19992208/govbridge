import React, { useState, useRef, useCallback } from 'react';

interface Props {
  onAnalyze: (formData: FormData) => void;
  isLoading: boolean;
  selectedRole: string;
}

const PROMPT_MAP: Record<string, string[]> = {
  "Farmer": ["I lost my crops to unseasonal rain", "Need crop insurance details", "Drought relief funds", "Subsidized seeds and fertilizer"],
  "Student": ["Need a scholarship for 10th grade", "Education loan for higher studies", "Free laptop scheme", "Hostel accommodation subsidy"],
  "Daily Wage Worker": ["Need daily wage housing subsidy", "Health insurance for labourers", "NREGA job card application"],
  "Artisan": ["Financial support for a weaving loom", "Subsidy for craft raw materials", "Marketing platform for handicrafts"],
  "Healthcare Worker": ["Insurance for ASHA workers", "Financial assistance for nursing training", "Maternity benefits"],
};

export default function InputSection({ onAnalyze, isLoading, selectedRole }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [query, setQuery] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsHovering(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsHovering(false); }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsHovering(false);
    if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]);
  }, []);

  const handleSubmit = () => {
    const formData = new FormData();
    if (file) formData.append('file', file);
    if (query.trim()) formData.append('query', query.trim());
    
    if (!file && !query.trim()) {
      // Non-blocking: silently focus the textarea instead of alert()
      document.getElementById('query')?.focus();
      return;
    }
    onAnalyze(formData);
  };

  const dynamicPrompts = PROMPT_MAP[selectedRole] || PROMPT_MAP["Farmer"];

  return (
    <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-md border-2 border-slate-200 flex flex-col gap-6" aria-label="Multimodal Input Area">
      <h2 className="text-2xl font-black text-slate-900 tracking-tight border-b-2 border-slate-100 pb-3">Tell Us Your Needs</h2>

      <div className="flex flex-col gap-4">
          <label 
            htmlFor="file-upload"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-4 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer focus-within:ring-4 focus-within:ring-blue-600 focus-within:ring-offset-2 ${
              isHovering ? 'border-blue-600 bg-blue-50' : 'border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-slate-100'
            }`}
          >
            <input 
              id="file-upload"
              type="file" 
              className="sr-only" 
              ref={fileInputRef}
              aria-label="Camera Image Upload" 
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])} 
              accept="image/*, application/pdf"
            />
            <div className="bg-white p-4 rounded-full shadow-md border-2 border-slate-200 mb-4 text-blue-700" aria-hidden="true">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </div>
            <h3 className="text-lg font-black text-slate-800">
              {file ? file.name : "Camera / Image Upload"}
            </h3>
            <p className="mt-2 text-sm text-slate-600 font-bold">
              {file ? "Document attached securely." : "Click or drag documents here"}
            </p>
          </label>

          <button 
            type="button"
            aria-disabled="true"
            className="w-full relative overflow-hidden bg-slate-800 border-2 border-slate-900 text-slate-300 shadow-lg font-black py-4 px-4 rounded-xl flex flex-row items-center justify-center gap-3 focus:outline-none text-lg opacity-80 cursor-not-allowed"
          >
            <svg className="w-6 h-6 text-red-500/50" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8h-2a5 5 0 01-10 0H3a7.001 7.001 0 006 6.93V17H6v2h8v-2h-3v-2z" clipRule="evenodd" /></svg>
            Voice Record (Mocked)
          </button>
      </div>

      <div className="flex flex-col gap-4 pt-4 border-t-2 border-slate-100">
        <div>
          <label htmlFor="query" className="block text-base font-black text-slate-800 mb-2">Manual Text Details</label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border-2 border-slate-300 rounded-xl p-4 text-lg text-slate-900 font-medium focus:ring-4 focus:ring-blue-600 hover:border-slate-400 outline-none min-h-[120px] resize-y shadow-inner bg-slate-50"
            placeholder="Type your needs here (e.g. Subsidy for seeds)..."
            aria-label="Text query description"
          />
        </div>
        
        <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-100">
           <span className="text-sm font-black text-blue-800 uppercase tracking-widest mb-3 block">Quick Help for {selectedRole}s</span>
           <div className="flex flex-wrap gap-2">
             {dynamicPrompts.map((prompt, idx) => (
               <button
                 key={idx}
                 onClick={() => setQuery(prompt)}
                 aria-label={`Quick query template: ${prompt}`}
                 className="bg-white hover:bg-blue-600 text-slate-800 hover:text-white border-2 border-slate-200 hover:border-blue-700 rounded-lg px-4 py-2 text-sm font-bold transition-all focus:ring-4 focus:ring-blue-500 focus:outline-none shadow-sm"
               >
                 {prompt}
               </button>
             ))}
           </div>
        </div>
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={isLoading}
        aria-label="Find government schemes matching your profile"
        className="mt-2 w-full bg-blue-700 hover:bg-blue-800 disabled:bg-slate-400 text-white font-black py-4 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 focus:ring-4 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none text-xl"
      >
        {isLoading ? (
          <span className="flex items-center gap-3">
            <svg className="animate-spin -ml-1 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Analyzing...
          </span>
        ) : (
          <>
            Find Schemes Now
            <svg className="w-6 h-6 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </>
        )}
      </button>

    </section>
  );
}
