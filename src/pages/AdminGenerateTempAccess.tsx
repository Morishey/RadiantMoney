import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Copy, Clock, Mail, Shield, Check } from 'lucide-react';

const AdminGenerateTempAccess: React.FC = () => {
    const { generateTemporaryAccess } = useAuth();
    const [email, setEmail] = useState('');
    const [hours, setHours] = useState(24);
    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        const token = await generateTemporaryAccess(email, hours);
        const link = `${window.location.origin}/temp-access/${token}`;
        
        setGeneratedLink(link);
        setIsLoading(false);
        setCopied(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-purple-100 p-3 rounded-xl">
                            <Shield className="w-6 h-6 text-purple-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Generate Temporary Access</h1>
                    </div>
                    
                    <form onSubmit={handleGenerate} className="space-y-5">
                        {/* Email Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <span>Email Address</span>
                                </div>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="user@example.com"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Duration Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} />
                                    <span>Access Duration</span>
                                </div>
                            </label>
                            <select
                                value={hours}
                                onChange={(e) => setHours(Number(e.target.value))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value={1}>1 hour</option>
                                <option value={6}>6 hours</option>
                                <option value={12}>12 hours</option>
                                <option value={24}>24 hours</option>
                                <option value={48}>48 hours</option>
                                <option value={72}>72 hours</option>
                            </select>
                        </div>

                        {/* Generate Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 rounded-xl hover:from-purple-700 hover:to-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Generating...' : 'Generate Access Link'}
                        </button>
                    </form>

                    {/* Generated Link Display */}
                    {generatedLink && (
                        <div className="mt-6 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                            <label className="block text-sm font-medium text-purple-700 mb-2">
                                Temporary Access Link (valid for {hours} hours)
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={generatedLink}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-lg text-sm text-gray-600"
                                />
                                <button
                                    onClick={handleCopy}
                                    className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
                                        copied 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                    }`}
                                >
                                    {copied ? (
                                        <>
                                            <Check size={16} />
                                            <span>Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} />
                                            <span>Copy</span>
                                        </>
                                    )}
                                </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                ⚠️ This link can only be used once and is tied to the first device that accesses it.
                            </p>
                        </div>
                    )}
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-xl p-6 border border-gray-100">
                    <h2 className="font-semibold text-gray-900 mb-3">How it works:</h2>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 font-bold">1.</span>
                            <span>Enter the email address of the person you want to give access to</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 font-bold">2.</span>
                            <span>Choose how long they should have access (default: 24 hours)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 font-bold">3.</span>
                            <span>Copy the generated link and share it with them</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-purple-600 font-bold">4.</span>
                            <span>When they click the link, they get {hours} hours of access on that device only</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default AdminGenerateTempAccess;