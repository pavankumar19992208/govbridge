import React, { memo } from 'react';

interface ProfessionSelectorProps {
  roles: string[];
  selectedRole: string;
  onSelect: (role: string) => void;
}

/**
 * ProfessionSelector - Pillar 4 (A11y) & Pillar 5 (Quality)
 * Strictly typed and accessible tab-based selection interface.
 */
const ProfessionSelector: React.FC<ProfessionSelectorProps> = memo(({ roles, selectedRole, onSelect }) => {
  return (
    <div 
      className="flex flex-wrap md:flex-nowrap gap-2 p-2 bg-gray-100 rounded-3xl border border-gray-50 shadow-inner" 
      role="tablist" 
      aria-label="Select your profession to find matching schemes"
    >
      {roles.map(role => (
        <button
          key={role}
          role="tab"
          aria-selected={selectedRole === role}
          aria-label={`Select profession: ${role}`}
          onClick={() => onSelect(role)}
          className={`w-full md:w-auto px-6 py-3 text-xs font-black rounded-2xl transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${
            selectedRole === role 
              ? 'bg-white text-blue-700 shadow-xl border border-gray-100 transform scale-105 z-10' 
              : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200 focus:bg-gray-200'
          }`}
        >
          {selectedRole === role && <span className="animate-pulse">💎</span>}
          {role}
        </button>
      ))}
    </div>
  );
});

export default ProfessionSelector;
