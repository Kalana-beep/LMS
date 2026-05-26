import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Reply } from 'lucide-react';

const TeacherQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await api.get('/questions/teacher/questions');
      setQuestions(res.data.questions);
    } catch (err) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = async (questionId) => {
    const answer = replyText[questionId];
    if (!answer) return toast.error('Enter an answer');
    try {
      await api.post('/questions/teacher/answer', { questionId, answer });
      toast.success('Answer sent to student');
      setReplyText({ ...replyText, [questionId]: '' });
      fetchQuestions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to answer');
    }
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Student Questions</h1>
        <div className="glass-card p-6">
          {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : questions.length === 0 ? (
            <p className="text-gray-400 text-center">No questions from students yet.</p>
          ) : (
            questions.map(q => (
              <div key={q._id} className="border-b border-white/10 py-4 last:border-0">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div className="flex-1">
                    <p className="font-semibold text-purple-300">Video: {q.videoId?.title || 'Unknown video'}</p>
                    <p className="text-sm text-gray-400">From: {q.studentName} ({q.studentId?.email})</p>
                    <p className="mt-2 text-gray-200">Q: {q.question}</p>
                    {q.answer && (
                      <div className="mt-2 pl-3 border-l-2 border-green-400">
                        <p className="text-green-300 text-sm">Your answer: {q.answer}</p>
                        <p className="text-xs text-gray-400">Answered: {new Date(q.answeredAt).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
                {!q.answer && (
                  <div className="mt-3 flex gap-2">
                    <textarea
                      rows="2"
                      placeholder="Write your answer..."
                      className="glass-input flex-1 text-sm"
                      value={replyText[q._id] || ''}
                      onChange={e => setReplyText({...replyText, [q._id]: e.target.value})}
                    />
                    <button onClick={() => handleAnswer(q._id)} className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-1">
                      <Reply size={16} /> Reply
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherQuestions;