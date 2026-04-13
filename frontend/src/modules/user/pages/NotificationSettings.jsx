import { useState } from "react";
import { Bell, Shield, Mail, Smartphone, ChevronLeft, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";

const NotificationSettings = () => {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [notifs, setNotifs] = useState({
    push: true,
    email: true,
    status: true,
    promo: false,
  });

  const handleToggle = (id) => {
    setNotifs(prev => ({ ...prev, [id]: !prev[id] }));
    setSaved(false);
  };

  const savePreferences = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      setTimeout(() => setSaved(false), 2000);
    }, 1000);
  };

  const settings = [
    { id: 'push', icon: <Smartphone className="w-4 h-4" />, title: "Push Notifications", desc: "Real-time updates on your requests" },
    { id: 'email', icon: <Mail className="w-4 h-4" />, title: "Email Alerts", desc: "Summary and transaction reports" },
    { id: 'status', icon: <Shield className="w-4 h-4" />, title: "Status Updates", desc: "Notification on job completion" },
    { id: 'promo', icon: <Bell className="w-4 h-4" />, title: "Promotions", desc: "Exclusive offers and discounts" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <header className="flex items-center gap-4 pt-6 pb-4 border-b-2 border-primary">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full bg-white shadow-sm border border-zinc-100"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-black tracking-tight">Notification Alerts</h1>
          <p className="text-[11px] text-zinc-500 font-medium">Control how we communicate with you</p>
        </div>
      </header>

      <div className="space-y-2 pt-2">
        {settings.map((item) => (
          <Card key={item.id} className="border-none shadow-premium bg-white">
            <CardContent className="p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-50 rounded-xl text-zinc-400">
                  {item.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-black text-black uppercase tracking-tight">{item.title}</span>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-tighter truncate max-w-[180px]">{item.desc}</span>
                </div>
              </div>
              <Switch 
                checked={notifs[item.id]} 
                onCheckedChange={() => handleToggle(item.id)} 
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-4">
        <Button 
          onClick={savePreferences}
          disabled={isSaving}
          className="w-full h-12 rounded-2xl bg-black text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg active:scale-95 transition-all"
        >
          {isSaving ? "Saving..." : saved ? <><Check className="w-4 h-4 mr-2" /> Preferences Saved</> : "Save Preferences"}
        </Button>
      </div>

      <div className="bg-zinc-900 rounded-3xl p-4 mt-6">
         <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-zinc-800 rounded-xl text-primary">
               <Shield className="w-4 h-4" />
            </div>
            <h4 className="text-[10px] font-black text-white uppercase tracking-wider">Privacy First</h4>
         </div>
         <p className="text-[9px] text-zinc-500 font-medium leading-tight">We respect your privacy. You can adjust your preferences at any time to limit frequency.</p>
      </div>

      {/* Mock Toast */}
      {showToast && (
        <div className="fixed bottom-20 left-4 right-4 bg-zinc-900 text-white p-3 rounded-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 z-50">
          <div className="bg-primary/20 p-2 rounded-xl text-primary">
             <Check className="w-4 h-4" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest">Settings updated successfully</span>
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
