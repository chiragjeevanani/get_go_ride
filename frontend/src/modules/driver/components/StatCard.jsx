import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const StatCard = ({ icon: Icon, label, value, trend, trendColor, className }) => {
  return (
    <Card className={cn("border-2 border-primary/20 shadow-premium bg-white rounded-2xl", className)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="p-2 bg-primary/10 rounded-xl text-primary">
            <Icon className="w-5 h-5" strokeWidth={2.5} />
          </div>
          {trend && (
            <span className={cn("text-[10px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md", trendColor)}>
              {trend}
            </span>
          )}
        </div>
        <div className="space-y-0.5">
          <h3 className="text-2xl font-black text-black tracking-tight leading-none">{value}</h3>
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};
