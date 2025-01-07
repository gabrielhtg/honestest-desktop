import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table.tsx';
import CountdownTimer from '@/components/custom/CountDown.tsx';
import {
  BatteryCharging,
  BatteryFull,
  BatteryLow,
  BatteryMedium,
  BatteryWarning,
  LogOut,
  Send
} from 'lucide-react';
import logo from '@/assets/app-logo.png';
import { useNavigate } from 'react-router';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import QuillResizeImage from 'quill-resize-image';
Quill.register('modules/resize', QuillResizeImage);

export default function ExamStartPage() {
  const [examData, setExamData] = useState<any>(null);
  // const [editorConfig, setEditorConfig] = useState<any>(null);
  const [editorConfig] = useState<any>(null);
  const [submitState, setSubmitState] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState<any>();
  const [batteryPercentage, setBatteryPercentage] = useState();
  const [isCharging, setIsCharging] = useState();
  const [currentTime, setCurrentTime] = useState('');
  const navigate = useNavigate();

  // state untuk exam behaviour
  const [hoursLimit, setHoursLimit] = useState<number>();
  const [minutesLimit, setMinutesLimit] = useState<number>();
  const [secondsLimit, setSecondsLimit] = useState<number>();

  const Editor = {
    modules: {
      toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        [{ font: [] }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ color: [] }, { background: [] }],
        [{ align: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
        ['link', 'image', 'video'],
        ['clean']
      ],
      resize: {
        locale: {}
      }
    },
    formats: [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'list',
      'bullet',
      'indent',
      'link',
      'image'
    ]
  };

  // state untuk question behaviour
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: any;
  }>({});

  // state untuk question
  const [questions, setQuestions] = useState<any[]>([]);

  const handleValueChange = (questionId: number, value: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleExitExam = async () => {
    // @ts-ignore
    await window.electron.stop_exam_mode();

    navigate('/main');
  };

  const getExamData = async () => {
    // @ts-ignore
    const tempExamData = await window.electron.store.get('exam-data');
    console.log(tempExamData);
    setExamData(tempExamData.data.examData);
    setQuestions(tempExamData.data.questionsData);
    setSelectedQuestion({
      question: tempExamData.data.questionsData[0],
      number: 0
    });

    setHoursLimit(Math.floor(tempExamData.data.examData.time_limit / 3600));
    setMinutesLimit(Math.floor((tempExamData.data.examData.time_limit % 3600) / 60));
    setSecondsLimit(Math.floor((tempExamData.data.examData.time_limit % 3600) % 60));
  };

  const handleGetBatteryInfo = async () => {
    // @ts-ignore
    const tempPercentage = await window.electron.get_battery_percentage();
    // @ts-ignore
    const tempIsCharging = await window.electron.is_charging();

    setBatteryPercentage(tempPercentage.data);
    setIsCharging(tempIsCharging.data);
  };

  const handleSubmitExam = async () => {
    // try {
    //   const submitData = await axios.post(
    //     `${apiUrl}/exam/submit`,
    //     {
    //       username: userUsername,
    //       exam: examData,
    //       answer: selectedAnswers,
    //       questions: questions
    //     },
    //     getBearerHeader(localStorage.getItem('token')!)
    //   );
    //
    //   if (examData.enable_review) {
    //     if (submitData.status === 200) {
    //       router.push(`/main/exam/simulate/review/${submitData.data.data.id}`);
    //     }
    //   } else {
    //     if (submitData.status === 200) {
    //       router.push(`/main/exam/simulate/${id}`);
    //     }
    //   }
    // } catch (e: any) {
    //   console.log(e.response.data.message);
    // }
  };

  const handleTextChange = (quillVal: any) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [selectedQuestion?.question.id]: quillVal === '' || quillVal === '<p><br></p>' ? '' : quillVal
    }));
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
    <div title="Configure Exam">
      <div id={'card-utama'} className={'w-full p-10 h-[calc(100vh-57px)]'}>
        <h3 className={'font-bold text-xl mb-5'}>
          {examData ? examData.title : ''} {examData?.course_title}
        </h3>

        <div className={'flex gap-5 h-full pb-10'}>
          {/*sebelah kiri*/}
          {submitState === 1 ? (
            <div
              className={
                'flex flex-col w-full overflow-y-auto scroll-smooth border rounded-lg px-5 pb-5'
              }>
              {/*{questions.map((e: any, questionIndex) => (*/}
              {selectedQuestion ? (
                <div className={'flex gap-3 rounded-lg p-5 pb-0 mr-5'}>
                  <div>{selectedQuestion?.number + 1}.</div>
                  <div className={'w-full h-auto'}>
                    {parse(selectedQuestion?.question.content)}
                    {selectedQuestion?.question.type === 'essay' ? (
                      <>
                        {editorConfig ? (
                          ''
                        ) : (
                          <ReactQuill
                            theme="snow"
                            className={'mt-3'}
                            value={selectedAnswers[selectedQuestion?.question.id]}
                            onChange={handleTextChange}
                            modules={Editor.modules}
                            formats={Editor.formats}
                          />
                        )}
                      </>
                    ) : (
                      <RadioGroup
                        value={selectedAnswers[selectedQuestion?.question.id] || ''}
                        onValueChange={(value) =>
                          handleValueChange(selectedQuestion?.question.id, value)
                        }
                        className={'flex ms-5 flex-col mt-2'}>
                        {selectedQuestion?.question.options.map(
                          (item: any, optionIndex: number) => (
                            <div key={optionIndex} className={'flex items-center gap-3'}>
                              <div>
                                {selectedQuestion?.question.type === 'multiple' ? (
                                  <div className={'flex items-center gap-3'}>
                                    <RadioGroupItem value={item.id} id={item.id} />
                                    {String.fromCharCode(97 + optionIndex)}.
                                  </div>
                                ) : (
                                  ''
                                )}

                                {selectedQuestion?.question.type === 'check-box' ? (
                                  <div className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`${item.id}`}
                                      checked={(
                                        selectedAnswers[selectedQuestion?.question.id] || []
                                      ).includes(item.id)}
                                      onCheckedChange={(elm: boolean) =>
                                        setSelectedAnswers((prev: any) => {
                                          const currentAnswers =
                                            prev[selectedQuestion?.question.id] || [];

                                          if (elm) {
                                            // ini ketika nanti user mencoba untuk memilih semua opsi
                                            // dibatasi bahwa yang bisa dipilih hanya sebesar banyak pilihan yang memungkinkan.
                                            if (
                                              currentAnswers.length >=
                                              selectedQuestion?.question.options.filter(
                                                (tmp: any) => tmp.isCorrect
                                              ).length
                                            ) {
                                              return prev;
                                            }

                                            return {
                                              ...prev,
                                              [selectedQuestion?.question.id]: [
                                                ...currentAnswers,
                                                item.id
                                              ]
                                            };
                                          } else {
                                            if (prev[selectedQuestion?.question.id].length === 1) {
                                              const updatedAns = { ...prev };
                                              delete updatedAns[selectedQuestion?.question.id];
                                              return updatedAns;
                                            } else {
                                              return {
                                                ...prev,
                                                [selectedQuestion?.question.id]:
                                                  currentAnswers.filter((id: any) => id !== item.id)
                                              };
                                            }
                                          }
                                        })
                                      }
                                    />
                                  </div>
                                ) : (
                                  ''
                                )}
                              </div>
                              <div>
                                {selectedQuestion?.question.type === 'multiple' ? (
                                  <label htmlFor={item.id}>{parse(item.option)}</label>
                                ) : (
                                  ''
                                )}

                                {selectedQuestion?.question.type === 'check-box' ? (
                                  <label
                                    htmlFor={`${item.id}`}
                                    className="peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {parse(item.option)}
                                  </label>
                                ) : (
                                  ''
                                )}
                              </div>
                            </div>
                          )
                        )}

                        {selectedAnswers[selectedQuestion?.question.id] &&
                        selectedQuestion?.question.type == 'multiple' ? (
                          <div>
                            <Button
                              variant={'secondary'}
                              onClick={() => {
                                setSelectedAnswers((prev) => {
                                  const updatedAnswers = { ...prev };
                                  delete updatedAnswers[selectedQuestion?.question.id];
                                  return updatedAnswers;
                                });
                              }}>
                              Clear Option
                            </Button>
                          </div>
                        ) : (
                          ''
                        )}
                      </RadioGroup>
                    )}
                  </div>
                </div>
              ) : (
                ''
              )}
              {/*))}*/}
            </div>
          ) : (
            ''
          )}

          {submitState === 2 ? (
            <div
              className={
                'flex flex-col w-full overflow-y-scroll scroll-smooth border rounded-lg px-5 pb-5 justify-center items-center'
              }>
              <div className={'w-full max-w-xl border rounded-lg'}>
                <Table>
                  <TableHeader>
                    <TableRow className={'divide-x'}>
                      <TableHead className={'text-center'}>Question Number</TableHead>
                      <TableHead className={'text-center'}>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question, index) => (
                      <TableRow key={index} className={'divide-x'}>
                        <TableCell className={'text-center'}>{index + 1}</TableCell>
                        <TableCell className={'text-center'}>
                          {selectedAnswers[question.id] ? (
                            <span className={'text-green-500 font-bold'}>Answered</span>
                          ) : (
                            <span className={'text-red-500'}>Not Answered</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button
                className={'mt-5'}
                onClick={() => {
                  setSubmitState(1);
                }}>
                Back To Question
              </Button>
            </div>
          ) : (
            ''
          )}

          {/*sebelah kanan*/}
          <div className={'max-w-xs w-full flex flex-col gap-5'}>
            <div className={'border rounded-lg p-5 flex flex-col'}>
              <span className={'font-bold mb-5'}>Question List</span>

              <div className={'grid grid-cols-5 gap-2'}>
                {questions.map((e: any, index: number) => (
                  <button
                    onClick={() => {
                      setSelectedQuestion({
                        question: questions[index],
                        number: index
                      });
                    }}
                    key={index}
                    className={'border rounded-lg flex justify-center flex-col items-center'}>
                    <span className={'my-2'}>{index + 1}</span>
                    <div
                      className={`w-full h-6 rounded-b-lg ${selectedAnswers[e.id] ? 'bg-muted-foreground' : 'bg-muted'}`}></div>
                  </button>
                ))}
              </div>
            </div>

            {hoursLimit || minutesLimit || secondsLimit ? (
              <CountdownTimer
                hours={hoursLimit}
                minutes={minutesLimit}
                seconds={secondsLimit}
                onTimeUp={handleSubmitExam}
              />
            ) : (
              ''
            )}

            <div className={'flex gap-3'}>
              <div>
                <Button
                  onClick={() => {
                    if (submitState === 2) {
                      handleSubmitExam().then();
                    } else {
                      setSubmitState(submitState + 1);
                    }
                  }}>
                  <Send />
                  {submitState === 1 ? 'Submit' : ''}
                  {submitState === 2 ? 'Submit & Finish' : ''}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*<AlertDialog open={showDialog}>*/}
      {/*  <AlertDialogContent>*/}
      {/*    <AlertDialogHeader>*/}
      {/*      <AlertDialogTitle*/}
      {/*        className={'text-center flex flex-col items-center'}*/}
      {/*      >*/}
      {/*        {getAlertTitle()}*/}
      {/*      </AlertDialogTitle>*/}
      {/*      <AlertDialogDescription className={'text-center'}>*/}
      {/*        {dialogMsg}*/}
      {/*      </AlertDialogDescription>*/}
      {/*    </AlertDialogHeader>*/}
      {/*    <AlertDialogFooter className={'!justify-center'}>*/}
      {/*      <Button*/}
      {/*        onClick={() => {*/}
      {/*          setShowDialog(false)*/}
      {/*        }}*/}
      {/*      >*/}
      {/*        OK*/}
      {/*      </Button>*/}
      {/*    </AlertDialogFooter>*/}
      {/*  </AlertDialogContent>*/}
      {/*</AlertDialog>*/}

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
    </div>
  );
}
