import { useState, useRef, useCallback } from 'react';
import { Camera, Video, Check, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface CameraCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File, type: 'photo' | 'video') => void;
}

export function CameraCapture({ isOpen, onClose, onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  
  const [isStreaming, setIsStreaming] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [activeTab, setActiveTab] = useState<'photo' | 'video'>('photo');
  const [isUploading, setIsUploading] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      const constraints = {
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: activeTab === 'video'
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsStreaming(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      toast.error('Unable to access camera. Please check permissions.');
    }
  }, [activeTab]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsStreaming(false);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(imageData);
      }
    }
  }, []);

  const startRecording = useCallback(() => {
    if (streamRef.current) {
      recordedChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(streamRef.current, {
        mimeType: 'video/webm;codecs=vp9,opus'
      });
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo(videoUrl);
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const retake = useCallback(() => {
    setCapturedImage(null);
    setRecordedVideo(null);
    setRecordingTime(0);
  }, []);

  const saveCapture = useCallback(async () => {
    setIsUploading(true);
    
    try {
      if (activeTab === 'photo' && capturedImage) {
        const response = await fetch(capturedImage);
        const blob = await response.blob();
        const file = new File([blob], `wedding-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file, 'photo');
        toast.success('Photo captured successfully!');
      } else if (activeTab === 'video' && recordedVideo) {
        const response = await fetch(recordedVideo);
        const blob = await response.blob();
        const file = new File([blob], `wedding-video-${Date.now()}.webm`, { type: 'video/webm' });
        onCapture(file, 'video');
        toast.success('Video recorded successfully!');
      }
      
      handleClose();
    } catch (error) {
      console.error('Error saving capture:', error);
      toast.error('Failed to save. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [activeTab, capturedImage, recordedVideo, onCapture]);

  const handleClose = useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setRecordedVideo(null);
    setIsRecording(false);
    setRecordingTime(0);
    onClose();
  }, [stopCamera, onClose]);

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'photo' | 'video');
    stopCamera();
    setCapturedImage(null);
    setRecordedVideo(null);
    setIsRecording(false);
    setRecordingTime(0);
  };

  // Recording timer effect
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const startRecordingTimer = useCallback(() => {
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  }, []);

  const stopRecordingTimer = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  }, []);

  // Start/stop timer with recording
  if (isRecording && !recordingTimerRef.current) {
    startRecordingTimer();
  } else if (!isRecording && recordingTimerRef.current) {
    stopRecordingTimer();
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-cream-50">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-center font-serif text-2xl text-olive-700">
            Capture a Memory
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mx-4 mt-2 w-auto">
            <TabsTrigger value="photo" className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Photo
            </TabsTrigger>
            <TabsTrigger value="video" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Video
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="photo" className="mt-0">
            <div className="relative aspect-[3/4] bg-black overflow-hidden">
              {!isStreaming && !capturedImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-olive-900/90">
                  <Camera className="w-16 h-16 text-gold-400 mb-4" />
                  <Button 
                    onClick={startCamera}
                    className="bg-gold-500 hover:bg-gold-600 text-white"
                  >
                    Open Camera
                  </Button>
                </div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover ${capturedImage ? 'hidden' : ''}`}
              />
              
              {capturedImage && (
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              
              <canvas ref={canvasRef} className="hidden" />
            </div>
            
            <div className="p-4 flex justify-center gap-4">
              {!capturedImage ? (
                isStreaming && (
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="rounded-full w-16 h-16 bg-blush-400 hover:bg-blush-500 border-4 border-white shadow-lg"
                  >
                    <div className="w-12 h-12 rounded-full bg-white" />
                  </Button>
                )
              ) : (
                <>
                  <Button
                    onClick={retake}
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Retake
                  </Button>
                  <Button
                    onClick={saveCapture}
                    size="lg"
                    className="rounded-full bg-gold-500 hover:bg-gold-600"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check className="w-5 h-5 mr-2" />
                    )}
                    Save
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="video" className="mt-0">
            <div className="relative aspect-[3/4] bg-black overflow-hidden">
              {!isStreaming && !recordedVideo && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-olive-900/90">
                  <Video className="w-16 h-16 text-gold-400 mb-4" />
                  <Button 
                    onClick={startCamera}
                    className="bg-gold-500 hover:bg-gold-600 text-white"
                  >
                    Open Camera
                  </Button>
                </div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={!recordedVideo}
                className={`absolute inset-0 w-full h-full object-cover ${recordedVideo ? 'hidden' : ''}`}
              />
              
              {recordedVideo && (
                <video
                  src={recordedVideo}
                  controls
                  className="absolute inset-0 w-full h-full object-cover"
                />
              )}
              
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/50 px-3 py-1 rounded-full">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-white text-sm font-mono">{formatTime(recordingTime)}</span>
                </div>
              )}
            </div>
            
            <div className="p-4 flex justify-center gap-4">
              {!recordedVideo ? (
                isStreaming && (
                  <Button
                    onClick={isRecording ? stopRecording : startRecording}
                    size="lg"
                    className={`rounded-full w-16 h-16 border-4 border-white shadow-lg ${
                      isRecording 
                        ? 'bg-red-500 hover:bg-red-600' 
                        : 'bg-blush-400 hover:bg-blush-500'
                    }`}
                  >
                    {isRecording ? (
                      <div className="w-6 h-6 rounded-sm bg-white" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white" />
                    )}
                  </Button>
                )
              ) : (
                <>
                  <Button
                    onClick={retake}
                    variant="outline"
                    size="lg"
                    className="rounded-full"
                  >
                    <RefreshCw className="w-5 h-5 mr-2" />
                    Retake
                  </Button>
                  <Button
                    onClick={saveCapture}
                    size="lg"
                    className="rounded-full bg-gold-500 hover:bg-gold-600"
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5 mr-2" />
                    )}
                    Upload
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
