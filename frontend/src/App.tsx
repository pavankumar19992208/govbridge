import { useState } from 'react';
import InputSection from './components/InputSection';
import SchemeDetailModal from './components/SchemeDetailModal';
import SkeletonLoader from './components/SkeletonLoader';
import type { SchemeResult } from './types';

// Static constant defined outside component to prevent re-declaration on every render
const ROLES = ["Farmer", "Student", "Daily Wage Worker", "Artisan", "Healthcare Worker"] as const;

export default function App() {
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<SchemeResult[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<SchemeResult | null>(null);
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  
  const [globalRole, setGlobalRole] = useState("Farmer");

  // ROLES is now defined at module scope above for efficiency

  const handleAnalyze = async (formData: FormData) => {
    formData.append('role', globalRole);
    setLoading(true);
    setHasSearched(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
         const err = await response.json();
         throw new Error(err.detail || "Server error");
      }

      const data = await response.json();
      if (data.schemes) {
        setSchemes(data.schemes);
        setMessage(data.message || "");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Error fetching schemes:", error);
      setErrorMsg(`Connection failed: ${msg}. Ensure API is running with valid keys.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b-2 border-slate-200 sticky top-0 z-10 px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center font-black text-2xl shadow-md" aria-hidden="true">
            G
          </div>
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-800">GovBridge</span>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto bg-slate-100 p-2 rounded-xl border-2 border-slate-200">
          <label htmlFor="top-role-select" className="text-sm font-bold text-slate-600 whitespace-nowrap sr-only">
            Select Profession
          </label>
          <svg className="w-6 h-6 text-slate-500 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          <select 
             id="top-role-select"
             value={globalRole}
             onChange={(e) => setGlobalRole(e.target.value)}
             className="bg-transparent font-bold text-slate-800 text-lg w-full outline-none focus:ring-2 focus:ring-blue-600 p-1 cursor-pointer"
             aria-label="Select your profession"
          >
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          <div className="lg:col-span-4">
            <InputSection onAnalyze={handleAnalyze} isLoading={loading} selectedRole={globalRole} />
          </div>

          <section className="lg:col-span-8 bg-slate-100 flex flex-col h-full rounded-2xl p-6 border-2 border-slate-200" aria-label="Results Feed">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4 border-b-2 border-slate-200 pb-3">Recommended Schemes</h2>
            
            {errorMsg && (
              <div className="bg-red-100 text-red-800 p-4 rounded-xl border-2 border-red-200 font-bold mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {errorMsg}
              </div>
            )}

            {message && !loading && !errorMsg && (
              <p className="text-lg text-blue-900 mb-6 bg-blue-100 p-5 rounded-xl border-2 border-blue-200 font-bold shadow-sm">{message}</p>
            )}
            
            <div className="flex flex-col gap-5 flex-grow">
              
              {loading ? (
                <>
                  <SkeletonLoader />
                  <SkeletonLoader />
                  <SkeletonLoader />
                </>
              ) : schemes.length > 0 ? (
                schemes.map((scheme, index) => (
                  <button 
                    key={index} 
                    onClick={() => setSelectedScheme(scheme)}
                    className="text-left bg-white p-6 rounded-2xl shadow-sm border-2 border-slate-200 hover:border-blue-500 hover:shadow-lg transition-all relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-blue-600 focus:ring-offset-2 outline-none group"
                    aria-label={`View details for ${scheme.name}`}
                  >
                    <div className="absolute top-0 left-0 w-2 h-full bg-green-500"></div>
                    <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-3 mb-3 pl-3">
                      <h3 className="font-black text-2xl text-slate-900 leading-tight group-hover:text-blue-700 transition-colors pr-4">{scheme.name}</h3>
                      <span className="bg-green-100 border-2 border-green-300 text-green-900 text-sm font-black px-4 py-2 rounded-full whitespace-nowrap shadow-sm">
                        {scheme.score}% Match
                      </span>
                    </div>
                    <div className="pt-4 border-t-2 border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between pl-3 gap-4 mt-2">
                      <span className="text-base font-bold text-blue-900 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">Grant: {scheme.amount}</span>
                      <span className="text-lg font-black text-blue-700 group-hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-5 py-2 rounded-xl transition-colors">See Details &rarr;</span>
                    </div>
                  </button>
                ))
              ) : hasSearched ? (
                 <div className="flex-grow flex flex-col items-center justify-center p-10 border-4 border-dashed border-slate-300 rounded-2xl text-slate-600 bg-white mt-auto text-center gap-4 shadow-sm">
                  <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p className="text-xl font-bold">No exact matching schemes found currently.</p>
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center p-8 border-4 border-dashed border-slate-300 rounded-2xl text-slate-500 bg-slate-50 mt-auto min-h-[350px]">
                  <p className="text-xl font-bold text-center max-w-md">Provide details to your left to trigger the AI-powered portal.</p>
                </div>
              )}

            </div>
          </section>

        </div>
      </main>

      <SchemeDetailModal 
        scheme={selectedScheme} 
        isOpen={selectedScheme !== null} 
        onClose={() => setSelectedScheme(null)} 
      />
    </div>
  );
}
