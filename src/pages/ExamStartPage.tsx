import { useCallback, useEffect, useRef, useState } from 'react';
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
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog.tsx';
import face_recognition_image from '@/assets/face_recognition.png';
Quill.register('modules/resize', QuillResizeImage);

export default function ExamStartPage() {
  const [examData, setExamData] = useState<any>(null);
  const [quillValue, setQuillValue] = useState('');
  const [editorConfig] = useState<any>(null);
  const [submitState, setSubmitState] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState<any>();

  const navigate = useNavigate();

  // bagian proctoring
  const webcamRef = useRef<Webcam | null>(null);
  // const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [faceLandmarker, setFaceLandmarker] = useState<FaceLandmarker | null>(null);
  const [runningMode, setRunningMode] = useState<'IMAGE' | 'VIDEO'>('IMAGE');
  let lastScreenshotTime: number | null = null;
  const [cameraAlert, setCameraAlert] = useState(false);
  const [cameraAlertDialogDesc, setCameraAlertDialogDesc] = useState('');

  // state untuk menyimpan data proctoring
  const [movementDescription, setMovementDescription] = useState('');
  const [banyakOrang, setBanyakOrang] = useState('');

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

  const createFaceLandmarker = async () => {
    // @ts-ignore
    const filesetResolver = await FilesetResolver.forVisionTasks(
      // 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
      `./mediapipe/wasm`
    );

    const landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
      baseOptions: {
        // modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
        modelAssetPath: './face_landmarker.task',
        delegate: 'GPU'
      },
      outputFaceBlendshapes: true,
      runningMode,
      numFaces: 3
    });
    setFaceLandmarker(landmarker);
  };

  const detectMovement = (faceBlendShapes: any) => {
    if (faceBlendShapes.categories[16].score > 0.7 && faceBlendShapes.categories[13].score > 0.7) {
      setMovementDescription('Melirik ke kanan');
      capture();
    }

    if (faceBlendShapes.categories[15].score > 0.7 && faceBlendShapes.categories[14].score > 0.7) {
      setMovementDescription('Melirik ke kiri');
      capture();
    }

    if (
      faceBlendShapes.categories[11].score > 0.82 &&
      faceBlendShapes.categories[12].score > 0.82
    ) {
      setMovementDescription('Melirik ke bawah');
      capture();
    }

    if (faceBlendShapes.categories[17].score > 0.2 && faceBlendShapes.categories[18].score > 0.2) {
      setMovementDescription('Melirik ke atas');
      capture();
    }
  };

  const getBanyakOrangMessage = (banyakOrang: number) => {
    if (banyakOrang > 0 && banyakOrang < 2) {
      setCameraAlert(false);
      setCameraAlertDialogDesc('');
      return `Terdeteksi ada ${banyakOrang} di dalam frame.`;
    } else if (banyakOrang > 1) {
      setCameraAlert(true);
      setCameraAlertDialogDesc(
        `${banyakOrang} people were detected. 'The exam cannot continue if there are more than one people detected on camera because proctoring is active on this exam.'`
      );
      return `Terdeteksi ada ${banyakOrang} di dalam frame.`;
    } else {
      setCameraAlert(true);
      setCameraAlertDialogDesc(
        'The exam cannot continue if you are not detected on camera because proctoring is active on this exam.'
      );
      return 'Tidak ada orang terdeteksi.';
    }
  };

  const predictWebcam = async () => {
    if (!faceLandmarker || !webcamRef.current) return;

    const video = webcamRef.current.video as HTMLVideoElement;
    // const drawingUtils = new DrawingUtils(ctx!);

    if (runningMode === 'IMAGE') {
      setRunningMode('VIDEO');
      await faceLandmarker.setOptions({ runningMode: 'VIDEO' });
    }

    const processFrame = async () => {
      const startTimeMs = performance.now();
      const results = faceLandmarker.detectForVideo(video, startTimeMs);

      // mengembalikan message banyak orang terdeteksi.
      setBanyakOrang(getBanyakOrangMessage(results.faceLandmarks.length));

      if (results.faceLandmarks) {
        // results.faceLandmarks.forEach((landmarks: any) => {
        results.faceLandmarks.forEach(() => {
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_TESSELATION, {
          //   color: '#C0C0C070',
          //   lineWidth: 1
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE, {
          //   color: '#FF3030'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW, {
          //   color: '#FF3030'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYE, {
          //   color: '#30FF30'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW, {
          //   color: '#30FF30'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_FACE_OVAL, {
          //   color: '#E0E0E0'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LIPS, {
          //   color: '#E0E0E0'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS, {
          //   color: '#FF3030'
          // });
          // drawingUtils.drawConnectors(landmarks, FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS, {
          //   color: '#30FF30'
          // });
          detectMovement(results.faceBlendshapes[0]);
        });
        // detectMovement(results.faceBlendshapes[0]);
      }

      // console.log(results);
      requestAnimationFrame(processFrame);
    };

    processFrame().then();
  };

  const saveImage = async (image: any) => {
    // @ts-ignore
    const saveImageResponse = await window.electron.save_image(image);
  };

  const capture = useCallback(() => {
    console.log(lastScreenshotTime);
    if (lastScreenshotTime == null) {
      lastScreenshotTime = new Date().getTime();
      const imageSrc = webcamRef.current!.getScreenshot();
      saveImage(imageSrc).then();
    } else {
      if (new Date().getTime() - lastScreenshotTime > 3000) {
        lastScreenshotTime = new Date().getTime();
        const imageSrc = webcamRef.current!.getScreenshot();
        saveImage(imageSrc).then();
      }
    }
  }, [webcamRef]);

  useEffect(() => {
    createFaceLandmarker().then();
  }, []);

  const handleValueChange = (questionId: number, value: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: value
    }));
  };

  useEffect(() => {
    if (faceLandmarker && webcamRef.current) {
      const video = webcamRef.current.video as HTMLVideoElement;
      video.addEventListener('loadeddata', () => {
        predictWebcam().then();
      });
    }
  }, [faceLandmarker]);

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
                'flex flex-col w-full overflow-y-auto scroll-smooth border rounded-lg px-5 pb-5 justify-center items-center'
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
            <Webcam
              ref={webcamRef}
              mirrored={true}
              screenshotFormat={'image/jpeg'}
              // className={'hidden'}
            />
            <div>
              <span>{movementDescription}</span> <br />
              <span>{banyakOrang}</span>
            </div>
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

      <AlertDialog open={cameraAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unusual Behaviour Detected</AlertDialogTitle>
            <AlertDialogDescription>
              <div className={'flex items-center justify-center w-full mt-5 mb-3'}>
                <img
                  className={'w-48'}
                  src={face_recognition_image}
                  loading={'eager'}
                  alt="face_recognition"
                />
              </div>
              {cameraAlertDialogDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
