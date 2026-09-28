'use client';

import { useState, useEffect } from 'react';
import { QrCode, Smartphone, Monitor, RefreshCw, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

interface ScanLog {
  id: string;
  ip_address: string | null;
  device_type: string | null;
  os: string | null;
  browser: string | null;
  scanned_at: string;
}

interface QrData {
  qr_info: {
    id: string;
    slug: string;
    target_url: string;
    updated_at: string;
  };
  qr_svg: string;
  scan_url: string;
  total_scans: number;
  recent_logs: ScanLog[];
}

export default function QrAdminPage() {
  const [data, setData] = useState<QrData | null>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/qr');
      setData(res.data);
      setTargetUrl(res.data.qr_info.target_url);
    } catch (err) {
      toast.error('Failed to load QR code analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setUpdating(true);
      await axios.put('/api/admin/qr', { new_target_url: targetUrl });
      toast.success('Dynamic destination updated successfully!');
      fetchAnalytics();
    } catch (err) {
      toast.error('Failed to update target destination');
    } finally {
      setUpdating(false);
    }
  };

  const handleCopyLink = () => {
    if (data?.scan_url) {
      navigator.clipboard.writeText(data.scan_url);
      setCopied(true);
      toast.success('Redirect URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[400px]">
        <RefreshCw className="w-8 h-8 animate-spin text-pcfi-green-600 mb-2" />
        <p className="text-sm">Loading Dynamic QR Manager...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <QrCode className="w-7 h-7 text-pcfi-green-600" /> Master Dynamic QR Code
          </h1>
          <p className="text-sm text-gray-500">Configure public redirect target and monitor scan engagements.</p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-3.5 py-2 rounded-xl text-gray-700 hover:bg-gray-50 transition shadow-sm font-medium"
        >
          <RefreshCw className="w-4 h-4 text-gray-500" /> Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Printable QR Code Display */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center flex flex-col items-center justify-center shadow-sm">
          <div 
            className="p-4 bg-pcfi-green-50 rounded-2xl border border-pcfi-green-100 mb-4 inline-block shadow-inner"
            dangerouslySetInnerHTML={{ __html: data?.qr_svg || '' }} 
          />
          <h3 className="font-bold text-gray-900 text-base">Master Company QR</h3>
          <p className="text-xs text-gray-500 mt-1 mb-3">Permanent Print Vector / Editable Target</p>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-pcfi-green-100 text-pcfi-green-700">
            <ShieldCheck className="w-3.5 h-3.5" /> 302 Dynamic Engine Active
          </span>
        </div>

        {/* Dynamic Destination Configuration */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Configuration & Status</h2>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Scans</span>
                <p className="text-3xl font-black text-pcfi-green-800 mt-1">{data?.total_scans}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">Last Modified</span>
                <p className="text-sm font-semibold text-gray-800 mt-2">
                  {data?.qr_info.updated_at ? new Date(data.qr_info.updated_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Active Redirect Destination URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    required
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pcfi-green-500 focus:outline-none text-sm"
                    placeholder="https://progressivecattlefodderindustries.com/target"
                  />
                  <button
                    type="submit"
                    disabled={updating}
                    className="bg-pcfi-green-800 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:bg-pcfi-green-900 transition disabled:opacity-50 shrink-0"
                  >
                    {updating ? 'Saving...' : 'Update Target'}
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <span>Public Scan Link: <code className="bg-gray-100 px-2 py-0.5 rounded text-gray-800 font-mono">{data?.scan_url}</code></span>
              <button onClick={handleCopyLink} className="p-1 hover:text-pcfi-green-700" title="Copy redirect link">
                {copied ? <Check className="w-3.5 h-3.5 text-pcfi-green-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <a 
              href={data?.qr_info.target_url} 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center gap-1 text-pcfi-green-700 hover:underline font-medium"
            >
              Test Destination <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Analytics Log Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Scan Analytics & User Info Logs</h3>
          <span className="text-xs text-gray-500 font-medium">Recent 50 Events</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Device</th>
                <th className="px-6 py-3">IP Address</th>
                <th className="px-6 py-3">Operating System</th>
                <th className="px-6 py-3">Browser</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.recent_logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/60 transition">
                  <td className="px-6 py-3.5 text-gray-600 whitespace-nowrap text-xs">
                    {new Date(log.scanned_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-3.5 font-medium text-gray-900">
                    <span className="flex items-center gap-1.5 text-xs">
                      {log.device_type === 'Mobile' ? (
                        <Smartphone className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Monitor className="w-4 h-4 text-blue-600" />
                      )}
                      {log.device_type || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 font-mono text-xs text-gray-500">
                    {log.ip_address || '127.0.0.1'}
                  </td>
                  <td className="px-6 py-3.5 text-gray-600 text-xs">{log.os || 'N/A'}</td>
                  <td className="px-6 py-3.5 text-gray-600 text-xs">{log.browser || 'N/A'}</td>
                </tr>
              ))}
              {data?.recent_logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                    No scan activity recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}