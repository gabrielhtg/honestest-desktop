import { useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';

export default function CheckReadiness() {
  // const [deviceId, setDeviceId] = useState<any>({});
  const [devices, setDevices] = useState<any>([]);

  const handleDevices = useCallback(
    (mediaDevices: any) =>
      setDevices(mediaDevices.filter(({ kind }: any) => kind === 'videoinput')),
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return (
    <div className={'flex flex-col h-screen w-screen items-center justify-center gap-5'}>
      <h1 className={'font-bold text-3xl'}>Check Readiness Page</h1>

      {devices.map((device: any, key: any) => (
        <div>
          <Webcam
            className={'-scale-x-100'}
            audio={false}
            videoConstraints={{ deviceId: device.deviceId }}
          />
          <div className={'mt-3'}>
            <span className={'font-bold'}>Camera : </span> {device.label || `Device ${key + 1}`}
          </div>
        </div>
      ))}
    </div>
  );
}
