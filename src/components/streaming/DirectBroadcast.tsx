import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

interface DirectBroadcastProps {
    eventId: string;
    onStatusChange?: (status: 'idle' | 'broadcasting' | 'error') => void;
}

const DirectBroadcast: React.FC<DirectBroadcastProps> = ({ eventId, onStatusChange }) => {
    const [peerId, setPeerId] = useState<string | null>(null);
    const [isBroadcasting, setIsBroadcasting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewersCount, setViewersCount] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const connectionsRef = useRef<Set<any>>(new Set());

    const startBroadcast = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 1280, height: 720 },
                audio: true
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            // Initialize Peer with custom server
            if (peerRef.current) {
                peerRef.current.destroy();
            }

            const peerIdToUse = `event-${eventId}-admin`;
            console.log('📡 Admin: Registering as host:', peerIdToUse);

            const peer = new Peer(peerIdToUse, {
                host: window.location.hostname,
                port: 5001,
                path: '/peerjs',
                secure: window.location.protocol === 'https:',
                debug: 1,
                config: {
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                }
            });

            peer.on('open', (id) => {
                console.log('📡 Admin: ✅ Registered successfully on server with ID:', id);
                setPeerId(id);
                setIsBroadcasting(true);
                onStatusChange?.('broadcasting');
            });

            // 1. Handle Signal Handshake
            peer.on('connection', (conn) => {
                console.log('📡 Admin: Viewer connected:', conn.peer);

                conn.on('data', (data: any) => {
                    if (data && data.type === 'REQUEST_STREAM') {
                        console.log('📡 Admin: 🎥 Received video request from:', conn.peer);

                        if (streamRef.current && streamRef.current.active) {
                            console.log('📡 Admin: 🚀 Calling viewer back with video...');
                            const call = peer.call(conn.peer, streamRef.current);
                            connectionsRef.current.add(call);
                            setViewersCount(prev => prev + 1);
                        } else {
                            console.warn('📡 Admin: ❌ Stream not ready yet.');
                            conn.send({ type: 'NOT_READY' });
                        }
                    }
                });
            });

            // 2. Also handle direct calls (legacy support)
            peer.on('call', (call) => {
                console.log('📡 Admin: 🎥 Direct video request from:', call.peer);
                if (streamRef.current) call.answer(streamRef.current);
            });

            peer.on('error', (err) => {
                console.error('Peer error:', err);
                setError(`Connection error: ${err.type}`);
                onStatusChange?.('error');
            });

            peerRef.current = peer;
        } catch (err: any) {
            console.error('Failed to start broadcast:', err);
            setError(err.message || 'Could not access camera/microphone');
            onStatusChange?.('error');
        }
    };

    const stopBroadcast = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
        }
        setIsBroadcasting(false);
        setPeerId(null);
        setViewersCount(0);
        onStatusChange?.('idle');
    };

    useEffect(() => {
        return () => {
            stopBroadcast();
        };
    }, []);

    return (
        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${isBroadcasting ? 'bg-red-500' : 'bg-slate-600'}`} />
                    <h3 className="text-white font-semibold">Self-Hosted Broadcast</h3>
                </div>
                {isBroadcasting && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-bold border border-blue-500/20">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                        </svg>
                        {viewersCount} Viewers
                    </div>
                )}
            </div>

            {/* Video Area */}
            <div className="relative aspect-video bg-black flex items-center justify-center group">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />

                {!isBroadcasting && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/80 backdrop-blur-sm transition-all group-hover:bg-slate-900/60">
                        <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-6 shadow-xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-slate-300 font-medium text-lg mb-8 text-center max-w-xs">Ready to start your self-hosted broadcast? No 3rd party APIs required.</p>
                        <button
                            onClick={startBroadcast}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/40 transition-all transform active:scale-95"
                        >
                            Start Broadcasting
                        </button>
                    </div>
                )}

                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-900/90 backdrop-blur-sm p-6 text-center">
                        <svg className="w-16 h-16 text-white mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h4 className="text-white font-bold text-xl mb-2">Broadcast Error</h4>
                        <p className="text-red-100 mb-6 max-w-sm">{error}</p>
                        <button
                            onClick={startBroadcast}
                            className="px-6 py-2 bg-white text-red-600 rounded-lg font-bold hover:bg-red-50 transition-colors"
                        >
                            Retry Connection
                        </button>
                    </div>
                )}
            </div>

            {/* Footer Controls */}
            {isBroadcasting && (
                <div className="p-6 bg-slate-800/80 border-t border-slate-700 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Server Source</p>
                        <code className="text-blue-400 font-mono text-sm">{peerId}</code>
                    </div>
                    <button
                        onClick={stopBroadcast}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-600/20 transition-all flex items-center gap-2"
                    >
                        <div className="w-2 h-2 bg-white rounded-full" />
                        Stop Live
                    </button>
                </div>
            )}
        </div>
    );
};

export default DirectBroadcast;
