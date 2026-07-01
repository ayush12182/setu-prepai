import React from 'react';

export const SectionHeader: React.FC<{ title: string, colorClass: string }> = ({ title, colorClass }) => (
  <div className={`text-center py-1.5 px-4 rounded-t-md border-b-2 font-bold text-sm tracking-wider uppercase shadow-sm ${colorClass}`}>
    {title}
  </div>
);

export const SolidSectionHeader: React.FC<{ title: string, color: string }> = ({ title, color }) => (
  <div 
    className="text-center py-1 px-4 rounded-full font-bold text-xs tracking-wider uppercase text-white shadow-sm inline-block mx-auto mb-3"
    style={{ backgroundColor: color }}
  >
    {title}
  </div>
);
