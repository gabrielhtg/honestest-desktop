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
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { Input } from '@/components/ui/input';

export function ExamStartPage() {
  const [examData, setExamData] = useState<any>();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeLimit, setTimeLimit] = useState('');
  const [inputStartPassword, setInputStartPassword] = useState('');
  const [inputStartPasswordValidation, setInputStartPasswordValidation] = useState('');
  const [examResultData, setExamResultData] = useState<any[]>([]);

  const getExamData = async () => {
    // @ts-ignore
    const tempExamData = await window.electron.store.get('exam-data');
    setExamData(tempExamData.data.examData);

    console.log(tempExamData);

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

    // setExamResultData(examResultResponse.data.data)
  };

  useEffect(() => {
    getExamData().then();
  }, []);

  return (
    <div className={'flex p-10 flex-col gap-5'}>
      <h1 className={'font-bold text-3xl'}>Course : {examData ? examData.course_title : ''}</h1>

      <hr />

      <h2 className={'font-bold text-2xl'}>{examData ? examData.title : ''}</h2>

      <div className={'list-disc list-inside'}>{parse(examData ? examData.description : '')}</div>

      <div className={'w-full flex justify-center items-center'}>
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

      {examResultData.length > 0 ? (
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
                    <TableCell>{examResult.attempt}</TableCell>
                    <TableCell>
                      {format(new Date(examResult.created_at), 'EEEE, dd MMMM yyyy, hh:mm a')}
                    </TableCell>
                    <TableCell>
                      {examResult.total_score} / {examResult.expected_score} (
                      <span className={'font-bold'}>
                        {((examResult.total_score / examResult.expected_score) * 100).toFixed(2)}
                        %)
                      </span>
                    </TableCell>
                    <TableCell>
                      {examData.enable_review ? (
                        <Link
                          to={`/main/exam/simulate/review/${examResult.id}`}
                          className={'text-blue-500'}>
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
        <Dialog>
          <DialogTrigger asChild>
            <Button>{examResultData.length > 0 ? 'Start Again' : 'Start Exam'}</Button>
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
                        // router.push(`/main/exam/simulate/start/${id}`);
                      } else {
                        setInputStartPasswordValidation('Incorrect Start Password');
                      }
                    }}>
                    Start
                  </Button>
                  <Button variant={'secondary'}>Cancel</Button>
                </div>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {/*{examResultData?.length >= examData?.allowed_attempts ? (*/}
        {/*  ''*/}
        {/*) : (*/}
        {/*  */}
        {/*)}*/}

        {/*{examResultData.length > 0 ? (*/}
        {/*  <Button*/}
        {/*    onClick={() => {*/}
        {/*      handleResetAttempt().then();*/}
        {/*    }}>*/}
        {/*    Reset Attempts*/}
        {/*  </Button>*/}
        {/*) : (*/}
        {/*  ''*/}
        {/*)}*/}
      </div>
    </div>
  );
}