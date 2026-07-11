const jsonModules = import.meta.glob('./*.json');

const subjectPrefixMap: Record<string, string> = {
  physics: 'phy',
  chemistry: 'chem',
  maths: 'math'
};

export const getRevisionData = async (subject: string, chapterId: string) => {
  // Extract number from chapterId (e.g., 'phy-0' -> 0, 'chem-1' -> 1)
  const idParts = chapterId.split('-');
  if (idParts.length !== 2) return null;
  
  const num = parseInt(idParts[1], 10);
  
  // Physics is 0-indexed in syllabus, Chemistry/Maths are 1-indexed.
  // We need to map to the 1-indexed filename format (e.g., '01', '02').
  let fileIndex = num;
  if (subject === 'physics') {
    fileIndex = num + 1;
  }
  
  const filePrefix = `${subject}_${fileIndex.toString().padStart(2, '0')}`;

  // Find the matching module key
  const moduleKey = Object.keys(jsonModules).find(key => key.includes(filePrefix));
  
  if (!moduleKey) {
    console.error(`[RevisionData] Missing JSON file for ${subject} chapter ${chapterId} (expected prefix: ${filePrefix})`);
    return null;
  }

  try {
    const module = await jsonModules[moduleKey]();
    // Vite dynamic import returns { default: JSON_DATA } or directly the data depending on setup
    const data = (module as any).default || module;
    
    // Strict runtime validation
    validateRevisionData(chapterId, data);
    
    return data;
  } catch (err) {
    console.error(`[RevisionData] Error loading JSON for ${chapterId}:`, err);
    return null;
  }
};

const validateRevisionData = (chapterId: string, data: any) => {
  const requiredFields = [
    'whyChapterMatters',
    'conceptMap',
    'keyFormulas',
    'pyqTrends',
    'highYieldTopics',
    'commonMistakes',
    'kotaFacultyTricks',
    'quickFormulaBox'
  ];

  requiredFields.forEach(field => {
    if (!data[field] || (Array.isArray(data[field]) && data[field].length === 0)) {
      if (field === 'conceptMap' && (!data.conceptMap || !data.conceptMap.nodes || data.conceptMap.nodes.length === 0)) {
         console.warn(`[RevisionData] ${chapterId} missing or empty conceptMap.nodes`);
      } else if (field !== 'conceptMap') {
         console.warn(`[RevisionData] ${chapterId} missing or empty ${field}`);
      }
    }
  });
};
