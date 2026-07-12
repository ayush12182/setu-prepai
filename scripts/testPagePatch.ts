import fs from 'fs';

const path = 'src/pages/TestPage.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `  const overallStats = useMemo(() => {
    const avgMastery = Math.round(allChapters.reduce((a, c) => a + c.mastery, 0) / allChapters.length);
    const testsAttempted = allChapters.reduce((a, c) => a + c.testsAttempted, 0);
    const strong = allChapters.filter(c => c.status === 'strong').length;
    const weak = allChapters.filter(c => c.status === 'weak').length;
    return { avgMastery, testsAttempted, strong, weak, total: allChapters.length };
  }, [allChapters]);`;

const replacement = `  const overallStats = useMemo(() => {
    const avgMastery = Math.round(allChapters.reduce((a, c) => a + c.mastery, 0) / allChapters.length);
    
    let globalTestsAttempted = 0;
    try {
      const raw = localStorage.getItem('demo_chapter_stats');
      if (raw) {
         const ds = JSON.parse(raw);
         globalTestsAttempted = ds['__overall'] || 0;
      }
    } catch(e) {}
    
    const chapterTestsAttempted = allChapters.reduce((a, c) => a + c.testsAttempted, 0);
    const testsAttempted = Math.max(globalTestsAttempted, chapterTestsAttempted);
    
    const strong = allChapters.filter(c => c.status === 'strong').length;
    const weak = allChapters.filter(c => c.status === 'weak').length;
    return { avgMastery, testsAttempted, strong, weak, total: allChapters.length };
  }, [allChapters, demoRefreshCounter]);`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log("Updated TestPage.tsx");
