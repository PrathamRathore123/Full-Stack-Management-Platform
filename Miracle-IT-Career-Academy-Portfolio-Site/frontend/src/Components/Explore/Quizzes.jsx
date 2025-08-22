import React, { useState, useEffect } from 'react';
import './components.css';
import { fetchQuizzes } from '../../api';

const Quizzes = () => {
  const [quizzesList, setQuizzesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getQuizzes = async () => {
      try {
        setLoading(true);
        const data = await fetchQuizzes();
        setQuizzesList(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load quizzes. Please try again later.');
        setLoading(false);
        console.error('Error fetching quizzes:', err);
      }
    };

    getQuizzes();
  }, []);

  if (loading) {
    return <div className="loading">Loading quizzes...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="quizzes-container">
      <h2>Take a Quiz</h2>
      <p>Test your knowledge and skills with our interactive quizzes.</p>
      
      <div className="quizzes-list">
        {quizzesList.length > 0 ? (
          quizzesList.map((quiz) => (
            <div className="quiz-card" key={quiz.id}>
              <div className="quiz-image">
                <img src={quiz.image} alt={quiz.title} />
              </div>
              <div className="quiz-details">
                <h3>{quiz.title}</h3>
                <p>{quiz.description}</p>
                <div className="quiz-meta">
                  <span><strong>Questions:</strong> {quiz.questions}</span>
                  <span><strong>Time:</strong> {quiz.time}</span>
                  <span><strong>Difficulty:</strong> {quiz.difficulty}</span>
                </div>
                <button className="start-quiz-btn">Start Quiz</button>
              </div>
            </div>
          ))
        ) : (
          <p>No quizzes available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default Quizzes;