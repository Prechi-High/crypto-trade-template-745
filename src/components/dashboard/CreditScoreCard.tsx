import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface CreditScoreCardProps {
  creditScore?: number;
}

export const CreditScoreCard = ({ creditScore = 660 }: CreditScoreCardProps) => {
  const score = creditScore;
  const percentage = 80;
  
  return (
    <Card className="glass">
      <CardContent className="p-6">
        <CardTitle className="mb-6">Your credit score</CardTitle>
        
        <div className="relative flex items-center justify-center mb-6">
          {/* Circular Progress */}
          <div className="relative w-32 h-32">
            <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
              {/* Background circle */}
              <path
                className="text-gray-700"
                stroke="currentColor"
                strokeWidth="2"
                fill="transparent"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              {/* Progress circle */}
              <path
                className="text-green-400"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="transparent"
                strokeDasharray={`${percentage}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            
            {/* Score in center */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold">{score}</div>
                <div className="text-xs text-muted-foreground">score</div>
              </div>
            </div>
          </div>
          
          {/* Percentage indicator */}
          <div className="absolute top-2 right-4">
            <div className="flex items-center text-green-400 text-sm">
              <TrendingUp className="w-3 h-3 mr-1" />
              {percentage}%
            </div>
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Your credit score is average</p>
          <p className="text-xs text-muted-foreground">
            Last Check on {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          </p>
          <div className="flex items-center justify-center gap-1 text-green-400 text-sm">
            <span>+2.34%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};