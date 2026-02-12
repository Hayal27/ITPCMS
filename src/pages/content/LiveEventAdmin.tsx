import React, { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import axios from 'axios';
import {
    FaVideo, FaPlus, FaEdit, FaTrash, FaCheck, FaTimes,
    FaCalendarAlt, FaClock, FaMapMarkerAlt, FaUsers, FaTag,
    FaSignal, FaStopCircle, FaRecordVinyl, FaChartLine, FaComments, FaArrowLeft,
    FaDesktop, FaCamera
} from 'react-icons/fa';
import DailyBroadcast from '../../components/DailyBroadcast';
import DirectBroadcast from '../../components/streaming/DirectBroadcast';
import { io, Socket } from 'socket.io-client';

import { BACKEND_URL, fixImageUrl } from '../../services/apiService';

const API_BASE = `${BACKEND_URL}/api/live-events`;

interface LiveEvent {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    event_date: string;
    start_time: string;
    end_time: string;
    location: string;
    stream_url: string;
    stream_poster: string;
    status: 'draft' | 'published' | 'live' | 'ended';
    is_streaming: boolean;
    is_recording: boolean;
    estimated_viewers?: number;
    signaling_data?: string;
}

const LiveEventAdmin: React.FC = () => {
    const [events, setEvents] = useState<LiveEvent[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState<LiveEvent | null>(null);
    const [activeControlRoom, setActiveControlRoom] = useState<LiveEvent | null>(null);

    // Media Capture & WebRTC State
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [captureType, setCaptureType] = useState<'none' | 'camera' | 'screen'>('none');
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const peerConnections = useRef<Record<string, RTCPeerConnection>>({});
    const [hasInitiatedBroadcast, setHasInitiatedBroadcast] = useState(false);
    const [broadcastMethod, setBroadcastMethod] = useState<'direct' | 'daily'>('direct');
    const offerBroadcastInterval = useRef<number | null>(null);
    const socketRef = useRef<Socket | null>(null);
    const [realViewerCount, setRealViewerCount] = useState(0);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [adminChatMessage, setAdminChatMessage] = useState('');

    const [formData, setFormData] = useState<Partial<LiveEvent>>({
        title: '',
        subtitle: '',
        description: '',
        event_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '17:00',
        location: '',
        stream_url: '',
        status: 'draft'
    });

    // Initial Fetch
    useEffect(() => {
        fetchEvents();
    }, []);

    // Polling effect
    useEffect(() => {
        if (!activeControlRoom) return;

        const poll = setInterval(() => {
            fetchEvents();
        }, 5000); // Polling every 5 seconds is safer

        return () => clearInterval(poll);
    }, [activeControlRoom?.id]); // Only re-run if we switch rooms

    useEffect(() => {
        if (!activeControlRoom) {
            if (socketRef.current) socketRef.current.disconnect();
            return;
        }

        const socket = io(BACKEND_URL);
        socketRef.current = socket;

        socket.emit('join-event', {
            eventId: activeControlRoom.id,
            username: '👑 Admin'
        });

        socket.on('viewer-count', (count: number) => {
            setRealViewerCount(count);
        });

        socket.on('new-message', (msg: any) => {
            setChatMessages(prev => [...prev.slice(-50), msg]);
        });

        return () => {
            socket.disconnect();
        };
    }, [activeControlRoom?.id]);

    useEffect(() => {
        const attachStream = () => {
            if (localVideoRef.current && localStream) {
                console.log('🎥 Admin: Attaching localStream to preview video');
                localVideoRef.current.srcObject = localStream;
            }
        };

        attachStream();

        // Also check on a small delay in case component was still mounting
        const timer = setTimeout(attachStream, 100);

        // Auto-start broadcasting if streaming is ON and we have a media stream (Legacy WebRTC)
        if (activeControlRoom?.is_streaming && localStream && !hasInitiatedBroadcast) {
            console.log("🚀 Admin: Stream is active and media is ready. Starting broadcast...");
            // Non-Daily backup
            if (activeControlRoom.stream_url && !activeControlRoom.stream_url.includes('daily.co')) {
                startBroadcasting(activeControlRoom);
            }
        }

        return () => clearTimeout(timer);
    }, [localStream, activeControlRoom?.is_streaming, activeControlRoom?.stream_url]);

    const resetBroadcast = () => {
        setHasInitiatedBroadcast(false);
        if (peerConnections.current['admin_broadcast']) {
            peerConnections.current['admin_broadcast'].close();
            delete peerConnections.current['admin_broadcast'];
        }
    };

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await axios.get(API_BASE);
            setEvents(res.data);
            if (activeControlRoom) {
                const refreshed = res.data.find((e: LiveEvent) => e.id === activeControlRoom.id);
                if (refreshed) {
                    // Only update if something actually changed to avoid re-renders
                    if (JSON.stringify(refreshed) !== JSON.stringify(activeControlRoom)) {
                        setActiveControlRoom(refreshed);
                    }
                    // Check for signaling answers - Only for legacy WebRTC
                    if (refreshed.stream_url && !refreshed.stream_url.includes('daily.co')) {
                        handleSignalingData(refreshed);
                    }
                }
            }
        } catch (err) {
            setError('Failed to fetch events');
        } finally {
            setLoading(false);
        }
    };

    const handleSignalingData = async (event: LiveEvent) => {
        if (!event.signaling_data) {
            console.log('📡 Admin: No signaling data found');
            return;
        }
        try {
            const data = JSON.parse(event.signaling_data);
            console.log('📡 Admin: Found signaling data type:', data.type, 'from:', data.from);

            if (data.type === 'answer') {
                const pc = peerConnections.current['admin_broadcast'];
                console.log('📡 Admin: Processing answer. PC exists?', !!pc);
                console.log('📡 Admin: PC signaling state:', pc?.signalingState);

                if (pc && pc.signalingState === 'have-local-offer') {
                    console.log('✅ Viewer connected! Starting broadcast transmission...');
                    await pc.setRemoteDescription(new RTCSessionDescription(data.sdp));
                    console.log('✅ Remote description set. WebRTC connection should be active!');

                    // Stop re-broadcasting offers since viewer is connected
                    if (offerBroadcastInterval.current) {
                        clearInterval(offerBroadcastInterval.current);
                        offerBroadcastInterval.current = null;
                        console.log('🛑 Stopped offer re-broadcasting (viewer connected)');
                    }
                } else if (pc) {
                    console.warn('⚠️ Cannot process answer. Wrong signaling state:', pc.signalingState);
                }
            }
        } catch (e) {
            console.error('📡 Admin: Error handling signaling data:', e);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (editingEvent) {
                await axios.put(`${API_BASE}/${editingEvent.id}`, formData);
                setSuccess('Event updated successfully');
            } else {
                await axios.post(API_BASE, formData);
                setSuccess('Event created successfully');
            }
            setShowForm(false);
            setEditingEvent(null);
            fetchEvents();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    const toggleStream = async (event: LiveEvent) => {
        const newState = !event.is_streaming;
        try {
            const res = await axios.post(`${API_BASE}/${event.id}/stream`, { state: newState });

            if (newState) {
                // If we have a local preview running, stop it so Daily can take the camera
                if (localStream) {
                    stopCapture();
                }

                // If API returned a Daily room URL, update locally for immediate transition
                if (res.data.daily_room_url) {
                    setActiveControlRoom(prev => prev ? {
                        ...prev,
                        is_streaming: true,
                        status: 'live',
                        stream_url: res.data.daily_room_url
                    } : null);
                }
            } else {
                resetBroadcast();
            }

            setSuccess(newState ? 'Stream started live!' : 'Stream stopped.');
            fetchEvents(); // Refresh full list
        } catch (err) {
            setError('Failed to toggle stream state');
        }
    };

    const startBroadcasting = async (event: LiveEvent) => {
        if (hasInitiatedBroadcast) return;
        setHasInitiatedBroadcast(true);
        console.log("Initializing WebRTC PeerConnection for broadcast ID:", event.id);

        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                {
                    urls: 'turn:openrelay.metered.ca:80',
                    username: 'openrelayproject',
                    credential: 'openrelayproject'
                }
            ]
        });
        peerConnections.current['admin_broadcast'] = pc;

        if (!localStream) {
            console.error("Cannot broadcast: localStream is missing");
            setHasInitiatedBroadcast(false);
            return;
        }

        localStream.getTracks().forEach(track => {
            console.log("Adding track to broadcast:", track.kind);
            pc.addTrack(track, localStream);
        });

        pc.onicegatheringstatechange = async () => {
            console.log("ICE gathering state:", pc.iceGatheringState);
            if (pc.iceGatheringState === 'complete') {
                const offer = pc.localDescription;
                console.log("ICE gathering complete. Sending offer to signaling hub...");
                try {
                    await axios.post(`${API_BASE}/${event.id}/signaling`, {
                        signaling_data: JSON.stringify({ type: 'offer', sdp: offer, from: 'admin' })
                    });
                    console.log("Offer posted successfully.");

                    // Re-post offer every 5 seconds so new viewers always find a fresh offer
                    offerBroadcastInterval.current = setInterval(async () => {
                        if (peerConnections.current['admin_broadcast']) {
                            console.log("📡 Re-broadcasting offer for new viewers...");
                            try {
                                await axios.post(`${API_BASE}/${event.id}/signaling`, {
                                    signaling_data: JSON.stringify({ type: 'offer', sdp: pc.localDescription, from: 'admin' })
                                });
                            } catch (err) {
                                console.error("Re-broadcast failed:", err);
                            }
                        } else {
                            if (offerBroadcastInterval.current) {
                                clearInterval(offerBroadcastInterval.current);
                                offerBroadcastInterval.current = null;
                            }
                        }
                    }, 5000) as unknown as number;

                } catch (err) {
                    console.error("Failed to post signaling offer:", err);
                    setHasInitiatedBroadcast(false);
                }
            }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
    };

    const toggleRecording = async (event: LiveEvent) => {
        const newState = !event.is_recording;
        try {
            await axios.post(`${API_BASE}/${event.id}/record`, { state: newState });
            setSuccess(newState ? 'Recording started.' : 'Recording stopped.');
            fetchEvents();
        } catch (err) {
            setError('Failed to toggle recording');
        }
    };

    const deleteEvent = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            await axios.delete(`${API_BASE}/${id}`);
            setSuccess('Event deleted successfully');
            fetchEvents();
        } catch (err) {
            setError('Failed to delete event');
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            setCaptureType('camera');
            setSuccess('Camera capture started');
        } catch (err) {
            setError('Could not access camera/mic');
        }
    };

    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
            setLocalStream(stream);
            setCaptureType('screen');
            setSuccess('Screen sharing started');
            stream.getVideoTracks()[0].onended = () => stopCapture();
        } catch (err) {
            setError('Screen sharing cancelled or failed');
        }
    };

    const stopCapture = () => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
            setLocalStream(null);
            setCaptureType('none');
            setSuccess('Capture stopped');
        }
    };

    const inputClass = "w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none";
    const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

    if (activeControlRoom) {
        return (
            <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in slide-in-from-right duration-500 pb-20">
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => { stopCapture(); setActiveControlRoom(null); }}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 font-medium transition"
                    >
                        <FaArrowLeft /> Exit Control Room
                    </button>
                    <div className="flex items-center gap-4">
                        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase ${activeControlRoom.is_streaming ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-200 text-gray-600'}`}>
                            <FaSignal /> {activeControlRoom.is_streaming ? 'ON AIR' : 'OFFLINE'}
                        </span>
                        {activeControlRoom.is_recording && (
                            <span className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-600">
                                <FaRecordVinyl className="animate-spin" /> RECORDING
                            </span>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-black aspect-video rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center relative group bg-gradient-to-br from-slate-900 to-black">
                            {activeControlRoom.stream_url && activeControlRoom.stream_url.includes('daily.co') && broadcastMethod === 'daily' ? (
                                <DailyBroadcast
                                    roomUrl={activeControlRoom.stream_url}
                                    onLeft={() => {
                                        console.log('Left Daily room');
                                        toggleStream(activeControlRoom);
                                    }}
                                />
                            ) : localStream && broadcastMethod === 'direct' ? (
                                <video
                                    ref={localVideoRef}
                                    autoPlay
                                    muted
                                    className="w-full h-full object-contain"
                                />
                            ) : activeControlRoom.stream_url && !activeControlRoom.stream_url.includes('daily.co') ? (
                                <iframe
                                    src={activeControlRoom.stream_url.replace('watch?v=', 'embed/')}
                                    className="w-full h-full border-0"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="text-gray-500 text-center">
                                    <FaVideo size={48} className="mx-auto mb-4 opacity-20" />
                                    <p className="font-bold">Self-Hosted Station</p>
                                    <p className="text-xs opacity-60">Ready to go live on your own server.</p>
                                </div>
                            )}

                            {/* Direct Broadcast Overlay */}
                            {broadcastMethod === 'direct' && (
                                <div className="absolute inset-0 z-20">
                                    <DirectBroadcast
                                        eventId={activeControlRoom.id.toString()}
                                        onStatusChange={(status) => {
                                            if (status === 'broadcasting' && !activeControlRoom.is_streaming) {
                                                toggleStream(activeControlRoom);
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            {captureType !== 'none' && (
                                <div className="absolute top-4 right-4 group-hover:opacity-100 transition-opacity">
                                    <button onClick={stopCapture} className="bg-red-600 text-white p-3 rounded-full shadow-lg hover:bg-red-700 transition" title="Stop Capture">
                                        <FaStopCircle />
                                    </button>
                                </div>
                            )}

                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-8 flex items-end justify-between transition-all duration-300">
                                <div>
                                    <h2 className="text-white font-black text-2xl">{activeControlRoom.title}</h2>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className={`w-2 h-2 rounded-full ${activeControlRoom.is_streaming ? 'bg-red-500' : 'bg-gray-500'}`} />
                                        <p className="text-white/60 text-xs font-bold tracking-widest uppercase">
                                            {activeControlRoom.is_streaming ? 'Global Broadcast Active' : 'Offline'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <div className="flex bg-white/10 backdrop-blur-md p-1 rounded-2xl border border-white/10 mr-4">
                                        <button
                                            onClick={() => setBroadcastMethod('direct')}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${broadcastMethod === 'direct' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                                        >
                                            Self-Hosted
                                        </button>
                                        <button
                                            onClick={() => setBroadcastMethod('daily')}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${broadcastMethod === 'daily' ? 'bg-blue-600 text-white shadow-lg' : 'text-white/60 hover:text-white'}`}
                                        >
                                            Daily.co
                                        </button>
                                    </div>
                                    <button
                                        onClick={startCamera}
                                        className={`p-4 rounded-2xl transition shadow-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest ${captureType === 'camera' ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10'}`}
                                    >
                                        <FaCamera size={16} /> {captureType === 'camera' ? 'Camera Live' : 'Camera'}
                                    </button>
                                    <button
                                        onClick={startScreenShare}
                                        className={`p-4 rounded-2xl transition shadow-xl flex items-center gap-2 font-black text-xs uppercase tracking-widest ${captureType === 'screen' ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-md border border-white/10'}`}
                                    >
                                        <FaDesktop size={16} /> {captureType === 'screen' ? 'Sharing' : 'Screen'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg">
                                    <FaSignal className="text-blue-500" /> Broadcast Station
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    <button
                                        onClick={() => toggleStream(activeControlRoom)}
                                        className={`px-8 py-4 rounded-[24px] font-black flex items-center gap-2 transition shadow-xl grow justify-center ${activeControlRoom.is_streaming
                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            : 'bg-red-600 text-white hover:bg-red-700 shadow-red-500/30'
                                            }`}
                                    >
                                        {activeControlRoom.is_streaming ? <><FaStopCircle /> STOP BROADCAST</> : <><FaSignal /> START BROADCAST</>}
                                    </button>
                                    <button
                                        onClick={() => toggleRecording(activeControlRoom)}
                                        className={`px-8 py-4 rounded-[24px] font-black flex items-center gap-2 transition shadow-xl grow justify-center ${activeControlRoom.is_recording
                                            ? 'bg-orange-100 text-orange-600 hover:bg-orange-200'
                                            : 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-500/30'
                                            }`}
                                    >
                                        <FaRecordVinyl className={activeControlRoom.is_recording ? 'animate-spin' : ''} />
                                        {activeControlRoom.is_recording ? 'STOP RECORD' : 'REC TO HUB'}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-bold dark:text-white flex items-center gap-2 text-lg">
                                    <FaChartLine className="text-green-500" /> Session Health
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Live Viewers</div>
                                        <div className="text-3xl font-black dark:text-white">{activeControlRoom.is_streaming ? realViewerCount : '0'}</div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <div className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Stream Uptime</div>
                                        <div className="text-3xl font-black dark:text-white tracking-tight">{activeControlRoom.is_streaming ? '01:22:04' : '--:--'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 flex flex-col h-[600px]">
                            <div className="p-6 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
                                <h3 className="font-black text-sm dark:text-white flex items-center gap-2 uppercase tracking-tight">
                                    <FaComments className="text-purple-500" /> Chat Moderator
                                </h3>
                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-black animate-pulse">LIVE</span>
                            </div>
                            <div className="flex-grow overflow-y-auto p-6 space-y-4">
                                {chatMessages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center opacity-20">
                                        <FaComments size={40} />
                                        <p className="text-xs font-bold uppercase mt-2">No active messages</p>
                                    </div>
                                ) : (
                                    chatMessages.map(msg => (
                                        <div key={msg.id} className={`flex gap-3 ${msg.author === '👑 Admin' ? 'justify-end' : ''}`}>
                                            {msg.author !== '👑 Admin' && (
                                                <div className="w-8 h-8 rounded-xl bg-gray-200 flex-shrink-0 flex items-center justify-center text-[10px] font-black uppercase">
                                                    {msg.author.substring(0, 2)}
                                                </div>
                                            )}
                                            <div className={`${msg.author === '👑 Admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-slate-800'} p-3 rounded-2xl border border-gray-200 dark:border-gray-700 max-w-[80%]`}>
                                                <div className={`text-[10px] font-black mb-0.5 ${msg.author === '👑 Admin' ? 'text-blue-100' : 'text-blue-600'}`}>
                                                    {msg.author}
                                                </div>
                                                <div className="text-xs font-medium">{msg.text}</div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!adminChatMessage.trim()) return;
                                    socketRef.current?.emit('send-message', {
                                        eventId: activeControlRoom.id,
                                        text: adminChatMessage
                                    });
                                    setAdminChatMessage('');
                                }}
                                className="p-4 border-t dark:border-gray-800 bg-gray-50 dark:bg-slate-800/50"
                            >
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={adminChatMessage}
                                        onChange={(e) => setAdminChatMessage(e.target.value)}
                                        placeholder="Broadcast moderator message..."
                                        className="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-inner"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-2 top-2 bg-blue-600 text-white px-4 py-1.5 rounded-xl font-bold text-xs ring-2 ring-white hover:bg-blue-700 transition"
                                    >
                                        SEND
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black dark:text-white flex items-center gap-3 tracking-tight">
                        <div className="bg-blue-600 p-2.5 rounded-2xl shadow-xl shadow-blue-500/20">
                            <FaVideo className="text-white" />
                        </div>
                        Live Event Hub
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 font-medium">Broadcast directly to your team from any device.</p>
                </div>
                <button
                    onClick={() => {
                        setEditingEvent(null);
                        setFormData({
                            title: '',
                            subtitle: '',
                            event_date: new Date().toISOString().split('T')[0],
                            start_time: '09:00',
                            end_time: '17:00',
                            status: 'draft'
                        });
                        setShowForm(true);
                    }}
                    className="bg-slate-900 text-white px-8 py-3 rounded-2xl flex items-center gap-2 hover:bg-black transition shadow-2xl font-black tracking-tight"
                >
                    <FaPlus /> CREATE SESSION
                </button>
            </div>

            {error && <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-3xl mb-8 flex justify-between items-center font-bold shadow-sm animate-in fade-in slide-in-from-top-4"><span>{error}</span><button onClick={() => setError(null)}>&times;</button></div>}
            {success && <div className="bg-green-100/50 border border-green-200 text-green-700 px-6 py-4 rounded-3xl mb-8 flex justify-between items-center font-bold shadow-sm animate-in fade-in slide-in-from-top-4"><span>{success}</span><button onClick={() => setSuccess(null)}>&times;</button></div>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {events.map(event => (
                    <div key={event.id} className="bg-white dark:bg-slate-900 rounded-[40px] overflow-hidden shadow-xl border border-gray-100 dark:border-gray-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group relative">
                        <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                            {event.stream_poster ? (
                                <img src={fixImageUrl(event.stream_poster) || ''} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={event.title} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-950">
                                    <FaVideo size={40} className="text-slate-200 dark:text-slate-700 group-hover:rotate-12 transition-transform" />
                                </div>
                            )}
                            <div className="absolute top-6 left-6">
                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] flex items-center gap-2 shadow-xl ${event.status === 'live' ? 'bg-red-600 text-white animate-pulse' :
                                    event.status === 'ended' ? 'bg-slate-900 text-white' :
                                        event.status === 'published' ? 'bg-blue-600 text-white' :
                                            'bg-amber-400 text-slate-900'
                                    }`}>
                                    {event.status === 'live' && <span className="w-2 h-2 bg-white rounded-full" />}
                                    {event.status}
                                </span>
                            </div>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <h3 className="font-black text-xl dark:text-white line-clamp-1 tracking-tight">{event.title}</h3>
                                <div className="flex items-center gap-4 mt-3 text-xs font-bold text-slate-400">
                                    <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-blue-500" /> {event.event_date.split('T')[0]}</span>
                                    <span className="flex items-center gap-1.5"><FaClock className="text-blue-500" /> {event.start_time}</span>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        stopCapture();
                                        setActiveControlRoom(event);
                                    }}
                                    className="flex-grow bg-slate-900 hover:bg-black text-white py-4 rounded-3xl text-sm font-black transition-all shadow-xl shadow-slate-900/10 flex items-center justify-center gap-2"
                                >
                                    <FaSignal /> CONTROL
                                </button>
                                <button
                                    onClick={() => {
                                        setEditingEvent(event);
                                        setFormData({
                                            ...event,
                                            event_date: event.event_date.split('T')[0]
                                        });
                                        setShowForm(true);
                                    }}
                                    className="p-4 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-2xl transition-all"
                                >
                                    <FaEdit size={18} />
                                </button>
                                <button
                                    onClick={() => deleteEvent(event.id)}
                                    className="p-4 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all"
                                >
                                    <FaTrash size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-6">
                    <div className="bg-white dark:bg-slate-900 rounded-[40px] w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border border-white/10">
                        <div className="p-8 border-b dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/20">
                            <h2 className="text-2xl font-black dark:text-white flex items-center gap-3">
                                {editingEvent ? <FaEdit className="text-blue-600" /> : <FaPlus className="text-green-600" />}
                                {editingEvent ? 'UPDATE SESSION' : 'NEW SESSION'}
                            </h2>
                            <button onClick={() => setShowForm(false)} className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition"><FaTimes /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex-grow overflow-y-auto p-10 space-y-8">
                            <div className="space-y-2">
                                <label className={labelClass + " uppercase tracking-widest text-[10px] font-black"}>Session Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} className={inputClass + " text-lg font-bold"} required placeholder="Final Quarter Strategy Call" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className={labelClass + " uppercase tracking-widest text-[10px] font-black"}>Date</label>
                                    <input type="date" name="event_date" value={formData.event_date} onChange={handleInputChange} className={inputClass} required />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass + " uppercase tracking-widest text-[10px] font-black"}>Status</label>
                                    <select name="status" value={formData.status} onChange={handleInputChange} className={inputClass}>
                                        <option value="draft">Draft (Private)</option>
                                        <option value="published">Published (Upcoming)</option>
                                        <option value="live">Live Now</option>
                                        <option value="ended">Past Event</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className={labelClass + " uppercase tracking-widest text-[10px] font-black"}>Start</label>
                                    <input type="time" name="start_time" value={formData.start_time} onChange={handleInputChange} className={inputClass} required />
                                </div>
                                <div className="space-y-2">
                                    <label className={labelClass + " uppercase tracking-widest text-[10px] font-black"}>End</label>
                                    <input type="time" name="end_time" value={formData.end_time} onChange={handleInputChange} className={inputClass} required />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className={labelClass + " uppercase tracking-widest text-[10px] font-black"}>Stream URL (YouTube/Direct)</label>
                                <input type="url" name="stream_url" value={formData.stream_url} onChange={handleInputChange} className={inputClass} placeholder="Keep empty for Direct Browser Streaming" />
                            </div>

                            <div className="space-y-2">
                                <label className={labelClass + " uppercase tracking-widest text-[10px] font-black"}>Summary</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} className={inputClass} rows={4} placeholder="Full agenda details..." />
                            </div>
                        </form>

                        <div className="p-8 border-t dark:border-gray-800 flex justify-end gap-4 bg-gray-50/50 dark:bg-slate-800/20">
                            <button type="button" onClick={() => setShowForm(false)} className="px-8 py-3 text-slate-500 font-black hover:text-slate-800 transition uppercase tracking-widest text-xs">Cancel</button>
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-slate-900 text-white px-10 py-4 rounded-[20px] font-black hover:bg-black transition shadow-2xl disabled:opacity-50 uppercase tracking-widest text-xs"
                            >
                                {loading ? 'SAVING...' : 'SAVE SESSION'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LiveEventAdmin;
