
import React, { useState, useCallback, useRef } from 'react';
import { ExtractionTemplate, ImageState, AnalysisResult } from './types';
import { analyzeImageToJson } from './services/geminiService';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [image, setImage] = useState<ImageState | null>(null);
  const [template, setTemplate] = useState<ExtractionTemplate>(ExtractionTemplate.GENERAL);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImage({
          data: base64String,
          mimeType: file.type,
          previewUrl: URL.createObjectURL(file)
        });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;

    setIsAnalyzing(true);
    setError(null);
    try {
      const jsonOutput = await analyzeImageToJson(
        image.data,
        image.mimeType,
        template,
        template === ExtractionTemplate.CUSTOM ? customPrompt : undefined
      );
      
      setResult({
        json: jsonOutput,
        template,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result.json);
    }
  };

  const clearImage = () => {
    setImage(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">VisionScript</h1>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={() => window.location.reload()}>New Session</Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 grid lg:grid-cols-2 gap-8">
        
        {/* Left Column: Input & Controls */}
        <section className="space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Upload Source Image
            </h2>
            
            <div 
              className={`relative border-2 border-dashed rounded-xl transition-all duration-300 group ${
                image ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700 hover:border-slate-500'
              }`}
            >
              {!image ? (
                <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-200 font-medium">Click to browse or drag & drop</p>
                    <p className="text-slate-500 text-sm">PNG, JPG up to 10MB</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              ) : (
                <div className="relative group">
                  <img 
                    src={image.previewUrl} 
                    alt="Preview" 
                    className="w-full h-auto max-h-[400px] object-contain rounded-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button variant="danger" onClick={clearImage} className="p-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-400 uppercase tracking-wider">
                Target Schema Template
              </label>
              <div className="grid grid-cols-2 gap-3">
                {Object.values(ExtractionTemplate).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTemplate(t)}
                    className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      template === t 
                        ? 'border-blue-600 bg-blue-600/10 text-blue-400' 
                        : 'border-slate-800 bg-slate-800/50 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {template === ExtractionTemplate.CUSTOM && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400">Custom Extraction Prompt</label>
                <textarea
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g. Extract the table data and return it as an array of objects with keys: id, name, price..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 focus:ring-2 focus:ring-blue-500 outline-none h-24"
                />
              </div>
            )}

            <Button 
              className="w-full h-14 text-lg" 
              onClick={handleAnalyze}
              isLoading={isAnalyzing}
              disabled={!image || isAnalyzing}
            >
              {isAnalyzing ? 'Extracting JSON...' : 'Generate Script'}
            </Button>
            
            {error && (
              <div className="p-4 bg-red-900/20 border border-red-900/50 text-red-400 rounded-xl flex gap-3 items-start">
                <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Output */}
        <section className="flex flex-col h-full min-h-[500px]">
          <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <h3 className="text-sm font-medium text-slate-200">JSON Output</h3>
                {result && (
                  <span className="text-xs text-slate-500 font-mono">at {result.timestamp}</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="p-1.5 h-auto text-xs" onClick={copyToClipboard} disabled={!result}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex-1 relative overflow-auto p-6 code-font">
              {!result && !isAnalyzing ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 p-8 text-center space-y-4">
                  <svg className="w-16 h-16 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <p>Ready to extract structured data. Upload an image and click "Generate Script".</p>
                </div>
              ) : isAnalyzing ? (
                <div className="space-y-4 animate-pulse">
                  <div className="h-4 bg-slate-800 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                  <div className="h-4 bg-slate-800 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                  <div className="h-4 bg-slate-800 rounded w-4/5"></div>
                </div>
              ) : (
                <pre className="text-blue-400 text-sm whitespace-pre-wrap">
                  {JSON.stringify(JSON.parse(result!.json), null, 2)}
                </pre>
              )}
            </div>
          </div>
          
          <div className="mt-4 text-xs text-slate-500 text-center px-4">
            Powered by Gemini 3 Flash. Built for instant image-to-data conversion.
          </div>
        </section>
      </main>
      
      {/* Persistent CTA / Floating info */}
      <footer className="p-4 border-t border-slate-800 bg-slate-900/30 text-center">
        <p className="text-slate-500 text-sm">
          VisionScript &copy; 2024 &bull; Professional Data Extraction Platform
        </p>
      </footer>
    </div>
  );
};

export default App;
