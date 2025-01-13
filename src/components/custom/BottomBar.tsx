import logo from '@/assets/app-logo.png';
import { Button } from '@/components/ui/button.tsx';
import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  LogOut
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

export function BottomBar() {
  const [batteryPercentage, setBatteryPercentage] = useState();
  const [isCharging, setIsCharging] = useState();
  const [currentTime, setCurrentTime] = useState('');
  const navigate = useNavigate();

  const handleGetBatteryInfo = async () => {
    // @ts-ignore
    const tempPercentage = await window.electron.get_battery_percentage();
    // @ts-ignore
    const tempIsCharging = await window.electron.is_charging();

    setBatteryPercentage(tempPercentage.data);
    setIsCharging(tempIsCharging.data);
  };

  const handleExitExam = async () => {
    // @ts-ignore
    await window.electron.stop_exam_mode();

    navigate('/main');
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: any = {
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      setCurrentTime(now.toLocaleString('en-US', options));
    };

    const intervalId = setInterval(updateTime, 1000);
    const batteryInterval = setInterval(handleGetBatteryInfo, 1000 * 2);

    return () => {
      clearInterval(intervalId);
      clearInterval(batteryInterval);
    };
  }, []);

  return (
    <div
      className={
        'w-full bottom-0 sticky border-t bg-white flex py-2 px-5 shadow-lg justify-between items-center'
      }>
      <img src={logo} alt="logo" className={'w-8 h-8'} />

      <div className={'flex gap-2 items-center'}>
        {isCharging ? (
          <Button variant={'secondary'}>
            <BatteryCharging />
            {batteryPercentage}%
          </Button>
        ) : (
          <Button variant={'secondary'}>
            {batteryPercentage! >= 80 ? <BatteryFull /> : ''}
            {batteryPercentage! >= 50 && batteryPercentage! < 80 ? <BatteryMedium /> : ''}
            {batteryPercentage! >= 15 && batteryPercentage! < 50 ? <BatteryLow /> : ''}
            {batteryPercentage! < 15 ? <BatteryWarning /> : ''}
            {batteryPercentage}%
          </Button>
        )}

        <Button variant={'secondary'}>{currentTime}</Button>

        <Button
          variant={'secondary'}
          onClick={() => {
            handleExitExam().then();
          }}>
          <LogOut />
        </Button>
      </div>
    </div>
  );
}
