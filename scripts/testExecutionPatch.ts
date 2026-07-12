import fs from 'fs';

const path = 'src/components/test/TestExecution.tsx';
let content = fs.readFileSync(path, 'utf8');

const target = `    // MOCK FOR DEMO: Save stats to localStorage so TestPage can read them
    try {
      if (config.chapters && config.chapters.length > 0) {
        const chId = config.chapters[0].chapterId;
        const raw = localStorage.getItem('demo_chapter_stats');
        const demoStats = raw ? JSON.parse(raw) : {};
        
        const prevStats = demoStats[chId] || { testsAttempted: 0, questionsSolved: 0, mastery: 0 };
        
        demoStats[chId] = {
          testsAttempted: prevStats.testsAttempted + 1,
          questionsSolved: prevStats.questionsSolved + correctAnswersCount,
          mastery: Math.max(prevStats.mastery, scorePercentage),
          lastScore: scorePercentage,
          lastAttempt: new Date().toISOString()
        };
        
        localStorage.setItem('demo_chapter_stats', JSON.stringify(demoStats));
      }
    } catch(e) {}`;

const replacement = `    // MOCK FOR DEMO: Save stats to localStorage so TestPage can read them
    try {
      const raw = localStorage.getItem('demo_chapter_stats');
      const demoStats = raw ? JSON.parse(raw) : {};
      
      // Update overall test counter
      demoStats['__overall'] = (demoStats['__overall'] || 0) + 1;

      // Update specific chapters if provided
      if (config.chapters && config.chapters.length > 0) {
        // Distribute questions solved
        const qPerCh = Math.ceil(correctAnswersCount / config.chapters.length);
        
        config.chapters.forEach(ch => {
          const chId = ch.chapterId;
          const prevStats = demoStats[chId] || { testsAttempted: 0, questionsSolved: 0, mastery: 0 };
          
          demoStats[chId] = {
            testsAttempted: prevStats.testsAttempted + 1,
            questionsSolved: prevStats.questionsSolved + qPerCh,
            mastery: Math.max(prevStats.mastery, scorePercentage),
            lastScore: scorePercentage,
            lastAttempt: new Date().toISOString()
          };
        });
      }
      localStorage.setItem('demo_chapter_stats', JSON.stringify(demoStats));
    } catch(e) {}`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content);
console.log("Updated TestExecution.tsx");
