const SUPABASE_EDGE_FUNCTION_URL = "https://osbpdjlywgydidzurpsb.supabase.co/functions/v1/generate-notes";

const PHYSICS_CHAPTERS = [
  { id: 'phy-4', name: 'Rotational Motion' },
  { id: 'phy-5', name: 'Gravitation' },
  { id: 'phy-6', name: 'Mechanical Properties of Solids' },
  { id: 'phy-7', name: 'Mechanical Properties of Fluids' },
  { id: 'phy-8', name: 'Thermal Properties of Matter' },
  { id: 'phy-9', name: 'Thermodynamics' },
  { id: 'phy-10', name: 'Kinetic Theory' },
  { id: 'phy-11', name: 'Oscillations' },
  { id: 'phy-12', name: 'Waves' },
  { id: 'phy-13', name: 'Electric Charges and Fields' },
  { id: 'phy-14', name: 'Electrostatic Potential and Capacitance' },
  { id: 'phy-15', name: 'Current Electricity' },
  { id: 'phy-16', name: 'Moving Charges and Magnetism' },
  { id: 'phy-17', name: 'Magnetism and Matter' },
  { id: 'phy-18', name: 'Electromagnetic Induction' },
  { id: 'phy-19', name: 'Alternating Current' },
  { id: 'phy-20', name: 'Electromagnetic Waves' },
  { id: 'phy-21', name: 'Ray Optics and Optical Instruments' },
  { id: 'phy-22', name: 'Wave Optics' },
  { id: 'phy-23', name: 'Dual Nature of Radiation and Matter' },
  { id: 'phy-24', name: 'Atoms' },
  { id: 'phy-25', name: 'Nuclei' },
  { id: 'phy-26', name: 'Semiconductor Electronics' },
  { id: 'phy-27', name: 'Experimental Physics' }
];

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log(`🚀 Starting remote generation for ${PHYSICS_CHAPTERS.length} chapters...`);
  
  for (const chapter of PHYSICS_CHAPTERS) {
    console.log(`\n⏳ Triggering generation for ${chapter.name} (${chapter.id})...`);
    
    try {
      const response = await fetch(SUPABASE_EDGE_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapterId: chapter.id,
          chapterName: chapter.name,
          subject: "Physics",
          topics: [],
          examType: "JEE",
          examMode: "JEE",
          language: "english"
        })
      });

      const text = await response.text();
      
      if (response.ok) {
        console.log(`✅ Success for ${chapter.name}!`);
      } else {
        if (text.includes("Chapter already exists")) {
            console.log(`ℹ️ Chapter already exists: ${chapter.name}`);
        } else {
            console.log(`❌ Failed for ${chapter.name}. Status: ${response.status}. Error: ${text.substring(0, 100)}`);
        }
      }
    } catch (e: any) {
      console.log(`❌ Network Error for ${chapter.name}: ${e.message}`);
    }
    
    // Pause for 1 second to avoid rate limits
    await sleep(1000);
  }
  
  console.log("\n🎉 Generation trigger script complete!");
}

run();
