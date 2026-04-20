import React, { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
// Lazy-load heavier interactive demos
const SalivaGlucoseDemo = lazy(() => import("@/components/SalivaGlucoseDemo"));
const OCRUpload = lazy(() => import("@/components/OCRUpload"));
import { 
  Upload, 
  Stethoscope, 
  Brain, 
  ChartBar, 
  Shield, 
  ArrowRight, 
  Droplet, 
  FileText, 
  Clock,
  Star,
  Check,
  Zap
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-medical-ai.jpg";
// ChatGPT API service for AI-powered features
import { analyzeGlucosePatterns, getMealRecommendations, analyzeMedicalReport } from "@/services/chatgptService";

// Reusable UI pieces
const FeatureCard = ({ Icon, title, description, gradient, index }) => (
  <Card 
    className="feature-card hover-lift shadow-medium border-border/50 animate-fade-in transition-all duration-300 hover:shadow-lg hover:-translate-y-1 focus-within:shadow-lg"
    style={{ animationDelay: `${index * 100}ms` }}
    role="listitem"
  >
    <CardHeader>
      <div className={`h-14 w-14 rounded-xl bg-${gradient} flex items-center justify-center mb-4 shadow-medium ring-1 ring-white/10`}
        aria-hidden="true">
        <Icon className="h-7 w-7 text-white" />
      </div>
      <CardTitle className="font-inter text-xl mb-2">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

const TestimonialCard = ({ name, role, image, quote, rating, index }) => (
  <Card 
    className="hover-lift shadow-medium border-border/50 animate-fade-in transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    style={{ animationDelay: `${index * 100}ms` }}
    role="listitem"
  >
    <CardHeader>
      <div className="flex items-center gap-3 mb-4">
        <div className="text-4xl" aria-hidden="true">{image}</div>
        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-muted-foreground">{role}</div>
        </div>
      </div>
      <div className="flex gap-1 mb-3" aria-label={`Rating ${rating} out of 5`}>
        {Array.from({ length: rating }).map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
        ))}
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground italic leading-relaxed">
        "{quote}"
      </p>
    </CardContent>
  </Card>
);

const Index = () => {
  // Voice navigation: opt-in control for basic commands like "get started"
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [voiceSupport, setVoiceSupport] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState("");
  const recognitionRef = useRef(null);
  
  // Text scaling: user-controlled font sizes for readability (base | lg | xl)
  const [fontScale, setFontScale] = useState("base");
  // Theme toggle with system preference default
  const [isDark, setIsDark] = useState(false);
  
  // Accessibility modal state and focus refs
  const [isA11yOpen, setIsA11yOpen] = useState(false);
  const lastFocusedRef = useRef(null);
  const dialogRef = useRef(null);
  
  // WebAuthn support flag (biometric readiness)
  const [webauthnSupported, setWebauthnSupported] = useState(false);
  // Eye-tracking readiness preference (placeholder)
  const [eyeTrackingReady, setEyeTrackingReady] = useState(false);
  
  // ChatGPT API integration state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("");

  useEffect(() => {
    const SpeechRecognition = typeof window !== "undefined" && (window.SpeechRecognition || window.webkitSpeechRecognition);
    if (SpeechRecognition) {
      setVoiceSupport(true);
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.lang = "en-US";
      rec.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(r => r[0].transcript.toLowerCase())
          .join(" ");
        if (transcript.includes("get started")) {
          const cta = document.getElementById("primary-cta");
          if (cta) {
            cta.click();
            setVoiceStatus("Activated: Navigating to Get Started");
          }
        }
      };
      rec.onstart = () => setVoiceStatus("Voice navigation is listening… say 'get started'.");
      rec.onend = () => setVoiceStatus(voiceEnabled ? "Listening paused" : "Voice navigation off");
      recognitionRef.current = rec;
    }
  }, [voiceEnabled]);

  useEffect(() => {
    if (!recognitionRef.current) return;
    try {
      if (voiceEnabled) recognitionRef.current.start(); else recognitionRef.current.stop();
    } catch (_) {
      // Some browsers throw if start/stop called too quickly
    }
  }, [voiceEnabled]);
  
  // Initialize theme from system preference and keep html.dark in sync
  useEffect(() => {
    const prefersDark = typeof window !== "undefined" && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    if (prefersDark) document.documentElement.classList.add('dark');
  }, []);
  useEffect(() => {
    if (isDark) document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
  }, [isDark]);
  
  // Feature detection for biometrics
  useEffect(() => {
    setWebauthnSupported(!!(window.PublicKeyCredential && typeof window.PublicKeyCredential === 'function'));
  }, []);
  
  // Modal focus management and simple focus trap
  useEffect(() => {
    if (isA11yOpen) {
      lastFocusedRef.current = document.activeElement;
      const focusable = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      focusable && focusable[0] && focusable[0].focus();
    } else if (lastFocusedRef.current) {
      lastFocusedRef.current.focus();
    }
  }, [isA11yOpen]);
  const handleDialogKeyDown = (e) => {
    if (e.key === 'Escape') { setIsA11yOpen(false); return; }
    if (e.key === 'Tab') {
      const focusable = dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  };
  
  // Analyze glucose patterns with ChatGPT (with meals and activity context)
  const handleAnalyzeGlucose = async () => {
    // Example glucose readings - replace with actual user data
    const sampleReadings = [
      { timestamp: '2025-01-15 08:00', value: 95 },
      { timestamp: '2025-01-15 12:00', value: 140 },
      { timestamp: '2025-01-15 18:00', value: 120 },
    ];

    // Example contextual data: recent meals and physical activity
    const context = {
      recentMeals: [
        { time: '2025-01-15 07:30', name: 'Breakfast: Oatmeal with banana', carbs: 45 },
        { time: '2025-01-15 12:15', name: 'Lunch: Grilled chicken with brown rice', carbs: 55 },
        { time: '2025-01-15 17:30', name: 'Snack: Apple', carbs: 25 },
      ],
      activity: { time: '2025-01-15 18:30', type: 'Walking', minutes: 30, intensity: 'moderate' }
    };
    
    setAiLoading(true);
    setAiResponse(""); // Clear previous response
    try {
      const insights = await analyzeGlucosePatterns(sampleReadings, context);
      setAiResponse(insights);
    } catch (error) {
      console.error('AI analysis error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      if (errorMessage.includes('API key')) {
        setAiResponse(`Unable to analyze patterns: ${errorMessage}\n\nPlease add your OpenAI API key to your .env file:\nVITE_OPENAI_API_KEY=your-api-key-here\n\nGet your key at: https://platform.openai.com/api-keys`);
      } else {
        setAiResponse(`Unable to analyze patterns: ${errorMessage}\n\nPlease check your API key and try again later.`);
      }
    } finally {
      setAiLoading(false);
    }
  };
  
  // Get meal recommendations with ChatGPT
  const handleGetMealRecommendations = async (currentGlucose = 110) => {
    setAiLoading(true);
    setAiResponse(""); // Clear previous response
    try {
      const recommendations = await getMealRecommendations(currentGlucose);
      setAiResponse(recommendations);
    } catch (error) {
      console.error('Meal recommendation error:', error);
      const errorMessage = error.message || 'Unknown error occurred';
      if (errorMessage.includes('API key')) {
        setAiResponse(`Unable to generate recommendations: ${errorMessage}\n\nPlease add your OpenAI API key to your .env file:\nVITE_OPENAI_API_KEY=your-api-key-here\n\nGet your key at: https://platform.openai.com/api-keys`);
      } else {
        setAiResponse(`Unable to generate recommendations: ${errorMessage}\n\nPlease check your API key and try again later.`);
      }
    } finally {
      setAiLoading(false);
    }
  };
  const features = [
    {
      icon: Droplet,
      title: "Pain-Free Glucose Tracking",
      description: "Say goodbye to finger pricks. Our revolutionary saliva sensor provides accurate readings without any discomfort.",
      gradient: "gradient-sensor"
    },
    {
      icon: Brain,
      title: "ChatGPT-Powered Predictions",
      description: "OpenAI's GPT-4 analyzes your glucose patterns and predicts trends with personalized insights, helping you stay ahead of fluctuations.",
      gradient: "gradient-primary"
    },
    {
      icon: FileText,
      title: "Instant Report Analysis",
      description: "Upload your hospital reports and get glucose data extracted automatically—no manual entry needed.",
      gradient: "gradient-health"
    },
    {
      icon: ChartBar,
      title: "ChatGPT Meal Recommendations",
      description: "Get personalized meal suggestions powered by ChatGPT, tailored to your current glucose levels and dietary preferences.",
      gradient: "gradient-primary"
    },
    {
      icon: Clock,
      title: "24/7 Continuous Monitoring",
      description: "Track your glucose levels around the clock with automatic alerts for concerning trends.",
      gradient: "gradient-sensor"
    },
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "Your health data is protected with end-to-end encryption and HIPAA/GDPR compliance.",
      gradient: "gradient-health"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Type 2 Diabetes Patient",
      image: "👩‍⚕️",
      quote: "I was tired of pricking my fingers 4 times a day. This platform has been life-changing—painless monitoring and the AI actually predicts when my glucose will spike!",
      rating: 5
    },
    {
      name: "Dr. Michael Chen",
      role: "Endocrinologist",
      image: "👨‍⚕️",
      quote: "The OCR feature saves my patients hours of manual data entry. The predictive analytics help us adjust treatment plans proactively instead of reactively.",
      rating: 5
    },
    {
      name: "Emma Rodriguez",
      role: "Pre-diabetic",
      image: "👩",
      quote: "The meal recommendations based on my glucose levels have helped me avoid developing full diabetes. It's like having a nutritionist in my pocket.",
      rating: 5
    }
  ];

  const stats = [
    { value: "95%", label: "Prediction Accuracy" },
    { value: "10K+", label: "Active Users" },
    { value: "50M+", label: "Readings Analyzed" },
    { value: "4.9★", label: "User Rating" }
  ];

  return (
    <div className={`min-h-screen bg-background ${fontScale === 'xl' ? 'text-xl' : fontScale === 'lg' ? 'text-lg' : 'text-base'}`}>
      {/* Skip link for keyboard users */}
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-background focus:text-foreground focus:px-4 focus:py-2 focus:rounded-md focus:shadow-lg">
        Skip to main content
      </a>

      <header role="banner" className="relative">
        <Navigation />
        {/* Accessible button to open modal with settings; labeled and keyboard-focusable */}
        <div className="container mx-auto px-4">
          <div className="mt-4 flex justify-end">
            <Button variant="outline" aria-haspopup="dialog" aria-controls="a11y-dialog" onClick={() => setIsA11yOpen(true)}>
              Accessibility Settings
            </Button>
          </div>
        </div>
      </header>
      
      <main id="main-content" role="main" tabIndex={-1}>
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-secondary/5" aria-labelledby="hero-heading">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Medical AI glucose tracking platform background" 
            className="w-full h-full object-cover opacity-10"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background" />
        </div>
        
        <div className="container mx-auto px-4 py-20 sm:py-24 md:py-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center motion-safe:animate-fade-in motion-reduce:animate-none">
            <Badge className="mb-6 inline-flex items-center bg-primary/15 text-primary border-primary/30 hover:bg-primary/25 transition-colors">
              <Zap className="h-3 w-3 mr-1" aria-hidden="true" />
              Powered by ChatGPT AI
            </Badge>
            
            <h1 id="hero-heading" className="text-4xl sm:text-5xl md:text-7xl font-bold font-inter mb-6 leading-tight tracking-tight">
              Tired of Painful <br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-secondary bg-clip-text text-transparent">
                Finger Pricks?
              </span>
            </h1>
            
            <p className="text-lg md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto leading-relaxed">
              Take control of your diabetes with pain-free monitoring and AI-powered insights.
            </p>
            
            <p id="cta-help" className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
              Track glucose through saliva, get instant report analysis, and receive personalized recommendations—all in one platform. Clicking Get Started Free creates your account—no credit card required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link to="/auth">
                <Button id="primary-cta" aria-describedby="cta-help" aria-label="Get Started Free: create your account, no credit card required" size="lg" className="text-lg px-8 py-6 shadow-glow hover-glow group transition-all duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-primary touch-manipulation">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button aria-label="Upload medical report" size="lg" variant="outline" className="text-lg px-8 py-6 hover-lift transition-transform duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-primary/60 touch-manipulation">
                <Upload className="mr-2 h-5 w-5" aria-hidden="true" />
                Upload Report Now
              </Button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-12 md:mt-16 pt-8 border-t border-border/50" role="list" aria-label="Key platform statistics">
              {stats.map((stat, index) => (
                <div key={index} className="text-center motion-safe:animate-fade-in motion-reduce:animate-none" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-24 bg-gradient-subtle" aria-labelledby="features-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 motion-safe:animate-fade-in motion-reduce:animate-none">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              Why Choose Us
            </Badge>
            <h2 id="features-heading" className="text-3xl md:text-5xl font-bold font-inter mb-4 tracking-tight">
              Everything You Need to <br />Manage Diabetes Smarter
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced technology meets simple, user-friendly design
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-7xl mx-auto" role="list" aria-label="Feature list">
            {features.map((feature, index) => (
              <FeatureCard 
                key={feature.title}
                Icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* AI Analysis Demo Section */}
      <section className="py-20 md:py-24 bg-background" aria-labelledby="ai-demo-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 motion-safe:animate-fade-in motion-reduce:animate-none">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              ChatGPT AI Features
            </Badge>
            <h2 id="ai-demo-heading" className="text-3xl md:text-5xl font-bold font-inter mb-4 tracking-tight">
              Try ChatGPT-Powered Analysis
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Test our AI-powered glucose analysis and meal recommendations
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Glucose Pattern Analysis */}
            <Card className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold font-inter mb-2 flex items-center">
                    <Brain className="h-5 w-5 mr-2 text-primary" aria-hidden="true" />
                    Glucose Pattern Analysis
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze sample glucose readings and get AI-powered predictions
                  </p>
                </div>
                <Button 
                  onClick={handleAnalyzeGlucose} 
                  disabled={aiLoading}
                  className="sm:min-w-[180px]"
                  aria-label="Analyze glucose patterns with ChatGPT"
                >
                  {aiLoading ? 'Analyzing...' : 'Analyze Patterns'}
                </Button>
              </div>
              
              {/* Meal Recommendations */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-border/50">
                <div>
                  <h3 className="text-xl font-bold font-inter mb-2 flex items-center">
                    <ChartBar className="h-5 w-5 mr-2 text-secondary" aria-hidden="true" />
                    Meal Recommendations
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Get personalized meal suggestions based on glucose levels
                  </p>
                </div>
                <Button 
                  onClick={() => handleGetMealRecommendations(110)} 
                  disabled={aiLoading}
                  variant="outline"
                  className="sm:min-w-[180px]"
                  aria-label="Get meal recommendations from ChatGPT"
                >
                  {aiLoading ? 'Generating...' : 'Get Recommendations'}
                </Button>
              </div>
            </Card>

            {/* AI Response Display */}
            {aiResponse && (
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="text-lg font-semibold flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-primary" aria-hidden="true" />
                    AI Analysis Result
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setAiResponse("")}
                    aria-label="Clear AI response"
                  >
                    Clear
                  </Button>
                </div>
                <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-wrap">
                  {aiResponse}
                </div>
              </Card>
            )}

            {/* Error Display */}
            {aiResponse && aiResponse.includes('Unable to') && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">
                  <strong>Note:</strong> {aiResponse}
                  <br />
                  Make sure you've set VITE_OPENAI_API_KEY in your .env file. 
                  <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline ml-1">
                    Get your API key here
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20 md:py-24 bg-gradient-subtle" aria-labelledby="demo-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 motion-safe:animate-fade-in motion-reduce:animate-none">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
              Try It Now
            </Badge>
            <h2 id="demo-heading" className="text-3xl md:text-5xl font-bold font-inter mb-4 tracking-tight">
              See Our Technology in Action
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience how easy diabetes management can be
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 max-w-6xl mx-auto">
            {/* OCR Upload Demo */}
            <div className="motion-safe:animate-fade-in motion-reduce:animate-none hover-lift">
              <div className="mb-4">
                <h3 className="text-2xl font-bold font-inter mb-2 flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-primary" aria-hidden="true" />
                  Instant Report Analysis
                </h3>
                <p className="text-muted-foreground">
                  Upload your hospital reports and watch AI extract glucose data instantly
                </p>
              </div>
              <Suspense fallback={<div className="h-64 rounded-lg border border-border/50 animate-pulse bg-muted/30" aria-busy="true" aria-label="Loading OCR upload" />}> 
                <OCRUpload />
              </Suspense>
            </div>
            
            {/* Saliva Sensor Demo */}
            <div className="motion-safe:animate-fade-in motion-reduce:animate-none hover-lift" style={{ animationDelay: "200ms" }}>
              <div className="mb-4">
                <h3 className="text-2xl font-bold font-inter mb-2 flex items-center">
                  <Droplet className="h-6 w-6 mr-2 text-secondary" aria-hidden="true" />
                  Pain-Free Monitoring
                </h3>
                <p className="text-muted-foreground">
                  Future-ready saliva sensor for continuous, non-invasive glucose tracking
                </p>
              </div>
              <Suspense fallback={<div className="h-64 rounded-lg border border-border/50 animate-pulse bg-muted/30" aria-busy="true" aria-label="Loading saliva glucose demo" />}> 
                <SalivaGlucoseDemo />
              </Suspense>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-24 bg-gradient-to-br from-primary/5 to-secondary/5" aria-labelledby="testimonials-heading">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 motion-safe:animate-fade-in motion-reduce:animate-none">
            <Badge className="mb-4 bg-secondary/10 text-secondary border-secondary/20">
              Success Stories
            </Badge>
            <h2 id="testimonials-heading" className="text-3xl md:text-5xl font-bold font-inter mb-4 tracking-tight">
              Trusted by Thousands
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real results from real people managing diabetes smarter
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto" role="list" aria-label="Testimonials">
            {testimonials.map((t, index) => (
              <TestimonialCard 
                key={t.name}
                name={t.name}
                role={t.role}
                image={t.image}
                quote={t.quote}
                rating={t.rating}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 md:py-28 bg-gradient-to-r from-primary via-primary-glow to-secondary relative overflow-hidden" aria-labelledby="cta-heading">
        {/* Gradient glow layers */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -inset-24 bg-[radial-gradient(40rem_40rem_at_50%_10%,rgba(255,255,255,0.25),transparent)] opacity-20 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent)]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center animate-fade-in text-white">
            <h2 id="cta-heading" className="text-3xl md:text-5xl font-bold font-inter mb-6 tracking-tight">
              Ready to Take Control of Your Diabetes?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands who've already made the switch to smarter, pain-free monitoring
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button aria-label="Get Started Free: create your account, no credit card required" size="lg" variant="secondary" className="text-lg px-10 py-6 shadow-large hover-lift transition-all duration-300 hover:shadow-xl focus:ring-2 focus:ring-offset-2 focus:ring-white/80 touch-manipulation">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button aria-label="Healthcare professional login" size="lg" variant="outline" className="text-lg px-10 py-6 bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-colors duration-300 focus:ring-2 focus:ring-offset-2 focus:ring-white/60 touch-manipulation">
                <Stethoscope className="mr-2 h-5 w-5" aria-hidden="true" />
                Healthcare Login
              </Button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-6 text-sm opacity-80">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" aria-hidden="true" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" aria-hidden="true" />
                Free for 30 days
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4" aria-hidden="true" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Voice navigation controls (opt-in) */}
      <section className="py-10 border-t border-border/50" aria-labelledby="voice-heading">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 id="voice-heading" className="text-2xl font-semibold mb-3">Accessibility Options</h2>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button
              variant="outline"
              aria-pressed={voiceEnabled}
              aria-label={voiceEnabled ? "Disable voice navigation" : "Enable voice navigation"}
              onClick={() => setVoiceEnabled(v => !v)}
              className="px-6 py-3"
              disabled={!voiceSupport}
            >
              {voiceEnabled ? "Disable Voice Navigation" : "Enable Voice Navigation"}
            </Button>
            <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
              {!voiceSupport ? "Voice navigation not supported in this browser." : voiceStatus}
            </div>
          </div>
          <ul className="mt-4 list-disc pl-6 text-sm text-muted-foreground">
            <li>Say "get started" to activate the primary call to action.</li>
            <li>This feature is optional and can be turned off anytime.</li>
          </ul>
        </div>
      </section>

      </main>

      <footer role="contentinfo">
        <Footer />
      </footer>
      
      {/* Accessibility Settings Modal: includes theme, text size, voice, biometrics and eye-tracking readiness */}
      {isA11yOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" aria-labelledby="a11y-title" aria-describedby="a11y-desc">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsA11yOpen(false)} />
          <div id="a11y-dialog" ref={dialogRef} role="dialog" aria-modal="true" className="relative z-[61] w-full max-w-xl rounded-lg border border-border/60 bg-background p-6 shadow-xl focus:outline-none" onKeyDown={handleDialogKeyDown}>
            <h2 id="a11y-title" className="text-xl font-semibold mb-2">Accessibility Settings</h2>
            <p id="a11y-desc" className="text-sm text-muted-foreground mb-4">Adjust display, input, and assistive options. All controls are keyboard and screen-reader accessible.</p>
            {/* Theme toggle with high-contrast palettes */}
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">Color Scheme</div>
                <div className="text-sm text-muted-foreground">High-contrast, colorblind-friendly palette; avoids red/green and blue/gray conflicts.</div>
              </div>
              <Button variant="outline" aria-pressed={isDark} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} onClick={() => setIsDark(v => !v)}>
                {isDark ? 'Light Mode' : 'Dark Mode'}
              </Button>
            </div>
            {/* Text scaling controls */}
            <div className="mb-4">
              <div className="font-medium mb-2">Text Size</div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Text size options">
                <Button variant={fontScale === 'base' ? 'default' : 'outline'} onClick={() => setFontScale('base')} aria-pressed={fontScale === 'base'}>Default</Button>
                <Button variant={fontScale === 'lg' ? 'default' : 'outline'} onClick={() => setFontScale('lg')} aria-pressed={fontScale === 'lg'}>Large</Button>
                <Button variant={fontScale === 'xl' ? 'default' : 'outline'} onClick={() => setFontScale('xl')} aria-pressed={fontScale === 'xl'}>Extra Large</Button>
              </div>
            </div>
            {/* Voice navigation controls (duplicate of section, provided inline for convenience) */}
            <div className="mb-4">
              <div className="font-medium mb-1">Voice Navigation</div>
              <div className="flex items-center gap-3">
                <Button variant="outline" aria-pressed={voiceEnabled} aria-label={voiceEnabled ? 'Disable voice navigation' : 'Enable voice navigation'} onClick={() => setVoiceEnabled(v => !v)}>
                  {voiceEnabled ? 'Disable' : 'Enable'} Voice
                </Button>
                <div role="status" aria-live="polite" className="text-sm text-muted-foreground">
                  {!voiceSupport ? 'Not supported in this browser.' : voiceStatus}
                </div>
              </div>
            </div>
            {/* Biometrics readiness */}
            <div className="mb-4">
              <div className="font-medium mb-1">Biometric Login (Readiness)</div>
              <p className="text-sm text-muted-foreground mb-2">If supported by your device, you can set up Face/Touch ID in account settings.</p>
              <Button variant="outline" disabled={!webauthnSupported} aria-disabled={!webauthnSupported} aria-label="Set up biometric login (requires account)">
                {webauthnSupported ? 'Set up Biometrics' : 'Biometrics Not Supported'}
              </Button>
            </div>
            {/* Eye-tracking readiness */}
            <div className="mb-6">
              <div className="font-medium mb-1">Eye-Tracking Navigation (Readiness)</div>
              <p className="text-sm text-muted-foreground mb-2">Experimental. Enables larger targets and reduced motion helpful for gaze-based tools.</p>
              <Button variant="outline" aria-pressed={eyeTrackingReady} onClick={() => setEyeTrackingReady(v => !v)} aria-label="Toggle eye-tracking readiness">
                {eyeTrackingReady ? 'Disable' : 'Enable'} Eye-Tracking Mode
              </Button>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsA11yOpen(false)} aria-label="Close accessibility settings">Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
