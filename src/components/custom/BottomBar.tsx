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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog.tsx';
import { Input } from '@/components/ui/input.tsx';

export function BottomBar() {
  const [batteryPercentage, setBatteryPercentage] = useState();
  const [isCharging, setIsCharging] = useState();
  const [currentTime, setCurrentTime] = useState('');
  const navigate = useNavigate();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [exitPassword, setExitPassword] = useState('');
  const [exitPasswordErrMsg, setExitPasswordErrMsg] = useState('');
  const [examData, setExamData] = useState<any>();

  const handleGetBatteryInfo = async () => {
    // @ts-ignore
    const tempPercentage = await window.electron.get_battery_percentage();
    // @ts-ignore
    const tempIsCharging = await window.electron.is_charging();

    setBatteryPercentage(tempPercentage.data);
    setIsCharging(tempIsCharging.data);
  };

  const getExamData = async () => {
    // @ts-ignore
    const tempExamData = await window.electron.store.get('exam-data');
    setExamData(tempExamData.data.examData);
  };

  const handleExitExam = async () => {
    // @ts-ignore
    await window.electron.stop_exam_mode();
    // @ts-ignore
    await window.electron.store.delete('exam-result');
    // @ts-ignore
    await window.electron.store.delete('answers');
    // @ts-ignore
    await window.electron.store.delete('exam-data');
    navigate('/main');
  };

  useEffect(() => {
    getExamData().then();

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
            setExitPasswordErrMsg('');
            if (examData.end_password === null || examData.end_password.trim() === '') {
              handleExitExam().then();
            } else {
              setShowDialog(true);
            }
          }}>
          <LogOut />
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert Exit Password</DialogTitle>
            <DialogDescription className={'pt-3'}>
              Exit password is required to exit HonesTest.
            </DialogDescription>
            <div className={'pt-2'}>
              <Input
                type={'password'}
                value={exitPassword}
                onKeyDown={(e: any) => {
                  if (e.key === 'Enter') {
                    setExitPasswordErrMsg('');
                    if (examData.end_password === exitPassword) {
                      handleExitExam().then();
                    } else {
                      setExitPasswordErrMsg('Wrong exit password!');
                    }
                  }
                }}
                onChange={(e) => {
                  setExitPassword(e.target.value);
                }}
              />
              <span className={'text-sm text-red-500'}>{exitPasswordErrMsg}</span>

              <div className={'mt-3'}>
                <Button
                  onClick={() => {
                    setExitPasswordErrMsg('');
                    if (examData.end_password === exitPassword) {
                      handleExitExam().then();
                    } else {
                      setExitPasswordErrMsg('Wrong exit password!');
                    }
                  }}>
                  Exit
                </Button>
              </div>
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
