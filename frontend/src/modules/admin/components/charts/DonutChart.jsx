import React from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip,
  Legend 
} from 'recharts';

export const DonutChart = ({ data, dataKey, nameKey }) => {
  const COLORS = ['#facc15', '#a1a1aa', '#3f3f46', '#27272a'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey={dataKey}
          nameKey={nameKey}
          animationDuration={1500}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0.1)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#18181b', 
            border: '1px solid #27272a', 
            borderRadius: '12px',
            fontSize: '10px',
            fontWeight: 'bold',
            textTransform: 'uppercase'
          }}
          itemStyle={{ color: '#fff' }}
        />
        <Legend 
          layout="vertical" 
          verticalAlign="middle" 
          align="right"
          iconType="circle"
          wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', color: '#71717a' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};
