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
import { Copy, Fingerprint, LogOut, Menu, RotateCcw, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label.tsx';
import { useNavigate } from 'react-router';
import { Toaster } from '@/components/ui/sonner.tsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu.tsx';

export function MainPage() {
  const [examConfigFile, setExamConfigFile] = useState<File>();
  const [nim, setNim] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [oldNim, setOldNim] = useState<string>('');
  const [oldName, setOldName] = useState<string>('');
  const navigate = useNavigate();
  const [openClearDialog, setOpenClearDialog] = useState<boolean>(false);
  const [openExitDialog, setOpenExitDialog] = useState<boolean>(false);
  const [configPassword, setConfigPassword] = useState<string>('');
  const [passwordErrMessage, setPasswordErrMessage] = useState('');

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
  };

  const toBase64 = (file: File) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const getExamData = async () => {
    // @ts-ignore
    const examData = await window.electron.open_config(
      await toBase64(examConfigFile!),
      configPassword
    );

    if (examData.data !== null) {
      // @ts-ignore
      await window.electron.start_exam_mode();
      navigate('/exam');
    } else {
      setPasswordErrMessage(examData.message);
    }
  };

  const handleGenerateCredentialFile = async () => {
    // @ts-ignore
    const response = await window.electron.generate_credential_file(
      JSON.stringify({
        nim: nim,
        name: name,
        device_id: deviceId
      })
    );

    toast.info(`Credential file saved at ${response.data}`, {
      duration: 5000
    });
  };

  const handleSaveUserData = async () => {
    // @ts-ignore
    await window.electron.store.save('user-nim', nim.toUpperCase());
    // @ts-ignore
    await window.electron.store.save('user-name', name.toUpperCase());
    // @ts-ignore
    await window.electron.store.save('device-id', deviceId);

    getUserData().then();
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
                className={'uppercase'}
              />
            </div>

            <div className="grid w-full max-w-lg items-center gap-1.5">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                className={'uppercase'}
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
                accept=".ta12"
                className={'max-w-sm'}
                onChange={(e) => {
                  if (e.target.files !== null) {
                    setExamConfigFile(e.target.files[0]);
                  }
                }}
              />
            </div>

            <div className={'flex flex-col gap-2'}>
              {examConfigFile ? (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Open Exam Config</Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Insert Config Password</DialogTitle>
                      <DialogDescription>
                        To get the config password, ask your lecturer or exam supervisor.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col">
                      <Label htmlFor="password" className={'mb-3'}>
                        Config Password
                      </Label>
                      <Input
                        id="password"
                        type={'password'}
                        value={configPassword}
                        onChange={(e) => {
                          setConfigPassword(e.target.value);
                        }}
                        className="col-span-3"
                      />
                      <span className={'text-xs text-red-500 mt-1'}>{passwordErrMessage}</span>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        onClick={() => {
                          setPasswordErrMessage('');
                          getExamData().then();
                        }}>
                        Start
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                ''
              )}

              {oldName !== name || oldNim !== nim ? (
                <Button
                  onClick={() => {
                    handleSaveUserData().then();
                  }}>
                  <Save />
                  Save
                </Button>
              ) : (
                ''
              )}

              <Button
                onClick={() => {
                  handleGenerateCredentialFile().then();
                }}>
                <Fingerprint />
                Get Credential File
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={'flex justify-end w-full gap-3 mt-10'}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant={'outline'}>
              <Menu />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={'mr-10'}>
            <DropdownMenuItem
              className={'text-red-500'}
              onClick={() => {
                setOpenClearDialog(true);
              }}>
              <RotateCcw />
              Clear App Data
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                setOpenExitDialog(true);
              }}>
              <LogOut />
              Exit App
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Dialog open={openClearDialog} onOpenChange={setOpenClearDialog}>
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

        <Dialog open={openExitDialog} onOpenChange={setOpenExitDialog}>
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

      <Toaster />
    </div>
  );
}
