import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Send, Bell, User, Users, ShieldAlert, CheckCircle, 
  Smartphone, Monitor, RefreshCw, HelpCircle, Play, Info, AlertCircle,
  FileCode
} from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { fcmApi } from "@/lib/api";

const FcmTestDashboard = () => {
  // Notification Form State
  const [target, setTarget] = useState('single_user'); // 'single_user' | 'broadcast_customers' | 'broadcast_drivers'
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientRole, setRecipientRole] = useState('user'); // 'user' | 'vendor'
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [deepLink, setDeepLink] = useState('');
  const [priority, setPriority] = useState('high');
  const [loading, setLoading] = useState(false);

  // Self Test state
  const [testingSelf, setTestingSelf] = useState(false);
  const [localToken, setLocalToken] = useState('');
  const [permissionStatus, setPermissionStatus] = useState('');

  // Stats log
  const [stats, setStats] = useState({
    totalSent: 0,
    successful: 0,
    failed: 0,
  });
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    // Read local permission and token
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
    const token = localStorage.getItem('gtgl_fcm_token');
    if (token) {
      setLocalToken(token);
    }
  }, []);

  const addLog = (type, message, details = null) => {
    setLogs(prev => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
        type, // 'success' | 'error' | 'info'
        message,
        details
      },
      ...prev.slice(0, 19) // Limit to 20 logs
    ]);
  };

  const handleTestSelf = async () => {
    setTestingSelf(true);
    addLog('info', 'Triggering self-test push notification request...');
    try {
      const response = await fcmApi.sendTest();
      
      if (response && response.success) {
        toast.success("Test notification sent successfully!");
        addLog('success', 'Self test notification sent.', `Result: ${JSON.stringify(response.data || response)}`);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalSent: prev.totalSent + 1,
          successful: prev.successful + 1
        }));
      } else {
        const errMsg = response?.message || "Failed to send test notification.";
        toast.error(errMsg);
        addLog('error', 'Self-test notification failed.', errMsg);
        
        setStats(prev => ({
          ...prev,
          totalSent: prev.totalSent + 1,
          failed: prev.failed + 1
        }));
      }
    } catch (err) {
      console.error(err);
      const errMsg = err?.message || err || "Internal server error occurred.";
      toast.error(errMsg);
      addLog('error', 'Self-test dispatch failed.', errMsg);
      
      setStats(prev => ({
        ...prev,
        totalSent: prev.totalSent + 1,
        failed: prev.failed + 1
      }));
    } finally {
      setTestingSelf(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and Body are required fields.");
      return;
    }
    if (target === 'single_user' && !recipientPhone.trim()) {
      toast.error("Phone number is required for targeting a single user.");
      return;
    }

    setLoading(true);
    addLog('info', `Dispatching notification targeting: ${target}...`);
    
    try {
      const payload = {
        target,
        title,
        body,
        priority,
        image: imageUrl.trim() || undefined,
        deepLink: deepLink.trim() || undefined,
        recipientPhone: target === 'single_user' ? recipientPhone.trim() : undefined,
        recipientRole: target === 'single_user' ? recipientRole : undefined
      };

      const response = await fcmApi.adminSend(payload);

      if (response && response.success) {
        const resultData = response.data || response;
        const sentCount = resultData.sentCount || 0;
        const failedCount = resultData.failedCount || 0;
        
        toast.success(`Notification request complete! Sent: ${sentCount}, Failed: ${failedCount}`);
        addLog('success', `Dispatch completed for ${target}.`, `Sent: ${sentCount}, Failed: ${failedCount}`);
        
        setStats(prev => ({
          totalSent: prev.totalSent + (sentCount + failedCount),
          successful: prev.successful + sentCount,
          failed: prev.failed + failedCount
        }));

        // Reset form except fields like priority or deep link
        setTitle('');
        setBody('');
        setImageUrl('');
      } else {
        const errMsg = response?.message || "Notification dispatch failed.";
        toast.error(errMsg);
        addLog('error', 'Notification dispatch failed.', errMsg);
        
        setStats(prev => ({
          ...prev,
          totalSent: prev.totalSent + 1,
          failed: prev.failed + 1
        }));
      }
    } catch (err) {
      console.error(err);
      const errMsg = err?.message || err || "Internal server error occurred.";
      toast.error(errMsg);
      addLog('error', 'API dispatch failed with exception.', errMsg);
      
      setStats(prev => ({
        ...prev,
        totalSent: prev.totalSent + 1,
        failed: prev.failed + 1
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestPermission = async () => {
    if (!('Notification' in window)) {
      toast.error("This browser does not support notifications.");
      return;
    }
    
    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      if (permission === 'granted') {
        toast.success("Notification permission granted!");
        // Dynamically initialize push notifications to obtain token
        import("../../../services/pushNotificationService").then(({ initializePushNotifications }) => {
          initializePushNotifications().then(token => {
            if (token) {
              setLocalToken(token);
              addLog('success', 'FCM Token generated and stored locally.');
            }
          });
        });
      } else {
        toast.warn(`Notification permission: ${permission}`);
      }
    } catch (err) {
      toast.error("Failed to request permission.");
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="FCM Dashboard & Testing" 
        subtitle="Manage, test, and broadcast push notifications to users and vendors" 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card p-6 bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-xl">
            <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <Bell className="w-5 h-5 text-primary animate-pulse" />
              Notification Dispatcher
            </h3>

            <form onSubmit={handleSendNotification} className="space-y-6">
              
              {/* Target Selector */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Target Audience
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'single_user', label: 'Single User', icon: User },
                    { id: 'broadcast_customers', label: 'All Customers', icon: Users },
                    { id: 'broadcast_drivers', label: 'All Drivers', icon: Users },
                  ].map((t) => {
                    const Icon = t.icon;
                    const isSelected = target === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTarget(t.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
                          isSelected 
                            ? "bg-primary/10 border-primary text-primary shadow-md" 
                            : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-400 dark:hover:border-zinc-700"
                        }`}
                      >
                        <Icon className="w-5 h-5 mb-2" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Single User Target details */}
              {target === 'single_user' && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800"
                >
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      User Role
                    </label>
                    <select
                      value={recipientRole}
                      onChange={(e) => setRecipientRole(e.target.value)}
                      className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-white uppercase tracking-wider focus:outline-none focus:ring-1 focus:ring-primary"
                    >
                      <option value="user">Customer (User)</option>
                      <option value="vendor">Driver (Vendor)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      Registered Phone Number
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g. +919876543210"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      className="h-10 text-xs dark:bg-zinc-950 dark:border-zinc-800"
                    />
                  </div>
                </motion.div>
              )}

              {/* Title & Body */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    Notification Title
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="Enter notification headline..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-10 text-xs dark:bg-zinc-950 dark:border-zinc-800 font-semibold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    Notification Body (Message)
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Enter message details here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    className="w-full p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Extras: Image & Deep Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    Image URL (Optional)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/banner.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="h-10 text-xs dark:bg-zinc-950 dark:border-zinc-800"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                    Target Route / Deep Link
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. /driver/leads or /user/requests"
                    value={deepLink}
                    onChange={(e) => setDeepLink(e.target.value)}
                    className="h-10 text-xs dark:bg-zinc-950 dark:border-zinc-800"
                  />
                </div>
              </div>

              {/* Priority Selection */}
              <div className="flex items-center gap-4 border-t border-zinc-200 dark:border-zinc-800 pt-4">
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                  Priority level:
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="priority"
                    value="high"
                    checked={priority === 'high'}
                    onChange={() => setPriority('high')}
                    className="accent-primary"
                  />
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">High (Wakes device instantly)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="priority"
                    value="normal"
                    checked={priority === 'normal'}
                    onChange={() => setPriority('normal')}
                    className="accent-primary"
                  />
                  <span className="font-bold text-zinc-700 dark:text-zinc-300">Normal</span>
                </label>
              </div>

              {/* Action Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-black font-black uppercase text-xs tracking-widest h-12 rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex justify-center items-center gap-2"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending Notification...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Dispatch Notification
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column: Self Test & Status Details */}
        <div className="space-y-6">
          
          {/* Box 1: Test My Device */}
          <div className="admin-card p-6 bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-xl space-y-4">
            <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <Smartphone className="w-4 h-4 text-primary" />
              Developer Device Verification
            </h4>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-500 font-medium uppercase tracking-tight">Permission Status:</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                  permissionStatus === 'granted' 
                    ? "bg-green-500/10 text-green-500" 
                    : permissionStatus === 'denied' 
                      ? "bg-red-500/10 text-red-500" 
                      : "bg-yellow-500/10 text-yellow-500"
                }`}>
                  {permissionStatus || 'unknown'}
                </span>
              </div>

              {permissionStatus !== 'granted' && (
                <Button 
                  onClick={handleRequestPermission} 
                  variant="outline" 
                  className="w-full text-[10px] font-black uppercase tracking-wider border-primary text-primary hover:bg-primary hover:text-black h-9 rounded-lg transition-all"
                >
                  Enable Permissions
                </Button>
              )}

              <div className="text-[10px] font-medium text-zinc-500 break-all bg-white dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <span className="block font-bold text-zinc-400 uppercase tracking-widest mb-1 text-[8px]">My Active FCM Token:</span>
                {localToken ? (
                  <span className="font-mono text-zinc-600 dark:text-zinc-400 select-all">{localToken.slice(0, 32)}...</span>
                ) : (
                  <span className="text-yellow-500 flex items-center gap-1 font-bold uppercase tracking-wider text-[8px]">
                    <AlertCircle className="w-3.5 h-3.5" /> No active Web FCM Token registered.
                  </span>
                )}
              </div>

              <Button
                disabled={testingSelf || permissionStatus !== 'granted'}
                onClick={handleTestSelf}
                className="w-full bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-700 font-black uppercase text-[10px] tracking-widest h-10 rounded-xl transition-all flex items-center justify-center gap-2 border border-zinc-700"
              >
                {testingSelf ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 text-primary" />
                )}
                Test My Device (Push)
              </Button>
            </div>
          </div>

          {/* Box 2: Stats */}
          <div className="admin-card p-6 bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-xl space-y-4">
            <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <Monitor className="w-4 h-4 text-primary" />
              Session Statistics
            </h4>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest">Total</span>
                <span className="text-lg font-black text-zinc-800 dark:text-white">{stats.totalSent}</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest text-green-500">Success</span>
                <span className="text-lg font-black text-green-500">{stats.successful}</span>
              </div>
              <div className="p-3 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="block text-[8px] font-bold text-zinc-400 uppercase tracking-widest text-red-500">Failed</span>
                <span className="text-lg font-black text-red-500">{stats.failed}</span>
              </div>
            </div>
          </div>

          {/* Box 3: Console Logs */}
          <div className="admin-card p-6 bg-zinc-50 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-900 rounded-2xl shadow-xl space-y-4 flex-1">
            <h4 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-widest flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary" />
                Live Dispatch Logs
              </span>
              <button 
                onClick={() => setLogs([])}
                className="text-[9px] font-bold text-zinc-400 hover:text-zinc-100 uppercase tracking-wider"
              >
                Clear
              </button>
            </h4>

            <div className="h-56 overflow-y-auto space-y-2 text-[10px] font-mono admin-scrollbar pr-1">
              {logs.length === 0 ? (
                <div className="text-zinc-500 text-center py-10 uppercase tracking-widest text-[9px] font-medium">
                  No dispatch logs in this session.
                </div>
              ) : (
                logs.map((log) => (
                  <div 
                    key={log.id} 
                    className={`p-2.5 rounded-lg border leading-relaxed ${
                      log.type === 'success' 
                        ? 'bg-green-500/5 border-green-500/10 text-green-400' 
                        : log.type === 'error' 
                          ? 'bg-red-500/5 border-red-500/10 text-red-400' 
                          : 'bg-zinc-500/5 border-zinc-500/10 text-zinc-400'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold uppercase tracking-wider">[{log.time}] {log.type}</span>
                    </div>
                    <div>{log.message}</div>
                    {log.details && (
                      <div className="mt-1 text-[9px] opacity-75 border-t border-white/5 pt-1 break-all">
                        {log.details}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default FcmTestDashboard;
