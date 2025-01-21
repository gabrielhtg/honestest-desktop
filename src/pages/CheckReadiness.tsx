import { useEffect, useRef, useState } from 'react';
import {
  DrawingUtils,
  FaceLandmarker,
  FilesetResolver
  // @ts-ignore
} from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18';
import { Button } from '@/components/ui/button.tsx';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

export default function CheckReadiness() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [runningMode, setRunningMode] = useState<'IMAGE' | 'VIDEO'>('IMAGE');

  const createFaceLandmarker = async () => {
    const filesetResolver = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
    );
    const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        delegate: 'GPU'
      },
      outputFaceBlendshapes: true,
      runningMode,
      numFaces: 1
    });
    setFaceLandmarker(landmarker);
  };

  const enableWebcam = () => {
    if (!faceLandmarker) {
      console.log('FaceLandmarker not loaded yet.');
      return;
    }

    if (videoRef.current) {
      const constraints = { video: true };
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', () => {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (video && canvas) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
            }
            predictWebcam();
          });
        }
      });
    }
  };

  const predictWebcam = async () => {
    if (!faceLandmarker || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const drawingUtils = new DrawingUtils(ctx!);

    if (runningMode === 'IMAGE') {
      setRunningMode('VIDEO');
      await faceLandmarker.setOptions({ runningMode: 'VIDEO' });
    }

    const processFrame = async () => {
      const startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(video, startTimeMs);

      if (results.faceLandmarks && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        results.faceLandmarks.forEach((landmarks: any) => {
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
            color: '#C0C0C070',
            lineWidth: 1
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
            color: '#FF3030'
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, {
            color: '#FF3030'
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
            color: '#30FF30'
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, {
            color: '#30FF30'
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
            color: '#E0E0E0'
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
            color: '#E0E0E0'
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, {
            color: '#FF3030'
          });
          drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, {
            color: '#30FF30'
          });
        });
      }
      requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  useEffect(() => {
    createFaceLandmarker();
  }, []);

  useEffect(() => {
    if (faceLandmarker) {
      enableWebcam();
    }
  }, [faceLandmarker]);

  return (
    <div className={'w-screen h-screen flex items-center flex-col justify-center'}>
      <h1 className={'text-center font-bold text-3xl'}>Check Readiness</h1>

      <div className={'relative mt-5'}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={'absolute top-0 left-0 -z-50'}
        />
        <canvas ref={canvasRef} className={'z-10'} />
      </div>

      <Button className={'mt-3'} asChild>
        <Link to={'/main'}>
          <ArrowLeft /> Back
        </Link>
      </Button>
    </div>
  );
}
