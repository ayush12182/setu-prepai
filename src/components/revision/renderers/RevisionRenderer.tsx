import React from 'react';
import { SectionHeader, SolidSectionHeader } from './SectionHeader';
import { ConceptMapRenderer } from './ConceptMapRenderer';
import { GraphRenderer } from './GraphRenderer';
import { DiagramRenderer } from './DiagramRenderer';
import { MathLine } from '@/utils/mathRenderer';
import { Chapter } from '@/data/syllabus';

export const RevisionRenderer: React.FC<{ jsonOutput: any, chapter?: Chapter }> = ({ jsonOutput, chapter }) => {
  if (!jsonOutput) return null;

  const subjectStr = chapter?.subject ? chapter.subject.charAt(0).toUpperCase() + chapter.subject.slice(1) : 'Subject';
  const classStr = chapter?.class || 'Class 11/12';

  return (
    <div className="max-w-[1000px] mx-auto bg-white text-gray-900 p-6 md:p-8 animate-in fade-in duration-500 shadow-xl border border-gray-200">
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center border-b-4 border-gray-100 pb-4 mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black text-blue-700 tracking-tight uppercase">
            {jsonOutput.metadata?.title || jsonOutput.chapter}
          </h1>
          <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold">
            {subjectStr} • {classStr}
          </div>
        </div>
        
        <div className="flex items-center gap-8 text-center">
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">JEE Main Weightage</div>
            <div className="text-yellow-500 text-lg leading-none">{jsonOutput.metadata?.weightage}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Expected Questions</div>
            <div className="font-bold text-xl leading-none">{jsonOutput.metadata?.expectedQuestions}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold text-gray-500 uppercase">Revision Time</div>
            <div className="font-bold text-xl leading-none flex items-center gap-1">
              <span>⏱</span> {jsonOutput.metadata?.time}
            </div>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
        
        {/* LEFT COLUMN (1/4 width) */}
        <div className="col-span-1 flex flex-col gap-4">
          
          {/* Why This Matters */}
          <div className="bg-blue-50/50 border border-blue-200 rounded-md">
            <SectionHeader title="Why This Chapter Matters" colorClass="bg-blue-600 text-white border-blue-700" />
            <ul className="p-4 space-y-3">
              {jsonOutput.whyThisMatters?.map((bullet: string, i: number) => (
                <li key={i} className="flex gap-2 items-start text-xs font-medium text-gray-700 leading-tight">
                  <span className="w-1 h-1 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <MathLine>{bullet}</MathLine>
                </li>
              ))}
            </ul>
          </div>

          {/* Motion Graphs */}
          {jsonOutput.graphs && jsonOutput.graphs.length > 0 && (
            <div className="border border-blue-600 rounded-md overflow-hidden">
               <SectionHeader title="Key Graphs" colorClass="bg-blue-600 text-white" />
               <div className="p-3 bg-blue-50/30">
                 {jsonOutput.graphs.map((graph: any, i: number) => (
                   <GraphRenderer key={i} data={graph} />
                 ))}
               </div>
            </div>
          )}

          {/* Diagrams (Chemistry / Physics) */}
          {jsonOutput.diagrams && jsonOutput.diagrams.length > 0 && (
            <div className="border border-blue-500 rounded-md overflow-hidden">
               <SectionHeader title="Important Diagrams" colorClass="bg-blue-500 text-white" />
               <div className="p-3 bg-blue-50/20">
                 {jsonOutput.diagrams.map((diag: any, i: number) => (
                   <DiagramRenderer key={i} data={diag} />
                 ))}
               </div>
            </div>
          )}
          
          {/* Common Mistakes */}
          <div className="border border-pink-500 rounded-md overflow-hidden">
             <SectionHeader title="Common Mistakes" colorClass="bg-pink-500 text-white" />
             <div className="p-3 space-y-2 bg-pink-50/30">
               {jsonOutput.commonMistakes?.map((mistake: any, i: number) => (
                 <div key={i} className="flex gap-2 items-start bg-white border border-pink-100 p-2 rounded">
                    <span className="text-red-500 font-bold text-sm shrink-0">×</span>
                    <div>
                      <p className="text-[10px] font-bold text-gray-800 leading-tight border-b border-pink-100 pb-1 mb-1"><MathLine>{mistake.wrong}</MathLine></p>
                      <p className="text-[10px] text-gray-600 leading-tight"><MathLine>{mistake.right}</MathLine></p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        {/* MIDDLE COLUMN (2/4 width) */}
        <div className="col-span-2 flex flex-col gap-4">
          
          {/* Concept Map */}
          <div className="border border-gray-200 rounded-md p-4 text-center">
            <SolidSectionHeader title="CONCEPT MAP" color="#8B5CF6" />
            <ConceptMapRenderer data={jsonOutput.conceptMap} />
          </div>

          {/* Key Formulas */}
          <div className="border border-blue-600 rounded-md overflow-hidden flex-1">
             <SectionHeader title="KEY FORMULAS" colorClass="bg-blue-600 text-white" />
             <div className="p-0">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    {jsonOutput.formulaCards?.map((formula: any, i: number) => (
                      <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-blue-50/50">
                        <td className="p-3 font-semibold text-blue-800 text-sm border-r border-gray-100 bg-blue-50/30 whitespace-nowrap overflow-hidden">
                          <MathLine>{`$${formula.latex}$`}</MathLine>
                        </td>
                        <td className="p-3 text-[11px] font-medium text-gray-700">
                          {formula.name}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>

          {/* PYQ Trend */}
          <div className="border border-purple-500 rounded-md overflow-hidden">
             <SectionHeader title="PYQ TREND (JEE MAIN)" colorClass="bg-purple-500 text-white" />
             <div className="p-3 bg-purple-50/30">
               <table className="w-full text-[11px] font-bold">
                 <thead>
                   <tr className="text-gray-500 border-b border-gray-200"><th className="text-left pb-1">TOPIC</th><th className="text-right pb-1">FREQUENCY</th></tr>
                 </thead>
                 <tbody>
                   {jsonOutput.pyqAnalysis?.map((pyq: any, i: number) => (
                     <tr key={i} className="border-b border-purple-100 last:border-0">
                       <td className="py-2 text-gray-800">{pyq.topic}</td>
                       <td className="py-2 text-right text-purple-600 text-sm">
                         {Array.from({ length: pyq.stars || 0 }).map((_, idx) => <span key={idx}>★</span>)}
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN (1/4 width) */}
        <div className="col-span-1 flex flex-col gap-4">
          
          {/* High Yield */}
          <div className="border border-red-500 rounded-md overflow-hidden">
             <SectionHeader title="HIGH-YIELD TOPICS" colorClass="bg-red-600 text-white" />
             <div className="bg-red-50/30 p-0">
               {jsonOutput.highYieldTopics?.map((topic: any, i: number) => (
                 <div key={i} className="flex justify-between items-center border-b border-red-100 last:border-0 p-3 text-xs font-bold text-gray-800">
                   <span>{topic.topic}</span>
                   <span className="text-red-500">
                     {Array.from({ length: topic.stars || 0 }).map((_, idx) => <span key={idx}>★</span>)}
                   </span>
                 </div>
               ))}
             </div>
          </div>

          {/* Kota Faculty Tricks */}
          <div className="border border-green-600 rounded-md overflow-hidden">
             <SectionHeader title="KOTA FACULTY TRICKS" colorClass="bg-green-600 text-white" />
             <div className="p-3 space-y-3 bg-green-50/30">
               {jsonOutput.memoryTricks?.map((trick: any, i: number) => (
                 <div key={i}>
                    <h5 className="text-[11px] font-extrabold text-green-800 mb-0.5">{trick.title}</h5>
                    <p className="text-[10px] font-medium text-gray-700 leading-tight"><MathLine>{trick.explanation}</MathLine></p>
                 </div>
               ))}
             </div>
          </div>

          {/* Quick Formula Box */}
          <div className="border border-orange-500 rounded-md overflow-hidden">
             <SectionHeader title="QUICK FORMULA BOX" colorClass="bg-orange-500 text-white" />
             <div className="p-3 bg-orange-50/30 space-y-2">
                {jsonOutput.quickRevision?.formulas?.map((f: any, i: number) => (
                   <div key={i} className="flex justify-between items-center border-b border-orange-100 pb-2 last:border-0">
                      <span className="font-bold text-orange-800 text-sm overflow-hidden text-ellipsis mr-2"><MathLine>{f.equation.includes('$') ? f.equation : `$${f.equation}$`}</MathLine></span>
                      <span className="text-[9px] text-gray-600 text-right font-medium max-w-[50%] shrink-0">{f.name}</span>
                   </div>
                ))}
             </div>
          </div>

          {/* 30 Sec Checklist */}
          <div className="border-2 border-emerald-500 rounded-md overflow-hidden">
             <SectionHeader title="30-SECOND REVISION CHECKLIST" colorClass="bg-emerald-500 text-white" />
             <div className="p-3 bg-emerald-50/20 space-y-2">
               {jsonOutput.checklist?.map((item: string, i: number) => (
                 <label key={i} className="flex gap-2 items-start text-[10px] font-bold text-gray-700 leading-tight cursor-pointer hover:text-emerald-700">
                    <input type="checkbox" className="mt-0.5 rounded text-emerald-500 focus:ring-emerald-500" />
                    <span><MathLine>{item}</MathLine></span>
                 </label>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
