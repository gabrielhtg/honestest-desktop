import { useCallback, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button.tsx';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

export default function CheckReadiness() {
  const [deviceId, setDeviceId] = useState<any>({});
  const [devices, setDevices] = useState<any>([]);
  const navigate = useNavigate();

  const handleDevices = useCallback(
    (mediaDevices: any) => {
      setDevices(mediaDevices.filter(({ kind }: any) => kind === 'videoinput'));
      setDeviceId(mediaDevices.filter(({ kind }: any) => kind === 'videoinput')[0]);
    },
    [setDevices]
  );

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then(handleDevices);
  }, [handleDevices]);

  return (
    <div className={'flex flex-col h-screen w-screen items-center justify-center gap-5'}>
      <h1 className={'font-bold text-3xl'}>Check Readiness Page</h1>

      <Webcam className={'-scale-x-100'} audio={false} videoConstraints={deviceId.deviceId} />

      <div className={'flex gap-3 items-center'}>
        <span className={'font-bold'}>Camera : </span>
        <Select value={deviceId.deviceId}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Camera" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device: any, key: any) => (
              <SelectItem value={device.deviceId}>
                {device.label.trim() || `Device ${key + 1}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        onClick={() => {
          navigate('/main');
        }}>
        <ArrowLeft /> Back
      </Button>
    </div>
  );
}
