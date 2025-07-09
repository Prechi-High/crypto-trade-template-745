import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const data = [
  { time: "2:00pm", btc: 8420.04, eth: 2980.81 },
  { time: "3:00pm", btc: 8500.12, eth: 3020.45 },
  { time: "4:00pm", btc: 8650.89, eth: 3100.22 },
  { time: "5:00pm", btc: 8420.04, eth: 2980.81 },
  { time: "6:00pm", btc: 8750.33, eth: 3150.67 },
  { time: "7:00pm", btc: 8900.45, eth: 3200.89 },
  { time: "8:00pm", btc: 8420.04, eth: 2980.81 },
  { time: "9:00pm", btc: 8950.12, eth: 3250.44 }
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 text-white">
        <p className="text-sm text-gray-400">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm">
            <span style={{ color: entry.color }}>
              {entry.dataKey === 'btc' ? '1BTC' : '1ETH'}: ${entry.value?.toLocaleString()}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ActiveCreditChart = () => {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis 
            dataKey="time" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#666', fontSize: 12 }}
            domain={['dataMin - 500', 'dataMax + 500']}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="btc" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#10b981' }}
          />
          <Line 
            type="monotone" 
            dataKey="eth" 
            stroke="#fbbf24" 
            strokeWidth={2}
            dot={{ fill: '#fbbf24', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#fbbf24' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};