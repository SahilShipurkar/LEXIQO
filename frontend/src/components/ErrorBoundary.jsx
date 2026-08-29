import React from 'react';

class ErrorBoundary extends React.Component {
 constructor(props) {
 super(props);
 this.state = { hasError: false, error: null, errorInfo: null };
 }

 static getDerivedStateFromError(error) {
 return { hasError: true, error };
 }

 componentDidCatch(error, errorInfo) {
 console.error("ErrorBoundary caught an error:", error, errorInfo);
 this.setState({ errorInfo });
 }

 render() {
 if (this.state.hasError) {
 return (
 <div className="premium-bg min-h-screen flex items-center justify-center p-6 text-text-primary font-mono">
  <div className="glass-card w-full max-w-[800px] ed-500/20 bg-red-500/5 p-10 md:p-14 animate-fade-in relative overflow-hidden">
  <div className="absolute top-0 left-0 w-full h-[2px] bg-red-500/40" />
  <div className="flex items-center gap-4 mb-8">
  <div className="w-12 h-12 bg-red-500 flex items-center justify-center text-text-primary font-semibold text-2xl skew-x-[-15deg] shadow-[0_0_15px_rgba(239,68,68,0.4)]">!</div>
  <h2 className="text-3xl font-semibold uppercase tracking-tight text-text-primary">System Breach Detected</h2>
  </div>
  
  <div className="space-y-6">
  <div className="p-6 bg-black/40 rounded-xl ed-500/10 shadow-inner group transition-colors hover:ed-500/30">
   <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-red-500/60 block mb-2 leading-none ">Error Signature</span>
   <p className="text-sm font-medium text-red-200 tracking-wide">{this.state.error?.toString()}</p>
  </div>
  
  <div className="space-y-3">
   <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-text-primary/20 block ml-1 leading-none ">Execution Stack Trace</span>
   <pre className="p-8 bg-black/60 rounded-2xl text-[10px] leading-relaxed overflow-x-auto text-text-primary/30 font-mono no-scrollbar h-[300px] shadow-2xl">
   {this.state.errorInfo?.componentStack}
   </pre>
  </div>
  </div>

  <div className="mt-10 pt-4 flex flex-col md:flex-row gap-4">
  <button 
  onClick={() => window.location.href = '/'}
  className="btn btn-outline flex-1 py-5 text-xs font-semibold uppercase tracking-wider opacity-50 hover:opacity-100"
  >
  Abort & Exit Hub
  </button>
  <button 
  onClick={() => window.location.reload()}
  className="btn btn-primary flex-1 py-5 text-xs font-semibold uppercase tracking-[0.4em] leading-none border-none bg-red-600 hover:bg-red-500 shadow-2xl shadow-red-900/50"
  >
  Force Reboot Protocol
  </button>
  </div>
  </div>
 </div>
 );
 }
 return this.props.children;
 }
}

export default ErrorBoundary;
