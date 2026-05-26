import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Trash2, Reply } from 'lucide-react';

const ManageContacts = () => {
  const [messages, setMessages] = useState([]);
  const [replies, setReplies] = useState({});

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await api.get('/contact/admin/all');
      setMessages(res.data.messages);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  const sendReply = async (id) => {
    const reply = replies[id];
    if (!reply) return toast.error('Enter reply');
    try {
      await api.post(`/contact/admin/reply/${id}`, { reply });
      toast.success('Reply sent');
      setReplies({ ...replies, [id]: '' });
      fetchMessages();
    } catch (err) {
      toast.error('Failed to send reply');
    }
  };

  const deleteMessage = async (id) => {
    if (confirm('Delete this message permanently?')) {
      try {
        await api.delete(`/contact/admin/${id}`);
        toast.success('Message deleted');
        fetchMessages();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  return (
    <div className="min-h-screen py-20 px-6">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Contact Messages</h1>
        <div className="glass-card p-6">
          {messages.length === 0 ? (
            <p className="text-gray-400 text-center">No messages</p>
          ) : (
            messages.map((msg) => (
              <div key={msg._id} className="border-b border-white/10 pb-4 mb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold">{msg.subject}</p>
                    <p className="text-sm text-gray-400">
                      From: {msg.senderName} ({msg.senderEmail}) | Role: {msg.senderRole} |{' '}
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                    {msg.recipientType === 'both' && (
                      <p className="text-sm text-blue-400">
                        Also sent to teacher: {msg.teacherId?.name || msg.teacherName || 'Unknown Teacher'}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        msg.status === 'both_replied'
                          ? 'bg-green-500/20 text-green-400'
                          : msg.status === 'admin_replied'
                          ? 'bg-purple-500/20 text-purple-400'
                          : msg.status === 'teacher_replied'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {msg.status}
                    </span>
                    <button
                      onClick={() => deleteMessage(msg._id)}
                      className="text-red-400 hover:text-red-300"
                      title="Delete message"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <p className="mt-2">{msg.message}</p>

                {msg.adminReply && (
                  <div className="mt-2 pl-3 border-l-2 border-purple-400">
                    <p className="text-purple-300 text-sm">Admin reply ({msg.adminRepliedBy}):</p>
                    <p>{msg.adminReply}</p>
                  </div>
                )}

                {msg.teacherReply && (
                  <div className="mt-2 pl-3 border-l-2 border-blue-400">
                    <p className="text-blue-300 text-sm">Teacher reply ({msg.teacherRepliedBy}):</p>
                    <p>{msg.teacherReply}</p>
                  </div>
                )}

                {!msg.adminReply && (
                  <div className="mt-3 flex gap-2">
                    <textarea
                      rows="2"
                      placeholder="Write reply as admin..."
                      className="glass-input flex-1 text-sm"
                      value={replies[msg._id] || ''}
                      onChange={(e) => setReplies({ ...replies, [msg._id]: e.target.value })}
                    />
                    <button
                      onClick={() => sendReply(msg._id)}
                      className="btn-primary px-4 py-1 rounded-lg text-sm flex items-center gap-1"
                    >
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

export default ManageContacts;