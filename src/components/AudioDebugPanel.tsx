
import React, { useState, useEffect } from 'react';

interface AudioDebugPanelProps {
  logs: string[];
  status: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const AudioDebugPanel: React.FC<AudioDebugPanelProps> = ({ logs, status, audioRef }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    readyState: 0,
    networkState: 0,
    error: '',
    src: ''
  });

  useEffect(() => {
    const timer = setInterval(() => {
      if (audioRef.current) {
        setStats({
          readyState: audioRef.current.readyState,
          networkState: audioRef.current.networkState,
          error: audioRef.current.error ? `${audioRef.current.error.code}: ${audioRef.current.error.message}` : 'None',
          src: audioRef.current.src
        });
      }
    }, 500);
    return () => clearInterval(timer);
  }, [audioRef]);

  const copyLogs = () => {
    const text = `Status: ${status}\nStats: ${JSON.stringify(stats)}\nLogs:\n${logs.join('\n')}`;
    navigator.clipboard.writeText(text);
    alert('Logs copied to clipboard!');
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-[999] bg-black/80 text-white/50 text-[10px] px-2 py-1 rounded border border-white/10"
      >
        DEBUG AUDIO
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[999] w-64 h-80 bg-black/90 text-green-400 font-mono text-[9px] p-3 rounded-xl border border-white/20 shadow-2xl flex flex-col overflow-hidden backdrop-blur-md">
      <div className="flex justify-between items-center mb-2 pb-1 border-b border-white/10">
        <span>AUDIO DIAGNOSTICS</span>
        <div className="flex gap-2">
          <button onClick={copyLogs} className="hover:text-white">COPY</button>
          <button onClick={() => setIsOpen(false)} className="hover:text-white">HIDE</button>
        </div>
      </div>
      
      <div className="space-y-1 mb-2">
        <p>STATUS: <span className="text-white">{status.toUpperCase()}</span></p>
        <p>READY_STATE: {stats.readyState}</p>
        <p>NETWORK_STATE: {stats.networkState}</p>
        <p className="truncate">SRC: {stats.src}</p>
        <p className="text-red-400">ERROR: {stats.error}</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-0.5 border-t border-white/10 pt-2">
        {logs.map((log, i) => (
          <div key={i} className="opacity-80">[{log}]</div>
        ))}
      </div>
    </div>
  );
};

export default AudioDebugPanel;
