import React from 'react';
import { useDJStore } from '@/store/useDJStore';
import { Music, Mic, Brain } from 'lucide-react';

export function Sidebar() {
  // Select individual primitive values to avoid infinite re-renders
  const agentThought = useDJStore((state) => state.agentThought);
  const coachMessage = useDJStore((state) => state.coachMessage);
  const trackHistory = useDJStore((state) => state.trackHistory);

  return (
    <div className="fixed bottom-0 right-0 h-screen w-80 bg-black/80 backdrop-blur-md border-l border-white/10 p-6 flex flex-col text-white z-40 pt-20">
      
      {/* Agent Reasoning Section */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-teal-400 font-bold mb-3 uppercase tracking-wider text-sm">
          <Brain size={16} />
          AIDA Core
        </h2>
        <div className="bg-neutral-900/50 p-4 rounded-lg border border-white/5 min-h-[100px]">
            {agentThought ? (
                <p className="text-sm text-gray-300 font-mono leading-relaxed">
                    {">"} {agentThought}
                </p>
            ) : (
                <p className="text-xs text-gray-600 italic">Waiting for input...</p>
            )}
        </div>
      </div>

      {/* Current Status */}
      <div className="mb-8">
         <h2 className="flex items-center gap-2 text-purple-400 font-bold mb-3 uppercase tracking-wider text-sm">
          <Mic size={16} />
          Live Status
        </h2>
        <div className="bg-neutral-900/50 p-3 rounded-lg border border-white/5">
            <p className="text-lg font-medium text-white mb-1">{coachMessage || "Ready"}</p>
        </div>
      </div>

      {/* Track History / Requests */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <h2 className="flex items-center gap-2 text-blue-400 font-bold mb-3 uppercase tracking-wider text-sm">
          <Music size={16} />
          Track History
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {trackHistory.length === 0 && (
                <div className="text-gray-600 text-sm italic p-2">No tracks requested yet.</div>
            )}
            {trackHistory.map((track, i) => (
                <div key={`${track.timestamp}-${i}`} className="bg-neutral-800/50 p-3 rounded hover:bg-neutral-700/50 transition-colors group">
                    <div className="font-medium text-sm text-white truncate">{track.title}</div>
                    <div className="text-xs text-gray-400 flex justify-between items-center mt-1">
                        <span>YouTube</span>
                        <a href={track.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300 opacity-0 group-hover:opacity-100 transition-opacity">
                            Link ↗
                        </a>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
