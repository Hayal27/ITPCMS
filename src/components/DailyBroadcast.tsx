import React, { useEffect, useLayoutEffect, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';

interface DailyBroadcastProps {
    roomUrl: string;
    onLeft?: () => void;
}

const DailyBroadcast: React.FC<DailyBroadcastProps> = ({ roomUrl, onLeft }) => {
    const [error, setError] = React.useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const callFrameRef = useRef<any>(null);
    const initializingRef = useRef(false);

    useEffect(() => {
        if (!containerRef.current || !roomUrl || initializingRef.current) return;

        let frame: any = null;
        let isCleaningUp = false;

        if (initializingRef.current) return;
        initializingRef.current = true;
        setError(null);

        const init = async () => {
            // First, destroy any existing instance that might be hanging around
            const existingInstance = DailyIframe.getCallInstance();
            if (existingInstance) {
                console.log('🎥 Daily: Existing instance found, destroying...');
                try {
                    await existingInstance.destroy();
                } catch (e) {
                    console.warn('🎥 Daily: Error destroying existing instance:', e);
                }
            }

            if (isCleaningUp) return;

            console.log('🎥 Initializing Daily broadcast for:', roomUrl);

            try {
                // Ensure container is empty
                if (containerRef.current) {
                    containerRef.current.innerHTML = '';
                }

                frame = DailyIframe.createFrame(containerRef.current!, {
                    iframeStyle: {
                        width: '100%',
                        height: '100%',
                        border: '0',
                        borderRadius: '12px'
                    },
                    showLeaveButton: true,
                    showFullscreenButton: true,
                });

                callFrameRef.current = frame;

                frame.on('left-meeting', () => {
                    console.log('👋 Left Daily broadcast');
                    onLeft?.();
                });

                frame.on('error', (e: any) => {
                    console.error('❌ Daily Frame Error:', e);
                });

                frame.on('camera-error', (e: any) => {
                    console.error('❌ Camera access error:', e);
                });

                await frame.join({
                    url: roomUrl,
                    userName: 'Broadcaster',
                    subscribeToTracksAutomatically: true
                });

                console.log('✅ Joined Daily room successfully');

                if (frame) {
                    await frame.setLocalVideo(true);
                    await frame.setLocalAudio(true);
                }

            } catch (error: any) {
                console.error('❌ Daily Broadcast Error during init/join:', error);
                setError(error.message || 'Failed to join broadcast. Please ensure the room exists.');
            } finally {
                initializingRef.current = false;
            }
        };

        init();

        return () => {
            console.log('🎥 Cleanup called for Daily broadcast');
            isCleaningUp = true;
            if (frame) {
                try {
                    frame.destroy();
                } catch (e) { }
                frame = null;
            }
        };
    }, [roomUrl]);

    return (
        <div className="relative w-full h-full min-h-[400px] bg-black rounded-xl overflow-hidden" style={{ aspectRatio: '16/9' }}>
            <div
                ref={containerRef}
                className="w-full h-full"
            />
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 text-white p-6 text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold mb-2">Broadcast Error</h3>
                    <p className="text-gray-300 max-w-md">{error}</p>
                    <p className="mt-4 text-sm text-gray-500">
                        Check if DAILY_API_KEY is configured in the backend .env file.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DailyBroadcast;
