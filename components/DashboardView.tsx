import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import StatCard from './StatCard';
import type { Block } from '../types';
import { BlocksIcon } from './icons/BlocksIcon';
import { RoomsIcon } from './icons/RoomsIcon';
import { ItemsIcon } from './icons/ItemsIcon';

interface DashboardViewProps {
  stats: {
    totalBlocks: number;
    totalRooms: number;
    totalItems: number;
    totalValue: number;
  };
  blocks: Block[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-dark-card p-2 border border-gray-200 dark:border-dark-border rounded shadow-lg">
        <p className="font-bold text-gray-800 dark:text-dark-text">{label}</p>
        <p className="text-primary-500">{`Total Value: PKR ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};

const DashboardView: React.FC<DashboardViewProps> = ({ stats, blocks }) => {
  const chartData = useMemo(() => {
    return blocks.map(block => {
      const blockValue = block.rooms.reduce((roomSum, room) => {
        return roomSum + room.items.reduce((itemSum, item) => {
          return itemSum + item.quantity * item.unitPrice;
        }, 0);
      }, 0);
      return {
        name: block.name.split(' ')[1], // e.g., 'A' from 'Block A'
        value: blockValue,
      };
    });
  }, [blocks]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Blocks" value={stats.totalBlocks.toString()} icon={<BlocksIcon />} />
        <StatCard title="Total Rooms" value={stats.totalRooms.toString()} icon={<RoomsIcon />} />
        <StatCard title="Total Items" value={stats.totalItems.toLocaleString()} icon={<ItemsIcon />} />
        <StatCard title="Total Value" value={`PKR ${stats.totalValue.toLocaleString()}`} icon={<div className="text-xl font-bold text-primary-500">PKR</div>} />
      </div>

      <div className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-lg shadow-md transition-colors duration-300">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-dark-text mb-4">Inventory Value by Block</h3>
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
                <XAxis dataKey="name" tick={{ fill: 'currentColor' }} className="text-xs text-gray-600 dark:text-gray-400" />
                <YAxis tickFormatter={(value) => `PKR ${Number(value).toLocaleString()}`} tick={{ fill: 'currentColor' }} className="text-xs text-gray-600 dark:text-gray-400" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name="Total Value" />
            </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;