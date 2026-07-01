import React from 'react';

interface GraphProps {
  type: string;
  variant?: string;
  annotations?: string[];
}

export const GraphRenderer: React.FC<{ data: GraphProps }> = ({ data }) => {
  const renderSVG = () => {
    switch (data.type) {
      case 'position_time':
        return (
          <svg viewBox="0 0 100 80" className="w-full h-full">
            <line x1="10" y1="70" x2="95" y2="70" stroke="#000" strokeWidth="1" />
            <line x1="10" y1="10" x2="10" y2="70" stroke="#000" strokeWidth="1" />
            <text x="5" y="15" fontSize="8" fontWeight="bold">x</text>
            <text x="90" y="78" fontSize="8" fontWeight="bold">t</text>
            
            {data.variant === 'uniform_acceleration' ? (
               <path d="M10,70 Q 40,70 80,15" fill="none" stroke="#2563EB" strokeWidth="2" />
            ) : (
               <line x1="10" y1="70" x2="80" y2="20" stroke="#2563EB" strokeWidth="2" />
            )}
          </svg>
        );
      case 'velocity_time':
        return (
          <svg viewBox="0 0 100 80" className="w-full h-full">
            <polygon points="10,70 80,70 80,20" fill="#22C55E" opacity="0.2" />
            <line x1="10" y1="70" x2="95" y2="70" stroke="#000" strokeWidth="1" />
            <line x1="10" y1="10" x2="10" y2="70" stroke="#000" strokeWidth="1" />
            <text x="5" y="15" fontSize="8" fontWeight="bold">v</text>
            <text x="90" y="78" fontSize="8" fontWeight="bold">t</text>
            <line x1="10" y1="70" x2="80" y2="20" stroke="#2563EB" strokeWidth="2" />
          </svg>
        );
      case 'acceleration_time':
        return (
          <svg viewBox="0 0 100 80" className="w-full h-full">
            <rect x="10" y="30" width="70" height="40" fill="#EC4899" opacity="0.2" />
            <line x1="10" y1="70" x2="95" y2="70" stroke="#000" strokeWidth="1" />
            <line x1="10" y1="10" x2="10" y2="70" stroke="#000" strokeWidth="1" />
            <text x="5" y="15" fontSize="8" fontWeight="bold">a</text>
            <text x="90" y="78" fontSize="8" fontWeight="bold">t</text>
            <line x1="10" y1="30" x2="80" y2="30" stroke="#2563EB" strokeWidth="2" />
          </svg>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 border border-dashed border-gray-300 rounded">
            [{data.type}]
          </div>
        );
    }
  };

  return (
    <div className="flex bg-white rounded-lg p-2 gap-2 mb-2 items-center">
      <div className="w-20 h-16 shrink-0 relative">
        {renderSVG()}
      </div>
      <div className="flex flex-col gap-1 text-[10px] text-gray-800 font-medium">
        {data.annotations?.map((anno, i) => (
          <div key={i} className="flex items-start gap-1">
            <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
            <span className="leading-tight">{anno}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
