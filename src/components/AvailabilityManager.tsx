import React, { useState, useEffect } from 'react';
import { Plus, X, Calendar, Clock, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AvailabilityManagerProps {
  onClose: () => void;
}

const AvailabilityManager = ({ onClose }: AvailabilityManagerProps) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [time, setTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [availableTimes, setAvailableTimes] = useState<Array<{ id: string; time: string; is_available: boolean }>>([]);
  const [bookedTimes, setBookedTimes] = useState<Array<{ id: string; time: string; client_name: string }>>([]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableTimes();
      fetchBookedAppointments();
    }
  }, [selectedDate]);

  const fetchAvailableTimes = async () => {
    try {
      const { data: dateData } = await supabase
        .from('available_dates')
        .select('id')
        .eq('date', selectedDate)
        .maybeSingle();

      if (dateData) {
        const { data: times } = await supabase
          .from('available_times')
          .select('id, time, is_available')
          .eq('date_id', dateData.id)
          .order('time');

        setAvailableTimes(times || []);
      } else {
        setAvailableTimes([]);
      }
    } catch (err) {
      console.error('Error fetching times:', err);
      setAvailableTimes([]);
    }
  };

  const fetchBookedAppointments = async () => {
    try {
      const { data: appointments } = await supabase
        .from('appointments')
        .select('time, client_name')
        .eq('date', selectedDate)
        .eq('status', 'pending')
        .order('time');

      setBookedTimes(appointments?.map((apt, index) => ({
        id: `booked-${index}`,
        time: apt.time,
        client_name: apt.client_name
      })) || []);
    } catch (err) {
      console.error('Error fetching booked appointments:', err);
      setBookedTimes([]);
    }
  };

  const handleAddTime = async () => {
    if (!selectedDate || !time) {
      setError('Selecione uma data e horário');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get or create the date entry
      let dateId: string;
      const { data: existingDate } = await supabase
        .from('available_dates')
        .select('id')
        .eq('date', selectedDate)
        .maybeSingle();

      if (existingDate) {
        dateId = existingDate.id;
      } else {
        const { data: newDate, error: dateError } = await supabase
          .from('available_dates')
          .insert([{ date: selectedDate }])
          .select()
          .single();

        if (dateError) throw dateError;
        dateId = newDate.id;
      }

      // Check if time already exists
      const { data: existingTime } = await supabase
        .from('available_times')
        .select('id')
        .eq('date_id', dateId)
        .eq('time', time)
        .maybeSingle();

      if (existingTime) {
        setError('Este horário já está cadastrado');
        return;
      }

      // Add the new time
      const { error: timeError } = await supabase
        .from('available_times')
        .insert([{
          date_id: dateId,
          time,
          is_available: true
        }]);

      if (timeError) throw timeError;

      await fetchAvailableTimes();
      setTime('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao adicionar horário');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTime = async (timeId: string) => {
    try {
      await supabase
        .from('available_times')
        .delete()
        .eq('id', timeId);

      await fetchAvailableTimes();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao remover horário');
    }
  };

  const handleReactivateTime = async (timeToReactivate: string) => {
    try {
      const { data: dateData } = await supabase
        .from('available_dates')
        .select('id')
        .eq('date', selectedDate)
        .maybeSingle();

      if (dateData) {
        const { error: updateError } = await supabase
          .from('available_times')
          .update({ is_available: true })
          .eq('date_id', dateData.id)
          .eq('time', timeToReactivate);

        if (updateError) throw updateError;

        await fetchAvailableTimes();
        await fetchBookedAppointments();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao reativar horário');
    }
  };

  // Format date for display (fix timezone issue)
  const formatDateForDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr + 'T00:00:00'); // Force local timezone
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get today's date in YYYY-MM-DD format for min attribute
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">Gerenciar Horários</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={getTodayDate()}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                required
              />
            </div>
            {selectedDate && (
              <p className="mt-1 text-sm text-gray-600">
                Data selecionada: {formatDateForDisplay(selectedDate)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Horário
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                />
              </div>
              <button
                onClick={handleAddTime}
                disabled={loading || !selectedDate || !time}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200 disabled:opacity-50 flex items-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <Plus className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {selectedDate && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Available Times */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Horários Disponíveis
                </h4>
                {availableTimes.filter(t => t.is_available).length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                    {availableTimes
                      .filter(t => t.is_available)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between bg-green-50 p-2 rounded-md border border-green-200"
                        >
                          <span className="text-sm font-medium text-green-800">{t.time}</span>
                          <button
                            onClick={() => handleRemoveTime(t.id)}
                            className="text-red-600 hover:text-red-700 ml-2"
                            title="Remover horário"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-md">
                    Nenhum horário disponível
                  </p>
                )}
              </div>

              {/* Booked Times */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                  <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                  Horários Ocupados
                </h4>
                {availableTimes.filter(t => !t.is_available).length > 0 || bookedTimes.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {/* Unavailable times from available_times table */}
                    {availableTimes
                      .filter(t => !t.is_available)
                      .map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center justify-between bg-red-50 p-2 rounded-md border border-red-200"
                        >
                          <span className="text-sm font-medium text-red-800">{t.time}</span>
                          <button
                            onClick={() => handleReactivateTime(t.time)}
                            className="text-green-600 hover:text-green-700 ml-2"
                            title="Reativar horário"
                          >
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    
                    {/* Booked appointments */}
                    {bookedTimes.map((apt) => (
                      <div
                        key={apt.id}
                        className="bg-orange-50 p-2 rounded-md border border-orange-200"
                      >
                        <div className="text-sm font-medium text-orange-800">{apt.time}</div>
                        <div className="text-xs text-orange-600">{apt.client_name}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-4 bg-gray-50 rounded-md">
                    Nenhum horário ocupado
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;