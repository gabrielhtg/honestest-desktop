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
import { ChevronLeft, ChevronRight, Eraser, Send } from 'lucide-react';
import { useNavigate } from 'react-router';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import QuillResizeImage from 'quill-resize-image';
import { BottomBar } from '@/components/custom/BottomBar.tsx';
import Webcam from 'react-webcam';
Quill.register('modules/resize', QuillResizeImage);

export default function ExamStartPage() {
  const [examData, setExamData] = useState<any>(null);
  const [quillValue, setQuillValue] = useState('');
  const [editorConfig] = useState<any>(null);
  const [submitState, setSubmitState] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState<any>();

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

  const getExamData = async () => {
    // @ts-ignore
    const tempExamData = await window.electron.store.get('exam-data');
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

  const handleSubmitExam = async () => {
    // @ts-ignore
    await window.electron.store.save('answers', selectedAnswers);

    if (examData.enable_review) {
      navigate('/exam-review');
    } else {
      navigate('/exam');
    }
  };

  useEffect(() => {
    getExamData().then();
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
                          <>
                            <ReactQuill
                              theme="snow"
                              className={'mt-3'}
                              value={quillValue}
                              onChange={setQuillValue}
                              modules={Editor.modules}
                              formats={Editor.formats}
                            />

                            <div className={'flex gap-3 mt-5'}>
                              <Button
                                variant={'outline'}
                                onClick={() => {
                                  if (quillValue !== '' && quillValue !== '<p><br></p>') {
                                    setSelectedAnswers((prev) => ({
                                      ...prev,
                                      [selectedQuestion?.question.id]: quillValue
                                    }));
                                  }

                                  setQuillValue('');

                                  if (
                                    questions[selectedQuestion.number - 1] !== null &&
                                    questions[selectedQuestion.number - 1] !== undefined
                                  ) {
                                    setQuillValue('');
                                    setSelectedQuestion({
                                      question: questions[selectedQuestion.number - 1],
                                      number: selectedQuestion.number - 1
                                    });

                                    if (questions[selectedQuestion.number - 1].type == 'essay') {
                                      setQuillValue(
                                        selectedAnswers[questions[selectedQuestion.number - 1].id]
                                      );
                                    }
                                  }
                                }}>
                                <ChevronLeft /> Back
                              </Button>
                              <Button
                                variant={'outline'}
                                onClick={() => {
                                  if (quillValue !== '' && quillValue !== '<p><br></p>') {
                                    setSelectedAnswers((prev) => ({
                                      ...prev,
                                      [selectedQuestion?.question.id]: quillValue
                                    }));
                                  }

                                  setQuillValue('');

                                  if (
                                    questions[selectedQuestion.number + 1] !== null &&
                                    questions[selectedQuestion.number + 1] !== undefined
                                  ) {
                                    setSelectedQuestion({
                                      question: questions[selectedQuestion.number + 1],
                                      number: selectedQuestion.number + 1
                                    });

                                    if (questions[selectedQuestion.number + 1].type == 'essay') {
                                      setQuillValue('');
                                      setQuillValue(
                                        selectedAnswers[questions[selectedQuestion.number + 1].id]
                                      );
                                    }
                                  } else {
                                    setSubmitState(2);
                                  }
                                }}>
                                <ChevronRight /> Next
                              </Button>
                            </div>
                          </>
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

                        <div className={'flex gap-3 mt-5'}>
                          <Button
                            variant={'outline'}
                            onClick={() => {
                              setQuillValue('');
                              if (
                                questions[selectedQuestion.number - 1] !== null &&
                                questions[selectedQuestion.number - 1] !== undefined
                              ) {
                                setSelectedQuestion({
                                  question: questions[selectedQuestion.number - 1],
                                  number: selectedQuestion.number - 1
                                });

                                if (questions[selectedQuestion.number - 1].type == 'essay') {
                                  setQuillValue('');
                                  setQuillValue(
                                    selectedAnswers[questions[selectedQuestion.number + 1].id]
                                  );
                                }
                              }
                            }}>
                            <ChevronLeft /> Back
                          </Button>
                          <Button
                            variant={'outline'}
                            onClick={() => {
                              setQuillValue('');
                              if (
                                questions[selectedQuestion.number + 1] !== null &&
                                questions[selectedQuestion.number + 1] !== undefined
                              ) {
                                setSelectedQuestion({
                                  question: questions[selectedQuestion.number + 1],
                                  number: selectedQuestion.number + 1
                                });

                                if (questions[selectedQuestion.number + 1].type == 'essay') {
                                  setQuillValue('');
                                  setQuillValue(
                                    selectedAnswers[questions[selectedQuestion.number + 1].id]
                                  );
                                }
                              } else {
                                setSubmitState(2);
                              }
                            }}>
                            <ChevronRight /> Next
                          </Button>

                          {selectedAnswers[selectedQuestion?.question.id] &&
                          selectedQuestion?.question.type == 'multiple' ? (
                            <Button
                              variant={'outline'}
                              onClick={() => {
                                setSelectedAnswers((prev) => {
                                  const updatedAnswers = { ...prev };
                                  delete updatedAnswers[selectedQuestion?.question.id];
                                  return updatedAnswers;
                                });
                              }}>
                              <Eraser /> Clear Option
                            </Button>
                          ) : (
                            ''
                          )}
                        </div>
                      </RadioGroup>
                    )}
                  </div>
                </div>
              ) : (
                ''
              )}
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
            <Webcam />
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

                      if (questions[index].type == 'essay') {
                        setQuillValue('');
                        setQuillValue(selectedAnswers[questions[index].id]);
                      }
                    }}
                    key={index}
                    className={'border rounded-lg flex justify-center flex-col items-center'}>
                    <span
                      className={
                        'my-2 ' +
                        (selectedQuestion.number === index ? 'underline underline-offset-2' : '')
                      }>
                      {index + 1}
                    </span>
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
                      if (quillValue !== '' && quillValue !== '<p><br></p>') {
                        setSelectedAnswers((prev) => ({
                          ...prev,
                          [selectedQuestion?.question.id]: quillValue
                        }));
                      }

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

      <BottomBar />

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
    </div>
  );
}
