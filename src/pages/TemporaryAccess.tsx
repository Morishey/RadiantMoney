import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader, Clock, AlertCircle, CheckCircle } from 'lucide-react';

const TemporaryAccess: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { verifyTemporaryAccess } = useAuth();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Invalid access link');
        return;
      }

      try {
        const isValid = await verifyTemporaryAccess(token);
        
        if (isValid) {
          setStatus('success');
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setStatus('error');
          setErrorMessage('This link has expired or has already been used on another device');
        }
      } catch (error) {
        setStatus('error');
        setErrorMessage('An error occurred. Please try again.');
      }
    };

    verifyToken();
  }, [token, verifyTemporaryAccess, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'verifying' && (
          <>
            <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader size={40} className="text-purple-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifying Access</h1>
            <p className="text-gray-600">Please wait while we verify your temporary access...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Granted!</h1>
            <p className="text-gray-600 mb-4">You now have 24-hour access to the dashboard.</p>
            <div className="bg-purple-50 rounded-lg p-4 flex items-center gap-3 text-purple-700">
              <Clock size={20} />
              <span className="text-sm">Your session will expire in 24 hours</span>
            </div>
            <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-purple-600 text-white py-3 px-4 rounded-xl hover:bg-purple-700 transition font-semibold"
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TemporaryAccess;

