import React, { useRef, useState, useEffect } from "react";
import "./styles.css";
import quizData from "../../assets/quizData.json";
import ProgressBar from "../ProgressBar";

const Quiz = () => {
  const [index, setIndex] = useState(0);
  const [question, setQuestion] = useState(quizData[index]);
  const [lock, setLock] = useState(false);
  const [score, setScore] = useState(0);
  const [result, SetResult] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [textAnswer, setTextAnswer] = useState("");
  const [animationState, setAnimationState] = useState('question-enter');
  const [previousIndex, setPreviousIndex] = useState(null);

  const OptionRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  useEffect(() => {
    setAnimationState('question-enter');
    const timer = setTimeout(() => setAnimationState('question-visible'), 10);
    return () => clearTimeout(timer);
  }, [index]);

  const CheckAnswer = (e, ans) => {
    if (!lock) {
      let newSelectedAnswers = [...selectedAnswers];
      if (newSelectedAnswers.includes(ans)) {
        newSelectedAnswers = newSelectedAnswers.filter(item => item !== ans);
        e.target.classList.remove("selected");
      } else {
        newSelectedAnswers.push(ans);
        e.target.classList.add("selected");
      }
      setSelectedAnswers(newSelectedAnswers);
    }
  };

  const handleTextAnswerChange = (e) => {
    setTextAnswer(e.target.value);
  };

  const handleNextQuestion = () => {
    if (!lock) {
      let isCorrect = false;
      if (question.type === 'multiple-choice') {
        const correctAnswers = Array.isArray(question.ans) ? question.ans : [question.ans];
        isCorrect = correctAnswers.sort().join() === selectedAnswers.sort().join();
        if (isCorrect) {
          correctAnswers.forEach(ans => {
            const ref = OptionRefs[ans - 1];
            if (ref.current) {
              ref.current.classList.add("correct");
            }
          });
          if (index < quizData.length - 1) { 
            setScore(prev => prev + 1);
          }
        } else {
          selectedAnswers.forEach(ans => {
            const ref = OptionRefs[ans - 1];
            if (ref.current) {
              ref.current.classList.add("incorrect");
            }
          });
          correctAnswers.forEach(ans => {
            const ref = OptionRefs[ans - 1];
            if (ref.current) {
              ref.current.classList.add("correct");
            }
          });
        }
      } else if (question.type === 'text') {
        if (textAnswer.trim() !== "") {
          isCorrect = true; 
        }
      }

      setLock(false);
      setAnimationState('question-exit');
      setTimeout(() => {
        const nextQuestionIndex = index + 1;

        if (nextQuestionIndex >= quizData.length) {
          SetResult(true);
          return;
        }

        setPreviousIndex(index);
        setIndex(nextQuestionIndex);
        setQuestion(quizData[nextQuestionIndex]);
        setSelectedAnswers([]);
        setTextAnswer(""); 
        OptionRefs.forEach(ref => {
          if (ref.current) {
            ref.current.classList.remove("incorrect");
            ref.current.classList.remove("correct");
            ref.current.classList.remove("selected");
          }
        });
        setAnimationState('question-enter');
        const timer = setTimeout(() => setAnimationState('question-visible'), 10);
        return () => clearTimeout(timer);
      }, 1000);
    }
  };

  const handlePreviousQuestion = () => {
    if (previousIndex !== null) {
      setIndex(previousIndex);
      setQuestion(quizData[previousIndex]);
      setPreviousIndex(null);
      setSelectedAnswers([]);
      setTextAnswer(""); 
      OptionRefs.forEach(ref => {
        if (ref.current) {
          ref.current.classList.remove("incorrect");
          ref.current.classList.remove("correct");
          ref.current.classList.remove("selected");
        }
      });
    }
  };

  const reset = () => {
    setIndex(0);
    setQuestion(quizData[0]);
    setScore(0);
    setLock(false);
    SetResult(false);
    setSelectedAnswers([]);
    setTextAnswer(""); 
    OptionRefs.forEach(ref => {
      if (ref.current) {
        ref.current.classList.remove("incorrect");
        ref.current.classList.remove("correct");
        ref.current.classList.remove("selected");
      }
    });
  };

  return (
    <div className="container">
      <h1>Quiz Engine</h1>
      <hr className="separator" />
      {result ? (
        <>
          <h2>
            You Scored {score} out of {quizData.length}
          </h2>
          <button onClick={reset}>Reset</button>
        </>
      ) : (
        <>
          <div className={`question-container ${animationState}`}>
            <h2>
              {index + 1}. {question.question}
            </h2>
            {question.type === 'multiple-choice' ? (
              <>
                <ul>
                  {question.options.map((option, idx) => (
                    <li
                      key={idx}
                      ref={OptionRefs[idx]}
                      onClick={(e) => CheckAnswer(e, idx + 1)}
                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </>
            ) : question.type === 'text' ? (
              <input
                type="text"
                value={textAnswer}
                onChange={handleTextAnswerChange}
                placeholder="Type your name here..."
                className="input"
              />
            ) : null}
            <div className="navigation-buttons">
              {index > 0 && <button onClick={handlePreviousQuestion}>Previous</button>}
              <button onClick={handleNextQuestion}>Next</button>
            </div>
            <div className="index">
              {index + 1} of {quizData.length} questions
            </div>
            <ProgressBar current={index + 1} total={quizData.length} />
          </div>
        </>
      )}
    </div>
  );
};

export default Quiz;






