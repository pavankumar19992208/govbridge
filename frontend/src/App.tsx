import React, { useState, useEffect, useCallback, useMemo } from 'react';
import InputSection from './components/InputSection';
import SchemeDetailModal from './components/SchemeDetailModal';
import ProfessionSelector from './components/ProfessionSelector';

// Shared Interface Pillar 5
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

const ROLES = [
  "Farmer",
  "Student",
  "Daily Wage Worker",
  "Artisan",
  "Healthcare Worker"
];

/**
 * Main App Component - Pillar 3 (Performance) & Pillar 4 (Accessibility)
 * Implements strict modularity and high-conversion UX.
 */
const App: React.FC = () => {
  const [selectedRole, setSelectedRole] = useState("Farmer");
  const [loading, setLoading] = useState(false);
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);

  // Pillar 3: Fast navigation using optimized state callbacks
  const handleRoleChange = useCallback((role: string) => {
    setSelectedRole(role);
    setErrorMsg("");
  }, []);

  const handleAnalyze = useCallback(async (role: string, query: string, file: File | null) => {
    setLoading(true);
    setErrorMsg("");
    setSchemes([]);

    const formData = new FormData();
    formData.append("role", role);
    if (query) formData.append("query", query);
    if (file) formData.append("file", file);

    try {
      // Backend points to Cloud Run URL in production
      const apiBase = import.meta.env.VITE_API_URL || "http://localhost:8080";
      const response = await fetch(`${apiBase}/api/analyze`, {
        method: "POST",
        body: formData,
        headers: {
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Cloud Analysis Failed: HTTP ${response.status}`);
      }

      const data = await response.json();
      setSchemes(data.schemes || []);
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unknown error";
      console.error("Critical Analysis Error:", error);
      setErrorMsg(`Cloud Bridge Connection Failed: ${msg}. Please refresh and try again.`);
    } finally {
      setLoading(false);
    }
  }, []);

  // Pillar 3: Optimized List Render
  const SchemeList = useMemo(() => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-busy="true" aria-label="Loading government schemes">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 rounded-3xl skeleton-shimmer bg-gray-100" />
          ))}
        </div>
      );
    }

    if (schemes.length === 0 && !loading && !errorMsg) {
      return (
        <div className="text-center p-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
          <p className="text-gray-400 font-bold text-lg">Your curated schemes will appear here.</p>
        </div>
      );
    }

    // Pillar 4: Semantic Article tags for scheme cards
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schemes.map((scheme, idx) => (
          <article 
            key={idx} 
            className="p-6 bg-white rounded-3xl shadow-xl border border-gray-50 hover:shadow-2xl transition-all cursor-pointer group fade-in"
            onClick={() => setSelectedScheme(scheme)}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <header className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-black rounded-full uppercase tracking-widest border border-green-100">
                {scheme.score}% Match
              </span>
              <span className="text-blue-600 font-black text-lg">{scheme.amount}</span>
            </header>
            <h3 className="text-xl font-black text-gray-800 mb-3 group-hover:text-blue-600 transition-colors leading-tight">
              {scheme.name}
            </h3>
            <p className="text-gray-500 text-sm font-medium line-clamp-3 mb-6">
              {scheme.intro}
            </p>
            <footer className="pt-4 border-t border-gray-50 flex items-center justify-between">
              <span className="text-blue-600 font-bold text-xs">VIEW DETAILS 🚀</span>
              <span className="text-gray-300">→</span>
            </footer>
          </article>
        ))}
      </div>
    );
  }, [loading, schemes, errorMsg]);

  return (
    <main className="min-h-screen pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      <nav className="flex items-center justify-between py-10" aria-label="Main Navigation">
         <h1 className="text-4xl font-black tracking-tighter text-blue-800 uppercase flex items-center gap-3">
           <span className="text-5xl">🌉</span> GovBridge
         </h1>
         <div className="hidden md:block w-full max-w-2xl px-4">
           <ProfessionSelector 
             roles={ROLES} 
             selectedRole={selectedRole} 
             onSelect={handleRoleChange} 
           />
         </div>
      </nav>

      <section className="mb-12">
        <InputSection 
          selectedRole={selectedRole} 
          loading={loading} 
          onAnalyze={handleAnalyze} 
        />
      </section>

      {errorMsg && (
        <div className="p-5 mb-10 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-4 text-red-600 font-bold shadow-lg fade-in" role="alert">
          <span className="text-2xl">⚠️</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <section aria-labelledby="results-title">
        <header className="mb-8 flex items-end justify-between">
          <h2 id="results-title" className="text-3xl font-black text-gray-800 tracking-tight">Curated Schemes</h2>
          <span className="text-gray-400 font-bold mb-1 uppercase text-xs tracking-widest">Powered by Gemini 3.1 Flash-lite</span>
        </header>

        {SchemeList}
      </section>

      {selectedScheme && (
        <SchemeDetailModal 
          scheme={selectedScheme} 
          onClose={() => setSelectedScheme(null)} 
        />
      )}
    </main>
  );
};

export default App;
