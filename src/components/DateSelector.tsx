import React from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DateSelectorProps {
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  availableDates?: string[];
}

const DateSelector = ({ selectedDate, onDateSelect, availableDates = [] }: DateSelectorProps) => {
  // Generate next 7 days starting from today
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return format(date, 'yyyy-MM-dd');
  });

  // Filter dates to only show available ones if availableDates is provided
  const datesToShow = availableDates.length > 0 
    ? dates.filter(date => availableDates.includes(date))
    : dates;

  if (datesToShow.length === 0) {
    return (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-slate-500/10 rounded-2xl blur-lg"></div>
        <div className="relative text-center py-12 bg-gradient-to-r from-gray-500/10 to-slate-500/10 backdrop-blur-sm border border-gray-400/20 rounded-2xl">
          <p className="text-xl font-bold text-gray-300 mb-2">Nenhuma data disponível</p>
          <p className="text-sm text-gray-400">Entre em contato conosco para verificar disponibilidade</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex space-x-4 min-w-max">
        {datesToShow.map((date) => {
          const dateObj = new Date(date + 'T00:00:00');
          const dayOfWeek = format(dateObj, 'EEEE', { locale: ptBR });
          const dayOfMonth = format(dateObj, 'd');
          const month = format(dateObj, 'MMM', { locale: ptBR });

          return (
            <button
              key={date}
              type="button"
              onClick={() => onDateSelect(date)}
              className={`group relative flex flex-col items-center min-w-[100px] p-5 rounded-2xl transition-all duration-300 border-2 transform hover:scale-105 ${
                selectedDate === date
                  ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white border-purple-400 shadow-2xl shadow-purple-500/25 scale-105'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-purple-400/30 text-gray-300 hover:text-white backdrop-blur-sm'
              }`}
            >
              {/* Glow effect for selected date */}
              {selectedDate === date && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl blur-lg opacity-50"></div>
              )}
              
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider opacity-80">
                  {dayOfWeek.slice(0, 3)}
                </span>
                <span className="text-3xl font-bold mt-2 block">{dayOfMonth}</span>
                <span className="text-xs uppercase mt-1 opacity-80">{month}</span>
              </div>
              
              {/* Hover effect */}
              {selectedDate !== date && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 rounded-2xl transition-all duration-300"></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default DateSelector;