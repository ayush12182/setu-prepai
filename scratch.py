import re
import os

filepath = 'src/pages/LandingPage.tsx'

with open(filepath, 'r') as f:
    content = f.read()

# Add import
if 'BatchIllustrations' not in content:
    content = content.replace("import LandingNav from '@/components/landing/LandingNav';", "import LandingNav from '@/components/landing/LandingNav';\nimport { AarambhIllustration, AarohanIllustration, ShikharIllustration } from '@/components/landing/BatchIllustrations';")
if 'Headphones' not in content:
    content = content.replace("Atom, Stethoscope,", "Atom, Stethoscope, Headphones,")

# Regex to replace Our Batches section
pattern = re.compile(r'\{\/\* ══════════════════════════════════\n\s*4\. OUR BATCHES\n\s*══════════════════════════════════ \*\/}.*?\{\/\* ══════════════════════════════════\n\s*5\. SUCCESS JOURNEY\n\s*══════════════════════════════════ \*\/}', re.DOTALL)

replacement = """{/* ══════════════════════════════════
          4. OUR BATCHES
      ══════════════════════════════════ */}
      <section id="batches" className="py-16 bg-slate-50 border-b border-slate-100 relative overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="flex flex-col items-center justify-center mb-10 text-center">
            <div className="flex items-center justify-center gap-4 mb-2">
              <span className="h-[2px] w-8 bg-blue-600 rounded-full" />
              <h2 className="text-heading-lg font-extrabold text-slate-900 tracking-tight">Our Batches</h2>
              <span className="h-[2px] w-8 bg-orange-500 rounded-full" />
            </div>
            <p className="text-body-md text-slate-500 font-medium">Choose the perfect plan for your JEE / NEET preparation journey.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {batches.map((b, i) => {
              const isPurple = b.slug === 'aarohan';
              const isOrange = b.slug === 'shikhar';
              const isBlue = b.slug === 'aarambh';

              const badgeBg = isPurple ? 'bg-purple-600 text-white' : isOrange ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white';
              const titleColor = 'text-slate-900';
              const subColor = isPurple ? 'text-purple-700' : isOrange ? 'text-orange-600' : 'text-blue-700';
              const btnBg = isPurple ? 'bg-purple-700 hover:bg-purple-800' : isOrange ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-700 hover:bg-blue-800';
              const checkColor = isPurple ? 'text-purple-600 bg-purple-100' : isOrange ? 'text-orange-600 bg-orange-100' : 'text-blue-600 bg-blue-100';
              const borderColor = isPurple ? 'border-purple-200' : isOrange ? 'border-orange-200' : 'border-blue-200';
              
              const illustration = isBlue ? <AarambhIllustration /> : isPurple ? <AarohanIllustration /> : <ShikharIllustration />;

              return (
                <div
                  key={i}
                  className={`relative rounded-2xl bg-white border flex flex-col overflow-hidden shadow-sm ${borderColor}`}
                >
                  {/* Most Popular Flag */}
                  {isPurple && (
                    <div className="absolute top-0 right-4 px-3 py-1 rounded-b bg-purple-700 text-white text-[9px] font-black tracking-widest uppercase shadow-sm z-10 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> MOST POPULAR
                    </div>
                  )}

                  <div className="p-5 flex flex-col h-full">
                    {/* Top Row: Labels and Illustration */}
                    <div className="flex justify-between items-start mb-4 h-32">
                      <div className="flex-1 mt-1">
                        <span className={`inline-block px-2.5 py-1 rounded text-[8px] font-bold tracking-widest uppercase mb-3 shadow-sm ${badgeBg}`}>
                          {b.label}
                        </span>
                        <h3 className={`text-[28px] font-black leading-none mb-1 tracking-tight ${titleColor}`}>
                          {b.mainName}
                        </h3>
                        <div className={`text-xs font-bold tracking-widest uppercase ${subColor}`}>
                          {b.year}
                        </div>
                        <div className="text-body-sm font-bold text-slate-800 mt-3">{b.subtitle}</div>
                        <div className="text-[10px] font-medium text-slate-500 italic mt-0.5">{b.mission}</div>
                      </div>
                      
                      {/* Illustration Area */}
                      <div className="w-[140px] h-[130px] shrink-0 -mt-2 -mr-2 relative z-0">
                        {illustration}
                      </div>
                    </div>
                    
                    <hr className="border-slate-100 mb-5" />

                    {/* Features List */}
                    <ul className="space-y-2.5 mb-6 flex-1">
                      {b.features.map((feat, j) => (
                        <li key={j} className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                          <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${checkColor}`}>
                            <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Pricing Display */}
                    <div className="bg-slate-50/50 rounded-xl flex flex-col items-center justify-center py-4 mb-4 min-h-[96px] border border-slate-100">
                      {isBlue && (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="text-slate-500 text-[10px] font-bold">Starting at</div>
                          <div className={`text-4xl font-black leading-none tracking-tight ${subColor}`}>₹349</div>
                          <div className="text-slate-500 text-[10px] font-bold tracking-wide">per month</div>
                        </div>
                      )}
                      
                      {isPurple && (
                        <div className="flex flex-col items-center">
                          <div className="text-slate-400 text-[11px] font-bold line-through mb-0.5">₹4,188</div>
                          <div className={`text-4xl font-black leading-none tracking-tight mb-1 ${subColor}`}>₹3,839</div>
                          <div className="text-slate-500 text-[10px] font-bold tracking-wide mb-1.5">for 12 months</div>
                          <div className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black tracking-widest uppercase">
                            SAVE ₹349
                          </div>
                        </div>
                      )}
                      
                      {isOrange && (
                        <div className="flex flex-col items-center">
                          <div className="text-slate-400 text-[11px] font-bold line-through mb-0.5">₹8,376</div>
                          <div className={`text-4xl font-black leading-none tracking-tight mb-1 ${subColor}`}>₹7,329</div>
                          <div className="text-slate-500 text-[10px] font-bold tracking-wide mb-1.5">for 24 months</div>
                          <div className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[9px] font-black tracking-widest uppercase">
                            SAVE ₹1,047
                          </div>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => navigate(`/batches/${b.slug}`)}
                      className={`w-full py-3.5 rounded-lg text-white font-bold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-sm ${btnBg}`}
                    >
                      {b.btnText}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Trust Strip */}
          <div className="mt-8 mb-4 rounded-xl bg-white border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col md:flex-row items-center justify-between p-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Item 1 */}
            <div className="flex flex-1 items-center gap-3 px-4 py-3 md:py-1">
              <div className="w-10 h-10 rounded flex items-center justify-center shrink-0">
                <Users className="w-8 h-8 text-blue-700" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 leading-tight">Expert Faculty</h4>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-tight">Learn from top teachers<br/>from Kota.</p>
              </div>
            </div>
            
            {/* Item 2 */}
            <div className="flex flex-1 items-center gap-3 px-4 py-3 md:py-1">
              <div className="w-10 h-10 rounded flex items-center justify-center shrink-0">
                <TrendingUp className="w-8 h-8 text-purple-700" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 leading-tight">Proven Results</h4>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-tight">Trusted by lakhs of<br/>aspirants across India.</p>
              </div>
            </div>

            {/* Item 3 */}
            <div className="flex flex-1 items-center gap-3 px-4 py-3 md:py-1">
              <div className="w-10 h-10 rounded flex items-center justify-center shrink-0">
                <FileText className="w-8 h-8 text-orange-600" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 leading-tight">Structured Preparation</h4>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-tight">Study, practice & test in<br/>perfect sequence.</p>
              </div>
            </div>

            {/* Item 4 */}
            <div className="flex flex-1 items-center gap-3 px-4 py-3 md:py-1">
              <div className="w-10 h-10 rounded flex items-center justify-center shrink-0">
                <Headphones className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h4 className="text-[13px] font-bold text-slate-900 leading-tight">24×7 Doubt Support</h4>
                <p className="text-[10px] font-medium text-slate-500 mt-0.5 leading-tight">AI + Human experts<br/>whenever you need.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════
          5. SUCCESS JOURNEY
      ══════════════════════════════════ */}"""

new_content = pattern.sub(replacement, content)

with open(filepath, 'w') as f:
    f.write(new_content)

print("Updated LandingPage.tsx")
