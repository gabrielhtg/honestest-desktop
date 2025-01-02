import { Input } from '@/components/ui/input.tsx';
import logo from '@/assets/app-logo.png';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button.tsx';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog.tsx';
import { Copy, Fingerprint, LogOut, RotateCcw, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label.tsx';
import { useNavigate } from 'react-router';

export function MainPage() {
  const [examConfigFile, setExamConfigFile] = useState<File>();
  const [nim, setNim] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [oldNim, setOldNim] = useState<string>('');
  const [oldName, setOldName] = useState<string>('');
  const navigate = useNavigate();

  const getUserData = async () => {
    // @ts-ignore
    const tempNim = await window.electron.store.get('user-nim');
    // @ts-ignore
    const tempName = await window.electron.store.get('user-name');
    // @ts-ignore
    const tempDeviceID = await window.electron.store.get('device-id');

    setNim(tempNim.data);
    setName(tempName.data);
    setDeviceId(tempDeviceID.data);

    setOldNim(tempNim.data);
    setOldName(tempName.data);

    console.log(tempName);
    console.log(tempNim);
    console.log(tempDeviceID);
  };

  const clearAppData = async () => {
    // @ts-ignore
    await window.electron.store.clear();
  };

  useEffect(() => {
    getUserData().then();
  }, []);

  return (
    <div className={'flex flex-col w-screen h-screen items-center justify-center p-10'}>
      <div className={'flex flex-col items-center gap-5 flex-1 justify-center w-full'}>
        <img src={logo} alt="logo" className={'w-48'} />

        <Card>
          <CardContent className={'flex flex-col gap-5 mt-6'}>
            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label>NIM</Label>
              <Input
                value={nim}
                onChange={(e) => {
                  setNim(e.target.value);
                }}
              />
            </div>

            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
              />
            </div>

            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label>Device ID</Label>
              <div className={'flex gap-3 items-stretch'}>
                <div className={'px-3 py-2 border font-mono rounded-lg text-sm'}>{deviceId}</div>
                <Button
                  variant={'secondary'}
                  className={'h-auto'}
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
            </div>

            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label>Exam Config</Label>
              <Input
                type="file"
                className={'max-w-sm'}
                onChange={(e) => {
                  if (e.target.files !== null) {
                    setExamConfigFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            <div className={'flex flex-col gap-2'}>
              {oldName !== name || oldNim !== nim ? (
                <Button>
                  <Save />
                  Save
                </Button>
              ) : (
                ''
              )}

              <Button>
                <Fingerprint />
                Get Credential File
              </Button>

              {examConfigFile ? <Button>Start Exam</Button> : ''}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={'flex justify-end w-full gap-3 mt-10'}>
        <Dialog>
          <DialogTrigger asChild>
            <Button className={'self-end'} variant={'destructive'}>
              <RotateCcw />
              Clear App Data
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className={'text-center'}>Clear HonesTest Data</DialogTitle>
              <DialogDescription className={'text-center'}>
                Are you sure to clear all of the application data? This action can't be undone.
              </DialogDescription>
              <DialogFooter>
                <div className={'w-full flex gap-2 mt-3 justify-center'}>
                  <Button
                    onClick={() => {
                      clearAppData().then();
                      navigate('/');
                    }}>
                    Yes
                  </Button>

                  <DialogClose asChild>
                    <Button variant={'secondary'}>Cancel</Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button className={'self-end'} variant={'outline'}>
              <LogOut />
              Exit App
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className={'text-center'}>Exit Application</DialogTitle>
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
                    <Button variant={'secondary'}>Cancel</Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
