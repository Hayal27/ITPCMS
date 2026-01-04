import React, { useEffect, useRef, useState } from 'react';
import Peer from 'peerjs';

interface DirectViewerProps {
    eventId: string;
}

const DirectViewer: React.FC<DirectViewerProps> = ({ eventId }) => {
    const [status, setStatus] = useState<'connecting' | 'connected' | 'offline' | 'error'>('connecting');
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const peerRef = useRef<Peer | null>(null);

    const connectToBroadcast = () => {
        setStatus('connecting');
        setError(null);

        // Initialize Peer with custom server
        const peer = new Peer(`viewer-${Math.random().toString(36).substr(2, 9)}`, {
            host: window.location.hostname,
            port: 5005, // Match backend port
            path: '/peerjs',
            secure: window.location.protocol === 'https:',
            debug: 3
        });

        peer.on('open', (id) => {
            console.log('Viewer peer opened with ID:', id);

            // Try to call the admin
            const adminPeerId = `event-${eventId}-admin`;
            const call = peer.call(adminPeerId, new MediaStream()); // Send empty stream to trigger answer with admin's stream

            call.on('stream', (remoteStream) => {
                console.log('Received remote stream from admin');
                setStatus('connected');
                if (videoRef.current) {
                    videoRef.current.srcObject = remoteStream;
                }
            });

            call.on('error', (err) => {
                console.error('Call error:', err);
                setStatus('offline');
                setError('Stream is not live yet.');
            });

            call.on('close', () => {
                setStatus('offline');
            });
        });

        peer.on('error', (err) => {
            console.error('Peer connection error:', err);
            if (err.type === 'disconnected' || err.type === 'unavailable-id') {
                setStatus('offline');
                setError('Host is offline.');
            } else {
                setStatus('error');
                setError(`Connection failed: ${err.type}`);
            }
        });

        peerRef.current = peer;
    };

    useEffect(() => {
        connectToBroadcast();
        return () => {
            if (peerRef.current) {
                peerRef.current.destroy();
            }
        };
    }, [eventId]);

    return (
        <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl relative aspect-video group">
            <video
                ref={videoRef}
                autoPlay
                playsInline
                className={`w-full h-full object-cover transition-opacity duration-700 ${status === 'connected' ? 'opacity-100' : 'opacity-0'}`}
            />

            {status !== 'connected' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 p-6 text-center">
                    {status === 'connecting' && (
                        <>
                            <div className="relative w-16 h-16 mb-6">
                                <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                                <div className="absolute inset-2 rounded-full border-4 border-blue-400/10 border-b-blue-400 animate-spin-slow" />
                            </div>
                            <p className="text-slate-400 font-medium animate-pulse">Establishing connection...</p>
                        </>
                    )}

                    {status === 'offline' && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 text-slate-500 border border-slate-700">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                            </div>
                            <h4 className="text-white font-bold text-xl mb-1">Broadcast Offline</h4>
                            <p className="text-slate-500 text-sm mb-6">The broadcast hasn't started yet or has ended.</p>
                            <button
                                onClick={connectToBroadcast}
                                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-semibold transition-colors border border-slate-700"
                            >
                                Refresh Stream
                            </button>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4 text-red-500 border border-red-500/20">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h4 className="text-white font-bold text-xl mb-1">Connection Refused</h4>
                            <p className="text-red-400/80 text-sm mb-6">{error || 'Unable to join the broadcast.'}</p>
                            <button
                                onClick={connectToBroadcast}
                                className="px-5 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-red-500/20"
                            >
                                Try Again
                            </button>
                        </>
                    )}
                </div>
            )}

            {status === 'connected' && (
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 bg-red-600 rounded-lg shadow-lg z-20 animate-fade-in">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest">LIVE</span>
                </div>
            )}
        </div>
    );
};

export default DirectViewer;
