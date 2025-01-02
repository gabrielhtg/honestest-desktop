import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import { ArrowLeft, ArrowRight, Copy, LogOut } from 'lucide-react';
import logo from '../assets/app-logo.png';
import { Input } from '@/components/ui/input.tsx';
import { Label } from '@/components/ui/label';
import { v4 } from 'uuid';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner.tsx';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { useNavigate } from 'react-router';

export function WelcomePage() {
  // variable area
  const [pageState, setPageState] = useState(1);
  const [nim, setNim] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [nimErrMsg, setNimErrMsg] = useState<string>('');
  const [nameErrMsg, setNameErrMsg] = useState<string>('');
  const navigate = useNavigate();

  // function area
  const handleSaveUserData = async () => {
    // @ts-ignore
    await window.electron.store.save('user-nim', nim.toUpperCase());
    // @ts-ignore
    await window.electron.store.save('user-name', name.toUpperCase());
    // @ts-ignore
    await window.electron.store.save('device-id', deviceId);
  };

  const getUserData = async () => {
    // @ts-ignore
    const tempNim = await window.electron.store.get('user-nim');
    // @ts-ignore
    const tempName = await window.electron.store.get('user-name');
    // @ts-ignore
    const tempDeviceID = await window.electron.store.get('device-id');

    if (
      tempNim.data !== undefined &&
      tempName.data !== undefined &&
      tempDeviceID.data !== undefined
    ) {
      navigate('/main');
    } else {
      setDeviceId(v4());
    }
  };

  useEffect(() => {
    getUserData().then();
  }, []);

  return (
    <div className={'w-screen h-screen flex flex-col items-center justify-center'}>
      {pageState === 1 ? (
        <>
          <div className={'flex flex-col items-center flex-1 justify-center'}>
            <img src={logo} alt="logo" className={'w-48'} />

            <h1 className={'text-3xl mt-5 mb-5 font-medium'}>Welcome to HonesTest App</h1>

            <Button
              className={'mt-5'}
              onClick={() => {
                setPageState(pageState + 1);
              }}>
              <ArrowRight />
              Next
            </Button>
          </div>
        </>
      ) : (
        ''
      )}

      {pageState === 2 ? (
        <>
          <div className={'flex flex-col items-center flex-1 justify-center w-full'}>
            <img src={logo} alt="logo" className={'w-48'} />

            <h1 className={'text-3xl mt-5 mb-5 font-medium'}>Who are you?</h1>

            <div className={'flex flex-col max-w-xl w-full items-center gap-5'}>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label>NIM</Label>
                <Input
                  type="text"
                  value={nim}
                  onChange={(e) => {
                    setNim(e.target.value);
                  }}
                  className={'uppercase'}
                />
                <span className={'text-red-500 text-sm'}>{nimErrMsg}</span>
              </div>

              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label>Name</Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  className={'uppercase'}
                />
                <span className={'text-red-500 text-sm'}>{nameErrMsg}</span>
              </div>
            </div>

            <div className={'flex gap-3 mt-5'}>
              <Button
                onClick={() => {
                  setPageState(pageState - 1);
                }}>
                <ArrowLeft />
                Back
              </Button>

              <Button
                onClick={() => {
                  setNimErrMsg('');
                  setNameErrMsg('');
                  if (nim !== '' && name !== '') {
                    handleSaveUserData().then();
                    setPageState(pageState + 1);
                  } else {
                    if (nim === '') {
                      setNimErrMsg('Please fill this field.');
                    }

                    if (name === '') {
                      setNameErrMsg('Please fill this field.');
                    }
                  }
                }}>
                <ArrowRight />
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        ''
      )}

      {pageState === 3 ? (
        <>
          <div className={'flex flex-col items-center flex-1 justify-center w-full'}>
            <img src={logo} alt="logo" className={'w-48'} />

            <h1 className={'text-3xl mt-5 mb-5 font-medium'}>Your Device ID</h1>

            <div className={'flex gap-3'}>
              <div className={'p-3 border font-mono rounded-lg'}>{deviceId}</div>
              <Button
                variant={'secondary'}
                className={'h-full'}
                onClick={() => {
                  toast.success('Device ID Copied', {
                    action: {
                      label: 'OK',
                      onClick: () => {}
                    }
                  });
                  navigator.clipboard.writeText(deviceId).then();
                }}>
                <Copy />
              </Button>
            </div>

            <div className={'flex gap-3 mt-5'}>
              <Button
                onClick={() => {
                  setPageState(pageState - 1);
                }}>
                <ArrowLeft />
                Back
              </Button>

              <Button
                onClick={() => {
                  navigate('/main');
                }}>
                <ArrowRight />
                Finish
              </Button>
            </div>
          </div>
        </>
      ) : (
        ''
      )}

      <Dialog>
        <DialogTrigger asChild>
          <Button className={'self-end mb-10 mr-10'} variant={'outline'}>
            <LogOut />
            Exit App
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className={'text-center'}>Confirmation Dialog</DialogTitle>
            <DialogDescription className={'text-center'}>
              Are you sure you want to leave this application?
            </DialogDescription>
            <DialogFooter>
              <div className={'w-full flex gap-2 mt-3 justify-center'}>
                <Button
                  onClick={() => {
                    // @ts-ignore
                    window.electron.exit();
                  }}>
                  Yes
                </Button>

                <DialogClose asChild>
                  <Button>Cancel</Button>
                </DialogClose>
              </div>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
