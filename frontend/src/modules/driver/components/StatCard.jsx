import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const StatCard = ({ icon: Icon, label, value, trend, trendColor, className }) => {
  return (
    <Card className={cn("border-2 border-primary/20 shadow-premium bg-white rounded-2xl", className)}>
      <CardContent className="p-3">
        <div className="flex justify-between items-start mb-1.5">
          <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
            <Icon className="w-4 h-4" strokeWidth={2.5} />
          </div>
          {trend && (
            <span className={cn("text-[9px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded-md", trendColor)}>
              {trend}
            </span>
          )}
        </div>
        <div className="space-y-1">
          <h3 className={cn(
            "font-black text-black tracking-tight leading-tight",
            value && value.toString().length > 8 ? "text-[15px]" : "text-xl"
          )}>
            {value}
          </h3>
          <p className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-widest leading-none">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
};
