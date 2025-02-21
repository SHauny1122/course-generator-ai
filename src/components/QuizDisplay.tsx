import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { exportQuizToText } from '../utils/textExporter';

interface QuizContent {
  title: string;
  difficulty: string;
  multipleChoice: {
    question: string;
    options: string[];
    answer: string;
  }[];
  fillInBlanks: {
    question: string;
    answer: string;
  }[];
  trueFalse: {
    statement: string;
    answer: boolean;
  }[];
  shortAnswer: {
    question: string;
    answer: string;
  }[];
}

interface Props {
  quiz: {
    id: string;
    topic: string;
    difficulty: string;
    content: string;
  };
  onClose: () => void;
  onDelete?: () => void;
}

const QuizDisplay: React.FC<Props> = ({ quiz, onClose, onDelete }) => {
  const content: QuizContent = JSON.parse(quiz.content);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quiz.id);

      if (error) throw error;

      if (onDelete) {
        onDelete();
      }
      onClose();
    } catch (error) {
      console.error('Error deleting quiz:', error);
      alert('Failed to delete quiz. Please try again.');
    }
  };

  const handleDownload = () => {
    exportQuizToText(quiz);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{content.title}</h2>
          <p className="text-gray-400">Difficulty: {quiz.difficulty}</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Download
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {content.multipleChoice.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold text-white mb-4">Multiple Choice Questions</h3>
            <div className="space-y-4">
              {content.multipleChoice.map((q, i) => (
                <div key={i} className="bg-gray-700 p-4 rounded">
                  <p className="text-white mb-2">
                    {i + 1}. {q.question}
                  </p>
                  <ul className="space-y-2 ml-4">
                    {q.options.map((option, j) => (
                      <li 
                        key={j}
                        className={`text-gray-300 ${
                          option === q.answer ? 'text-green-400 font-semibold' : ''
                        }`}
                      >
                        {String.fromCharCode(97 + j)}. {option}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.fillInBlanks.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold text-white mb-4">Fill in the Blanks</h3>
            <div className="space-y-4">
              {content.fillInBlanks.map((q, i) => (
                <div key={i} className="bg-gray-700 p-4 rounded">
                  <p className="text-white mb-2">
                    {i + 1}. {q.question}
                  </p>
                  <p className="text-green-400 ml-4">Answer: {q.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.trueFalse.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold text-white mb-4">True/False Questions</h3>
            <div className="space-y-4">
              {content.trueFalse.map((q, i) => (
                <div key={i} className="bg-gray-700 p-4 rounded">
                  <p className="text-white mb-2">
                    {i + 1}. {q.statement}
                  </p>
                  <p className={`ml-4 ${q.answer ? 'text-green-400' : 'text-red-400'}`}>
                    Answer: {q.answer ? 'True' : 'False'}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.shortAnswer.length > 0 && (
          <section>
            <h3 className="text-xl font-semibold text-white mb-4">Short Answer Questions</h3>
            <div className="space-y-4">
              {content.shortAnswer.map((q, i) => (
                <div key={i} className="bg-gray-700 p-4 rounded">
                  <p className="text-white mb-2">
                    {i + 1}. {q.question}
                  </p>
                  <p className="text-green-400 ml-4">Answer: {q.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default QuizDisplay;
