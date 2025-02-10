import { useEffect, useState } from 'react';
import parse from 'html-react-parser';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.tsx';
import { Checkbox } from '@/components/ui/checkbox.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import QuillResizeImage from 'quill-resize-image';
import { BottomBar } from '@/components/custom/BottomBar.tsx';
import { useNavigate } from 'react-router';
Quill.register('modules/resize', QuillResizeImage);

export default function ExamReviewPage() {
  const [examResultData, setExamResultData] = useState<any>([]);
  const [answers, setAnswers] = useState<any[]>([]);
  const [exam, setExam] = useState<any>([]);
  const [questions, setQuestions] = useState<any>();
  const [correctQuestions, setCorrectQuestions] = useState<any>({});
  const navigate = useNavigate();

  const getExamResult = async () => {
    // @ts-ignore
    const tempExamData = await window.electron.store.get('exam-data');
    // @ts-ignore
    const tempAnswers = await window.electron.store.get('answers');
    const questions = tempExamData.data.questionsData;
    console.log(questions);
    setQuestions(questions);
    // @ts-ignore
    const nim = await window.electron.store.get('user-nim');

    let tempTotalScore = 0;
    let tempScore = 0;
    let correctQuestion: any = {};

    questions.forEach((question: any) => {
      if (question.type === 'multiple') {
        question.options.forEach((option: any) => {
          if (option.id === tempAnswers.data[question.id] && option.isCorrect) {
            tempScore = tempScore + +question.point;
            correctQuestion = {
              ...correctQuestion,
              [question.id]: +question.point
            };
          }
        });
      } else if (question.type === 'check-box') {
        question.options.forEach((option: any) => {
          if (+option.id.split('.')[0] === question.id) {
            try {
              tempAnswers.data[question.id].forEach((answer: any) => {
                if (answer === option.id && option.isCorrect) {
                  tempScore =
                    tempScore +
                    (1 / question.options.filter((tmp: any) => tmp.isCorrect).length) *
                      question.point;

                  correctQuestion = {
                    ...correctQuestion,
                    [question.id]:
                      (correctQuestion[question.id] ? correctQuestion[question.id] : 0) +
                      (1 / question.options.filter((tmp: any) => tmp.isCorrect).length) *
                        question.point
                  };
                }
              });
            } catch (e: any) {
              console.log(e);
              return;
            }
          }
        });
      }

      tempTotalScore = tempTotalScore + +question.point;
    });

    setCorrectQuestions(correctQuestion);

    setExamResultData({
      exam_id: exam.id,
      user_username: nim,
      total_score: tempScore,
      expected_score: tempTotalScore,
      attempt: examResultData.length + 1,
      created_at: new Date(),
      answers: tempAnswers.data
    });

    setAnswers(tempAnswers.data);
    setExam(tempExamData.data.examData);
  };

  const handleSubmitExam = async () => {
    // @ts-ignore
    // await window.electron.store.save('exam-result', [examResultData]);
    navigate('/exam');
  };

  useEffect(() => {
    getExamResult().then();
  }, []);

  return (
    <div>
      <div id={'card-utama'} className={'w-full p-10 h-[calc(100vh-57px)]'}>
        <h3 className={'font-bold text-xl mb-5'}>
          Result of {exam ? exam.title : ''} {exam?.course_title}
        </h3>

        <div className={'flex gap-5 h-full pb-10'}>
          {/*sebelah kiri*/}
          <div
            className={
              'flex flex-col w-full overflow-y-scroll scroll-smooth border rounded-lg px-5 pb-5'
            }>
            {questions?.map((question: any, index: number) => (
              <div
                key={index}
                id={`question${index}`}
                className={'flex gap-3 rounded-lg p-5 pb-0 mr-5'}>
                <div>{index + 1}.</div>
                <div className={'w-full h-auto'}>
                  {parse(question.content)}
                  {question.type === 'essay' ? (
                    <div className={'mt-3'}>
                      <span className={'font-bold'}>Your answer :</span>

                      <div className={'border w-full rounded-lg p-2 mt-1'}>
                        {answers[question.id] ? parse(answers[question.id]) : ''}
                      </div>
                    </div>
                  ) : (
                    <RadioGroup value={question.answer} className={'flex ms-5 flex-col mt-2'}>
                      {question.options.map((option: any, optionIndex: number) => (
                        <div key={optionIndex} className={'flex items-center gap-3'}>
                          <div>
                            {question.type === 'multiple' ? (
                              <div className={'flex items-center gap-3'}>
                                <RadioGroupItem
                                  value={option.id}
                                  checked={(answers[question.id] || []).includes(option.id)}
                                  aria-readonly={true}
                                />
                                {String.fromCharCode(97 + optionIndex)}.
                              </div>
                            ) : (
                              ''
                            )}

                            {question.type === 'check-box' ? (
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${option.id}`}
                                  aria-readonly={true}
                                  checked={(question.answer || []).includes(option.id)}
                                />
                              </div>
                            ) : (
                              ''
                            )}
                          </div>
                          <div className={option.isCorrect ? 'bg-green-300' : ''}>
                            {question.type === 'multiple' ? <div>{parse(option.option)}</div> : ''}

                            {question.type === 'check-box' ? (
                              <label
                                htmlFor={`${option.id}`}
                                className={`peer-disabled:cursor-not-allowed peer-disabled:opacity-70`}>
                                {parse(option.option)}
                              </label>
                            ) : (
                              ''
                            )}
                          </div>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  <div className={'mt-2 text-muted-foreground'}>
                    {`Point : ${correctQuestions[question.id] ? correctQuestions[question.id] : '0'} of ${question.point}. `}
                    <span className={'font-semibold'}>
                      {question.type === 'essay' ? '(Not yet assessed by lecturer.)' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/*sebelah kanan*/}
          <div className={'max-w-xs w-full flex flex-col gap-5'}>
            <div className={'border rounded-lg p-5 flex flex-col'}>
              <span className={'font-bold mb-5'}>Question List</span>

              <div className={'grid grid-cols-5 gap-2'}>
                {questions?.map((question: any, index: number) => (
                  <div
                    key={index}
                    className={'border rounded-lg flex justify-center flex-col items-center'}>
                    <span className={'my-2'}>{index + 1}</span>
                    <div
                      className={`w-full h-6 rounded-b-lg ${answers[question.id] ? 'bg-muted-foreground' : 'bg-muted'}`}></div>
                  </div>
                ))}
              </div>
            </div>

            <div className={'border rounded-lg w-full flex flex-col p-5'}>
              <span className={'font-bold'}>Grade</span>

              <div className={'mt-3 text-center w-full text-3xl'}>
                {((examResultData?.total_score / examResultData?.expected_score) * 100).toFixed(2)}{' '}
                / 100.00
              </div>
            </div>

            <div className={'border rounded-lg w-full flex flex-col p-5'}>
              <span className={'font-bold'}>Status</span>

              {(examResultData?.total_score / examResultData?.expected_score) * 100 >=
              exam?.passing_grade ? (
                <div className={'mt-3 text-center w-full text-3xl text-green-500 font-bold'}>
                  Passed
                </div>
              ) : (
                <div className={'mt-3 text-center w-full text-3xl text-red-400 font-bold'}>
                  Not Pass
                </div>
              )}

              <div className={'text-center text-muted-foreground mt-2'}>
                Passing Grade : {exam?.passing_grade}
              </div>
            </div>

            <div className={'flex gap-3'}>
              <Button
                onClick={() => {
                  handleSubmitExam().then();
                }}
              >
                Done Review
              </Button>
            </div>
          </div>
        </div>
      </div>

      <BottomBar />
    </div>
  );
}
