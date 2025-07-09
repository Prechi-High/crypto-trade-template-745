import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface MetricsCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
}

export const MetricsCard = ({ title, value, change, changeType }: MetricsCardProps) => {
  return (
    <Card className="glass">
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-2">{title}</p>
        <p className="text-xl font-bold mb-2">{value}</p>
        <div className="flex items-center gap-1">
          {changeType === "positive" ? (
            <TrendingUp className="w-3 h-3 text-green-400" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-400" />
          )}
          <span className={`text-xs ${
            changeType === "positive" ? "text-green-400" : "text-red-400"
          }`}>
            {change}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};