import React from 'react';

interface Node {
  id: string;
  label: string;
}

interface Edge {
  from: string;
  to: string;
}

export const ConceptMapRenderer: React.FC<{ data: { nodes: Node[], edges: Edge[] } }> = ({ data }) => {
  if (!data || !data.nodes) return null;

  // Extremely basic tree renderer assuming a central root node (usually the first one)
  const rootNode = data.nodes[0];
  if (!rootNode) return null;

  const childEdges = data.edges.filter(e => e.from === rootNode.id);
  const children = childEdges.map(e => data.nodes.find(n => n.id === e.to)).filter(Boolean) as Node[];

  return (
    <div className="flex flex-col items-center justify-center py-4 relative">
      {/* Root Node */}
      <div className="bg-red-50 border-2 border-red-200 text-red-800 font-bold px-6 py-2 rounded-lg text-sm shadow-sm z-10">
        {rootNode.label.toUpperCase()}
      </div>

      {children.length > 0 && (
        <>
          {/* Vertical connecting line from root */}
          <div className="w-0.5 h-6 bg-red-200 z-0"></div>
          
          {/* Horizontal connecting line spanning children */}
          <div className="flex w-full justify-center relative">
             {children.length > 1 && (
               <div 
                 className="absolute top-0 h-0.5 bg-red-200" 
                 style={{ 
                   left: `${100 / (children.length * 2)}%`, 
                   right: `${100 / (children.length * 2)}%` 
                 }} 
               />
             )}
            
            <div className="flex w-full justify-between px-4 z-10 gap-2">
              {children.map((child, i) => {
                // Find grandchildren
                const grandChildEdges = data.edges.filter(e => e.from === child.id);
                const grandChildren = grandChildEdges.map(e => data.nodes.find(n => n.id === e.to)).filter(Boolean) as Node[];

                return (
                  <div key={child.id} className="flex flex-col items-center flex-1">
                    {/* Vertical line to child */}
                    <div className="w-0.5 h-4 bg-red-200"></div>
                    <div className={`border-2 px-3 py-1.5 rounded-lg text-xs font-bold w-full text-center bg-green-50 border-green-200 text-green-800`}>
                      {child.label}
                    </div>

                    {grandChildren.length > 0 && (
                      <div className="mt-2 w-full flex flex-col gap-1 items-center bg-white border border-gray-200 p-2 rounded text-[10px] text-gray-700">
                         {grandChildren.map(gc => (
                           <div key={gc.id} className="flex items-center gap-1 w-full text-left">
                             <span className="w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                             <span className="leading-tight">{gc.label}</span>
                           </div>
                         ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
