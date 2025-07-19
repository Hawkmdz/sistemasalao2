import React from 'react';
import { Clock } from 'lucide-react';

interface TimeSelectorProps {
  times: Array<{ time: string; is_available: boolean }>;
  selectedTime?: string;
  onTimeSelect: (time: string) => void;
}

const TimeSelector = ({ times, selectedTime, onTimeSelect }: TimeSelectorProps) => {
  if (times.length === 0) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-slate-500/10 rounded-2xl blur-lg"></div>
        <div className="relative text-center py-12 bg-gradient-to-r from-gray-500/10 to-slate-500/10 backdrop-blur-sm border border-gray-400/20 rounded-2xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-600/30 to-slate-600/30 rounded-2xl mb-4">
            <Clock className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-xl font-bold text-gray-300 mb-2">Sem horários disponíveis</p>
          <p className="text-sm text-gray-400">Escolha outra data ou entre em contato conosco</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {times.map(({ time, is_available }) => (
        <button
          key={time}
          type="button"
          onClick={() => is_available && onTimeSelect(time)}
          disabled={!is_available}
          className={`group relative p-4 rounded-xl text-center transition-all duration-300 font-bold transform ${
            selectedTime === time
              ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white border-2 border-purple-400 shadow-2xl shadow-purple-500/25 scale-105'
              : is_available
              ? 'bg-white/5 hover:bg-white/10 border-2 border-white/10 hover:border-purple-400/30 text-gray-300 hover:text-white backdrop-blur-sm hover:scale-105'
              : 'bg-gray-600/20 text-gray-500 cursor-not-allowed border-2 border-gray-600/20'
          }`}
        >
          {/* Glow effect for selected time */}
          {selectedTime === time && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl blur-lg opacity-50"></div>
          )}
          
          {/* Hover effect for available times */}
          {is_available && selectedTime !== time && (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 rounded-xl transition-all duration-300"></div>
          )}
          
          <span className="relative z-10 text-lg">{time}</span>
        </button>
      ))}
    </div>
  );
};

export default TimeSelector;