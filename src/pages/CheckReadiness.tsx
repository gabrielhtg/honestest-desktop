import { useCallback, useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
// import {
//   DrawingUtils,
//   FaceLandmarker,
//   FilesetResolver
//   // @ts-ignore
// } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18';
import { Button } from '@/components/ui/button.tsx';
import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue
// } from '@/components/ui/select';

export default function CheckReadiness() {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [runningMode, setRunningMode] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  let lastScreenshotTime: number | null = null;

  // state untuk menyimpan data proctoring
  const [movementDescription, setMovementDescription] = useState('');
  const [banyakOrang, setBanyakOrang] = useState('');

  const createFaceLandmarker = async () => {
    // @ts-ignore
    const filesetResolver = await FilesetResolver.forVisionTasks(
      // 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      `./mediapipe/wasm`
    );

    const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        // modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        modelAssetPath: './face_landmarker.task',
        delegate: 'GPU'
      },
      outputFaceBlendshapes: true,
      runningMode,
      numFaces: 3
    });
    setFaceLandmarker(landmarker);
  };

  const detectMovement = (faceBlendShapes: any) => {
    if (faceBlendShapes.categories[16].score > 0.7 && faceBlendShapes.categories[13].score > 0.7) {
      setMovementDescription('Melirik ke kanan');
      capture();
    }

    if (faceBlendShapes.categories[15].score > 0.7 && faceBlendShapes.categories[14].score > 0.7) {
      setMovementDescription('Melirik ke kiri');
      capture();
    }

    if (
      faceBlendShapes.categories[11].score > 0.82 &&
      faceBlendShapes.categories[12].score > 0.82
    ) {
      setMovementDescription('Melirik ke bawah');
      capture();
    }

    if (faceBlendShapes.categories[17].score > 0.2 && faceBlendShapes.categories[18].score > 0.2) {
      setMovementDescription('Melirik ke atas');
      capture();
    }
  };

  const getBanyakOrangMessage = (banyakOrang: number) => {
    if (banyakOrang > 0) {
      return `Terdeteksi ada ${banyakOrang} di dalam frame.`;
    } else {
      capture();
      return 'Tidak ada orang terdeteksi.';
    }
  };

  const predictWebcam = async () => {
    if (!faceLandmarker || !webcamRef.current || !canvasRef.current) return;

    const video = webcamRef.current.video as HTMLVideoElement;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // const drawingUtils = new DrawingUtils(ctx!);

    if (runningMode === 'IMAGE') {
      setRunningMode('VIDEO');
      await faceLandmarker.setOptions({ runningMode: 'VIDEO' });
    }

    const processFrame = async () => {
      const startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(video, startTimeMs);

      // mengembalikan message banyak orang terdeteksi.
      setBanyakOrang(getBanyakOrangMessage(results.faceLandmarks.length));

      if (results.faceLandmarks && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // results.faceLandmarks.forEach((landmarks: any) => {
        results.faceLandmarks.forEach(() => {
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
          //   color: '#C0C0C070',
          //   lineWidth: 1
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
          //   color: '#FF3030'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, {
          //   color: '#FF3030'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
          //   color: '#30FF30'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, {
          //   color: '#30FF30'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
          //   color: '#E0E0E0'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
          //   color: '#E0E0E0'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, {
          //   color: '#FF3030'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, {
          //   color: '#30FF30'
          // });
          detectMovement(results.faceBlendshapes[0]);
        });
        // detectMovement(results.faceBlendshapes[0]);
      }

      // console.log(results);
      requestAnimationFrame(processFrame);
    };

    processFrame().then();
  };

  const saveImage = async (image: any) => {
    // @ts-ignore
    const saveImageResponse = await window.electron.save_image(image);
  };

  const capture = useCallback(() => {
    console.log(lastScreenshotTime);
    if (lastScreenshotTime == null) {
      lastScreenshotTime = new Date().getTime();
      const imageSrc = webcamRef.current!.getScreenshot();
      saveImage(imageSrc).then();
    } else {
      if (new Date().getTime() - lastScreenshotTime > 3000) {
        lastScreenshotTime = new Date().getTime();
        const imageSrc = webcamRef.current!.getScreenshot();
        saveImage(imageSrc).then();
      }
    }
  }, [webcamRef]);

  useEffect(() => {
    createFaceLandmarker().then();
  }, []);

  useEffect(() => {
    if (faceLandmarker && webcamRef.current) {
      const video = webcamRef.current.video as HTMLVideoElement;
      video.addEventListener('loadeddata', () => {
        if (canvasRef.current) {
          canvasRef.current.width = video.videoWidth;
          canvasRef.current.height = video.videoHeight;
        }
        predictWebcam().then();
      });
    }
  }, [faceLandmarker]);

  return (
    <div className={'w-screen h-screen flex items-center flex-col justify-center'}>
      <h1 className={'text-center font-bold text-3xl'}>Check Readiness</h1>

      <div className={'relative mt-5'}>
        <Webcam
          ref={webcamRef}
          audio={false}
          mirrored={true}
          screenshotFormat="image/jpeg"
          className={'absolute top-0 left-0 -z-50'}
        />
        <canvas ref={canvasRef} className={'z-10 -scale-x-100'} />

        {/*<Select value={deviceId} onValueChange={setDeviceId}>*/}
        {/*  <SelectTrigger className="w-[180px]">*/}
        {/*    <SelectValue placeholder="Theme" />*/}
        {/*  </SelectTrigger>*/}
        {/*  <SelectContent>*/}
        {/*    {devices.map((device: any, key) => (*/}
        {/*      <SelectItem value={device}>{device.label || `Device ${key + 1}`}</SelectItem>*/}
        {/*    ))}*/}
        {/*  </SelectContent>*/}
        {/*</Select>*/}
      </div>

      <div className={'border rounded-lg p-5 mt-3 max-w-xl w-full text-center'}>
        <h3 className={'font-bold text-xl mb-3'}>Detection Result</h3>
        <span>{movementDescription}</span>
        <br />
        <span>{banyakOrang}</span>
      </div>

      <Button className={'mt-3'} asChild>
        <Link to={'/main'}>
          <ArrowLeft /> Back
        </Link>
      </Button>
    </div>
  );
}
