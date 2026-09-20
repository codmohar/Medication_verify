import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Area,
  AreaChart,
} from 'recharts';

interface AdherenceChartProps {
  type: 'weekly' | 'monthly' | 'missedTrend' | 'comparison';
}

const WEEKLY_DATA = [
  { day: 'Mon', onTime: 95, late: 4, missed: 1 },
  { day: 'Tue', onTime: 92, late: 5, missed: 3 },
  { day: 'Wed', onTime: 98, late: 2, missed: 0 },
  { day: 'Thu', onTime: 89, late: 8, missed: 3 },
  { day: 'Fri', onTime: 94, late: 4, missed: 2 },
  { day: 'Sat', onTime: 91, late: 6, missed: 3 },
  { day: 'Sun', onTime: 96, late: 3, missed: 1 },
];

const MONTHLY_DATA = [
  { month: 'Apr', rate: 86 },
  { month: 'May', rate: 89 },
  { month: 'Jun', rate: 91 },
  { month: 'Jul', rate: 93 },
  { month: 'Aug', rate: 92 },
  { month: 'Sep', rate: 94 },
];

const MISSED_TREND_DATA = [
  { week: 'Week 34', missedDoses: 8, unverified: 5 },
  { week: 'Week 35', missedDoses: 6, unverified: 4 },
  { week: 'Week 36', missedDoses: 5, unverified: 3 },
  { week: 'Week 37', missedDoses: 3, unverified: 2 },
  { week: 'Week 38 (Current)', missedDoses: 2, unverified: 1 },
];

const COMPARISON_DATA = [
  { name: 'Ramesh K.', adherence: 96, target: 90 },
  { name: 'Priya P.', adherence: 88, target: 90 },
  { name: 'Sunita D.', adherence: 92, target: 90 },
  { name: 'Ankit M.', adherence: 98, target: 90 },
  { name: 'M. Farooq', adherence: 74, target: 90 },
  { name: 'Rajesh V.', adherence: 68, target: 90 },
];

export const AdherenceChart: React.FC<AdherenceChartProps> = ({ type }) => {
  if (type === 'weekly') {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={WEEKLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar dataKey="onTime" name="On Time %" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="late" name="Late %" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="missed" name="Missed %" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'monthly') {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="adherenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} domain={[70, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="rate"
              name="Adherence Rate %"
              stroke="#0d9488"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#adherenceGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === 'missedTrend') {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={MISSED_TREND_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '12px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Line
              type="monotone"
              dataKey="missedDoses"
              name="Missed Doses"
              stroke="#ef4444"
              strokeWidth={3}
              dot={{ r: 4, fill: '#ef4444' }}
            />
            <Line
              type="monotone"
              dataKey="unverified"
              name="Optical Verification Failures"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#f59e0b' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Comparison
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={COMPARISON_DATA}
          layout="vertical"
          margin={{ top: 10, right: 20, left: 20, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
          <YAxis dataKey="name" type="category" tick={{ fill: '#1e293b', fontSize: 11, fontWeight: 600 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '12px',
              border: '1px solid #cbd5e1',
              fontSize: '12px',
            }}
          />
          <Bar dataKey="adherence" name="Patient Adherence %" fill="#0d9488" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
