import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, CheckCircle } from 'lucide-react';

const SubscriptionActivate = () => {
  const { activateSubscription, user } = useAuth();
  const navigate = useNavigate();

  // If already active, go to courses
  if (user?.subscriptionStatus === 'active') navigate('/courses');

  const handleActivate = async () => {
    await activateSubscription();
    navigate('/courses');  // Redirect to courses after activation
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 max-w-lg w-full text-center">
        <CreditCard size={64} className="mx-auto text-purple-400 mb-4" />
        <h2 className="text-3xl font-bold mb-4">Activate Subscription</h2>
        <p className="text-gray-300 mb-6">
          Get access to all courses, video lessons, and learning materials
        </p>
        <div className="bg-purple-900/30 rounded-lg p-4 mb-6">
          <p className="text-2xl font-bold text-purple-400">$29.99</p>
          <p className="text-sm text-gray-400">per month</p>
        </div>
        <ul className="text-left space-y-2 mb-6">
          <li className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-400" /> Unlimited course access
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle size={18} className="text-green-400" /> Certificate of completion
          </li>
        </ul>
        <button onClick={handleActivate} className="btn-primary w-full py-3 rounded-lg font-semibold">
          Activate Subscription ($29.99/mo)
        </button>
      </div>
    </div>
  );
};

export default SubscriptionActivate;