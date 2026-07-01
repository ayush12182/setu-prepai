import React from 'react';

interface DiagramProps {
  type: string;
  showVelocity?: boolean;
  showGravity?: boolean;
  showTrajectory?: boolean;
  showAngle?: boolean;
}

export const DiagramRenderer: React.FC<{ data: DiagramProps }> = ({ data }) => {
  const renderSVG = () => {
    switch (data.type) {
      case 'projectile_motion':
        return (
          <svg viewBox="0 0 100 80" className="w-full h-full">
            <line x1="10" y1="70" x2="95" y2="70" stroke="#000" strokeWidth="1" />
            <path d="M 15 70 Q 50 10 85 70" fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="25" cy="48" r="4" fill="#3B82F6" />
            {data.showVelocity && <line x1="25" y1="48" x2="40" y2="35" stroke="#10B981" strokeWidth="1.5" markerEnd="url(#arrow)" />}
            {data.showGravity && <line x1="50" y1="40" x2="50" y2="60" stroke="#EF4444" strokeWidth="1.5" markerEnd="url(#arrow)" />}
            <defs>
              <marker id="arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
                <path d="M0,0 L5,2.5 L0,5 Z" fill="currentColor" />
              </marker>
            </defs>
          </svg>
        );
      case 'orbitals':
        return (
          <svg viewBox="0 0 100 80" className="w-full h-full">
            <ellipse cx="50" cy="40" rx="15" ry="30" fill="#3B82F6" opacity="0.4" />
            <ellipse cx="50" cy="40" rx="30" ry="15" fill="#EF4444" opacity="0.4" />
            <circle cx="50" cy="40" r="4" fill="#111827" />
          </svg>
        );
      case 'periodic_trends':
        return (
          <svg viewBox="0 0 100 80" className="w-full h-full">
            <rect x="20" y="20" width="60" height="40" fill="none" stroke="#9CA3AF" strokeWidth="2" rx="4" />
            <line x1="10" y1="10" x2="90" y2="10" stroke="#F59E0B" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="10" y1="10" x2="10" y2="70" stroke="#3B82F6" strokeWidth="2" markerEnd="url(#arrow)" />
            <text x="35" y="8" fontSize="6" fontWeight="bold">Electronegativity</text>
            <text x="2" y="45" fontSize="6" fontWeight="bold" transform="rotate(-90 2,45)">Atomic Radius</text>
          </svg>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400 border border-dashed border-gray-300 rounded text-center">
            [{data.type.replace(/_/g, ' ')}]
          </div>
        );
    }
  };

  return (
    <div className="flex bg-white rounded-lg p-2 gap-2 mb-2 items-center justify-center border border-gray-100 shadow-sm">
      <div className="w-24 h-20 relative">
        {renderSVG()}
      </div>
    </div>
  );
};
