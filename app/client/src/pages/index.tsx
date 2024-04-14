import { useState, ChangeEvent, FormEvent } from 'react';

type Question = {
  question: string;
  options: string[];
  answer: string;
};

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const handleAnswerChange = (questionIdx: number, selectedOption: string) => {
    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [questionIdx]: selectedOption,
    }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (file) {
      formData.append('file', file);
    }

    fetch('/api/generate-quiz', {
      method: 'POST',
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setQuestions(data.questions_and_answers || []);
        setAnswers({});
        setScore(null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error:', error);
        setLoading(false);
      });
  };

  const handleScoreSubmit = () => {
    const calculatedScore = questions.reduce((acc, question, index) => {
      if (answers[index] === question.answer) {
        return acc + 1;
      }
      return acc;
    }, 0);
    setScore(calculatedScore);
  };

  const allAnswersProvided = questions.length > 0 && Object.keys(answers).length === questions.length;

  return (
    <div className='h-full w-full bg-gray-100 min-h-screen py-8'>
      <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit}>
          <label className="block mb-2 font-bold text-gray-700" htmlFor="file">
            Cargar Archvo PDF en UNIFY (el Software Revolucionario de la UNRC :)
          </label>
          <input
            type="file"
            id="file"
            name="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="p-2 border border-gray-300 rounded"
          />
          <button
            className="bg-blue-500 my-4 ml-4 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={!file || loading}
          >
            {loading ? 'Cargando sus preguntas super copadas...' : 'Generar Cuestionario!'}
          </button>
        </form>
        {loading && <div className="mx-auto loader"></div>}
        {questions.map((q, index) => (
          <div key={index} className="mb-6">
            <p className="text-lg font-semibold"><span className='font-bold text-xl text-blue-700'>{index + 1}.</span> {q.question}</p>
            <div>
              {q.options.map((option, idx) => (
                <label key={idx} className={`block mb-2 mt-2 px-4 py-2 rounded-lg cursor-pointer ${!score && answers[index] === option ? 'bg-gray-300' : ''} ${(score !== null && (option === answers[index] || option === q.answer)) ? (option === q.answer ? 'bg-green-300' : 'bg-red-300') : ''}`}>
                  <input
                    type="radio"
                    name={`question_${index}`}
                    value={option}
                    onChange={() => handleAnswerChange(index, option)}
                    checked={answers[index] === option}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
        {questions.length > 0 && (
          <button
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline my-4"
            onClick={handleScoreSubmit}
            disabled={!allAnswersProvided}
          >
            Enviar Respuestas
          </button>
        )}
        {score !== null && (
          <p className="text-xl font-bold">
            <span className='text-blue-900'>Su puntaje:</span> {score} / {questions.length}
          </p>
        )}
      </div>
    </div>
  );
}