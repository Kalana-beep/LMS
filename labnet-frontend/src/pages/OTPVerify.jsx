import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OTPVerify = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyOTP } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  if (!email) navigate('/register');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await verifyOTP(email, otp);
      navigate('/subscription/activate');
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-8 max-w-md w-full text-center">
        <h2 className="text-3xl font-bold mb-2">Verify OTP</h2>
        <p className="text-gray-400 mb-6">Enter the code sent to {email}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" maxLength={6} required className="glass-input w-full text-center text-2xl tracking-widest" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" />
          <button type="submit" disabled={loading} className="btn-primary w-full py-2 rounded-lg">{loading ? 'Verifying...' : 'Verify'}</button>
        </form>
      </div>
    </div>
  );
};
export default OTPVerify;