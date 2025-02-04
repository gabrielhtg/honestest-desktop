import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table.tsx';
import { format } from 'date-fns';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router';
import { Input } from '@/components/ui/input';
import logo from '@/assets/app-logo.png';
import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  LogOut,
  Send
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { apiUrl } from '@/lib/env.ts';
import { Toaster } from '@/components/ui/sonner.tsx';
import { Spinner } from '@/components/custom/Spinner.tsx';

export function ExamWaitingPage() {
  const [examData, setExamData] = useState<any>();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [inputStartPassword, setInputStartPassword] = useState('');
  const [inputStartPasswordValidation, setInputStartPasswordValidation] = useState('');
  const [examResultData, setExamResultData] = useState<any[]>([]);
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState('');
  const [batteryPercentage, setBatteryPercentage] = useState();
  const [isCharging, setIsCharging] = useState();
  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [exitPassword, setExitPassword] = useState('');
  const [exitPasswordErrMsg, setExitPasswordErrMsg] = useState('');
  const [nim, setNim] = useState<string>('');
  const [questionData, setQuestionData] = useState([]);
  const [banyakSubmit, setBanyakSubmit] = useState(0);
  const [proctoringLog, setProctoringLog] = useState<any[]>([]);
  const [showSubmitSpinner, setShowSubmitSpinner] = useState(false)

  const handleSubmitExam = async () => {
    //@ts-ignore
    const temp = await window.electron.create_exam_result_file(
      JSON.stringify({
        username: nim,
        exam: examData,
        answer: examResultData[0].answers,
        questions: questionData,
        proctoringLog: proctoringLog
      })
    );

    const resultFile = new File([temp.data], temp.filename, {
      type: 'application/octet-stream', // Sesuaikan MIME type sesuai kebutuhan
      lastModified: Date.now()
    });

    const formData = new FormData();

    formData.append('result_file', resultFile);

    try {
      const submitData = await axios.post(`${apiUrl}/exam/submit`, formData);
      setBanyakSubmit(banyakSubmit + 1);
      setShowSubmitSpinner(false)
      toast.success(submitData.data.message);
    } catch (e: any) {
      console.log(e);
      setShowSubmitSpinner(false)
      toast.error(
        `${e.response.data.message}. You can submit from exam_result file in Documents folder.`
      );
    }
  };

  const getUserData = async () => {
    // @ts-ignore
    const tempNim = await window.electron.store.get('user-nim');
    // @ts-ignore
    // const tempName = await window.electron.store.get('user-name');
    // @ts-ignore
    // const tempDeviceID = await window.electron.store.get('device-id');

    setNim(tempNim.data);
  };

  const getExamData = async () => {
    // @ts-ignore
    const tempExamData = await window.electron.store.get('exam-data');
    setExamData(tempExamData.data.examData);
    console.log(tempExamData);

    // @ts-ignore
    const tempResultData = await window.electron.store.get('exam-result');
    if (tempResultData.data) {
      setExamResultData(tempResultData.data);
    }

    // @ts-ignore
    const tempProctoringLog = await window.electron.store.get('proctoring_log');
    if (tempProctoringLog.data) {
      setProctoringLog(tempProctoringLog.data);
    }
    console.log(tempProctoringLog.data);

    setQuestionData(tempExamData.data.questionsData);

    setStartDate(
      format(new Date(tempExamData.data.examData.start_date), 'EEEE, dd MMMM yyyy, hh:mm a')
    );
    setEndDate(
      format(new Date(tempExamData.data.examData.end_date), 'EEEE, dd MMMM yyyy, hh:mm a')
    );
    const tempTimeLimitHours = Math.floor(tempExamData.data.examData.time_limit / 3600);
    const tempTimeLimitMinutes = Math.floor((tempExamData.data.examData.time_limit % 3600) / 60);
    const tempTimeLimitSeconds = Math.floor((tempExamData.data.examData.time_limit % 3600) % 60);

    setTimeLimit(
      `${tempTimeLimitHours} hours, ${tempTimeLimitMinutes} minutes, ${tempTimeLimitSeconds} seconds`
    );
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
    // @ts-ignore
    await window.electron.store.delete('exam-proctoring_log');
    navigate('/main');
  };

  const handleGetBatteryInfo = async () => {
    // @ts-ignore
    const tempPercentage = await window.electron.get_battery_percentage();
    // @ts-ignore
    const tempIsCharging = await window.electron.is_charging();

    setBatteryPercentage(tempPercentage.data);
    setIsCharging(tempIsCharging.data);
  };

  useEffect(() => {
    getExamData().then();
    handleGetBatteryInfo().then();
    getUserData().then();

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
    <>
      <div className={'flex p-10 flex-col gap-5 min-h-screen'}>
        <h1 className={'font-bold text-3xl'}>Course : {examData ? examData.course.title : ''}</h1>
        <p className={'text-muted-foreground'}>{examData ? examData.course.description : ''}</p>

        <hr />

        <h2 className={'font-bold text-2xl'}>{examData ? examData.title : ''}</h2>

        <div className={'list-disc list-inside'}>{parse(examData ? examData.description : '')}</div>

        <div className={'w-full flex justify-center items-center flex-col'}>
          <div className={'border rounded-lg'}>
            <Table className={'max-w-xl text-base'}>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Attempts allowed</TableCell>
                  <TableCell>:</TableCell>
                  <TableCell>{examData?.allowed_attempts}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">This quiz started on</TableCell>
                  <TableCell>:</TableCell>
                  <TableCell>{startDate}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">This quiz closed on</TableCell>
                  <TableCell>:</TableCell>
                  <TableCell>{endDate}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Time Limit</TableCell>
                  <TableCell>:</TableCell>
                  <TableCell>{timeLimit}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        {examResultData?.length > 0 ? (
          <>
            <hr />

            <h2 className={'font-bold text-2xl'}>Attempt Summary</h2>

            <div className={'border rounded-lg'}>
              <Table>
                <TableHeader>
                  <TableRow className={'divide-x'}>
                    <TableHead>Attempt</TableHead>
                    <TableHead>Submitted At</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Review</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {examResultData?.map((examResult, index: number) => (
                    <TableRow key={index} className={'divide-x'}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {format(new Date(examResult.created_at), 'EEEE, dd MMMM yyyy, hh:mm a')}
                      </TableCell>
                      <TableCell>
                        {examResult.total_score} / {examResult.expected_score}{' '}
                        <span className={'font-bold'}>
                          ({((examResult.total_score / examResult.expected_score) * 100).toFixed(2)}
                          %)
                        </span>
                      </TableCell>
                      <TableCell>
                        {examData.enable_review ? (
                          <Link to={`/exam-review`} className={'text-blue-500'}>
                            Review
                          </Link>
                        ) : (
                          'Not Allowed'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          ''
        )}

        <div className={'flex justify-center gap-3'}>
          {examResultData?.length > 0 && banyakSubmit < examData.allowed_attempts ? (
            <Button
              onClick={() => {
                setShowSubmitSpinner(true)
                handleSubmitExam().then();
              }}>
              <Send /> Submit Exam <Spinner show={showSubmitSpinner} className={'text-primary-foreground'}/>
            </Button>
          ) : (
            ''
          )}
          {examResultData?.length == 0 ? (
            examData?.start_password === null ||
            examData?.start_password === '' ||
            examData?.start_password === undefined ? (
              <Button
                onClick={() => {
                  navigate('/exam-start');
                }}>
                Start Exam
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>Start Exam</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className={'mb-5'}>Enter Start Password</DialogTitle>
                    <DialogDescription className={'text-base text-primary'}>
                      Enter the password to start the exam. Ask the teacher/exam supervisor for the
                      password if you haven&#39;t got it.
                    </DialogDescription>
                    <Input
                      value={inputStartPassword}
                      onChange={(e) => {
                        setInputStartPassword(e.target.value);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setInputStartPasswordValidation('');
                          if (examData.start_password === inputStartPassword) {
                            navigate('/exam-start');
                          } else {
                            setInputStartPasswordValidation(`Incorrect Start Password`);
                          }
                        }
                      }}
                      type={'password'}
                      className={'mt-3'}
                      autoComplete={'new-password'}
                    />
                    <span className={'text-sm text-red-400'}>{inputStartPasswordValidation}</span>
                    <div className={'mt-3 flex gap-3'}>
                      <Button
                        onClick={() => {
                          setInputStartPasswordValidation('');
                          if (examData.start_password === inputStartPassword) {
                            navigate('/exam-start');
                          } else {
                            setInputStartPasswordValidation(`Incorrect Start Password`);
                          }
                        }}>
                        Start
                      </Button>
                      <DialogClose asChild>
                        <Button variant={'secondary'}>Cancel</Button>
                      </DialogClose>
                    </div>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            )
          ) : (
            ''
          )}

          {examResultData?.length > 0 && examData.allowed_attempts < examResultData?.length ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Start Again</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className={'mb-5'}>Enter Start Password</DialogTitle>
                  <DialogDescription className={'text-base text-primary'}>
                    Enter the password to start the exam. Ask the teacher/exam supervisor for the
                    password if you haven&#39;t got it.
                  </DialogDescription>
                  <div>
                    <Input
                      value={inputStartPassword}
                      onChange={(e) => {
                        setInputStartPassword(e.target.value);
                      }}
                      type={'password'}
                      className={'mt-3'}
                      autoComplete={'new-password'}
                    />
                    <span className={'text-sm text-red-400'}>{inputStartPasswordValidation}</span>
                    <div className={'mt-3 flex gap-3'}>
                      <Button
                        onClick={() => {
                          setInputStartPasswordValidation('');
                          if (examData.start_password === inputStartPassword) {
                            navigate('/exam-start');
                          } else {
                            setInputStartPasswordValidation(
                              `Incorrect Start Password ${examData.start_password}`
                            );
                          }
                        }}>
                        Start
                      </Button>
                      <DialogClose asChild>
                        <Button variant={'secondary'}>Cancel</Button>
                      </DialogClose>
                    </div>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ) : (
            ''
          )}
        </div>
        <Toaster />
      </div>

      {/*Bagian bar bawah*/}
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
              if (examData.end_password === null) {
                handleExitExam().then();
              } else {
                setShowDialog(true);
              }
            }}>
            <LogOut />
          </Button>
        </div>
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
    </>
  );
}
