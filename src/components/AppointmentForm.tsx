import React, { useState, useEffect } from 'react';
import { Service } from '../types';
import { supabase, createAppointment, getCurrentUser } from '../lib/supabase';
import DateSelector from './DateSelector';
import TimeSelector from './TimeSelector';
import { User, Sparkles, Calendar, Clock, Info } from 'lucide-react';

interface AppointmentFormProps {
  onSubmit: (data: {
    name: string;
    service: string;
    date: string;
    time: string;
  }) => void;
  services: Service[];
}

const AppointmentForm = ({ onSubmit, services }: AppointmentFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    service: '',
    date: '',
    time: '',
  });

  const [availableTimes, setAvailableTimes] = useState<Array<{ time: string; is_available: boolean }>>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [serviceSuggestion, setServiceSuggestion] = useState('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [hasServiceConfiguration, setHasServiceConfiguration] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Check if service has specific configuration and fetch available dates
  useEffect(() => {
    if (formData.service) {
      checkServiceConfiguration(formData.service);
    } else {
      setAvailableDates([]);
      setServiceSuggestion('');
      setHasServiceConfiguration(false);
    }
  }, [formData.service]);

  // Fetch times when both service and date are selected
  useEffect(() => {
    if (formData.date && formData.service) {
      fetchServiceSpecificTimes(formData.date, formData.service);
    } else if (formData.date) {
      // Fallback to general availability if no service selected
      fetchAvailableTimes(formData.date);
    } else {
      setAvailableTimes([]);
      setSelectedTime('');
    }
  }, [formData.date, formData.service]);

  const checkServiceConfiguration = async (serviceId: string) => {
    try {
      // Check if service has specific configuration in service_availability table
      const { data: serviceConfig } = await supabase
        .from('service_availability')
        .select('id')
        .eq('service_id', serviceId)
        .limit(1);

      const hasConfig = serviceConfig && serviceConfig.length > 0;
      setHasServiceConfiguration(hasConfig);

      if (hasConfig) {
        // Service has configuration - fetch its specific dates and generate suggestion
        await fetchAvailableDatesForService(serviceId);
        await generateServiceSuggestion(serviceId);
      } else {
        // Service has no configuration - fetch general dates but no suggestion
        await fetchGeneralAvailableDates();
        setServiceSuggestion('');
      }
    } catch (error) {
      console.error('Error checking service configuration:', error);
      setHasServiceConfiguration(false);
      setAvailableDates([]);
      setServiceSuggestion('');
    }
  };

  const fetchAvailableDatesForService = async (serviceId: string) => {
    try {
      // Get dates that have service-specific availability
      const { data: serviceAvailabilityData } = await supabase
        .from('service_availability')
        .select(`
          date_id,
          available_dates!inner(date)
        `)
        .eq('service_id', serviceId)
        .eq('is_available', true);

      const serviceDates = serviceAvailabilityData?.map(item => item.available_dates.date) || [];
      
      // Filter to only future dates
      const today = new Date().toISOString().split('T')[0];
      const futureDates = serviceDates.filter(date => date >= today);
      
      setAvailableDates(futureDates.sort());
    } catch (error) {
      console.error('Error fetching available dates for service:', error);
      setAvailableDates([]);
    }
  };

  const fetchGeneralAvailableDates = async () => {
    try {
      // Get general availability dates
      const { data: generalDatesData } = await supabase
        .from('available_dates')
        .select('date')
        .order('date');

      const generalDates = generalDatesData?.map(item => item.date) || [];
      
      // Filter to only future dates
      const today = new Date().toISOString().split('T')[0];
      const futureDates = generalDates.filter(date => date >= today);
      
      setAvailableDates(futureDates.sort());
    } catch (error) {
      console.error('Error fetching general available dates:', error);
      setAvailableDates([]);
    }
  };

  const generateServiceSuggestion = async (serviceId: string) => {
    try {
      const serviceName = services.find(s => s.id === serviceId)?.name || 'Serviço';
      
      // Only generate suggestions for services with specific configuration
      if (!hasServiceConfiguration) {
        return;
      }
      
      // Get the earliest available date and time for this service
      const { data: serviceAvailabilityData } = await supabase
        .from('service_availability')
        .select(`
          time,
          available_dates!inner(date)
        `)
        .eq('service_id', serviceId)
        .eq('is_available', true)
        .gte('available_dates.date', new Date().toISOString().split('T')[0])
        .limit(100);

      if (serviceAvailabilityData && serviceAvailabilityData.length > 0) {
        // Sort client-side by date first, then by time
        const sortedData = serviceAvailabilityData.sort((a, b) => {
          const dateComparison = a.available_dates.date.localeCompare(b.available_dates.date);
          if (dateComparison !== 0) return dateComparison;
          return a.time.localeCompare(b.time);
        });

        const earliestSlot = sortedData[0];
        const formattedDate = new Date(earliestSlot.available_dates.date + 'T00:00:00').toLocaleDateString('pt-BR', {
          day: 'numeric',
          month: 'long'
        });
        
        setServiceSuggestion(
          `${serviceName} disponível no dia ${formattedDate} às ${earliestSlot.time}`
        );
      } else {
        setServiceSuggestion(`${serviceName} selecionado. Escolha uma data para ver os horários disponíveis.`);
      }
    } catch (error) {
      console.error('Error generating service suggestion:', error);
      setServiceSuggestion('');
    }
  };

  const fetchServiceSpecificTimes = async (date: string, serviceId: string) => {
    try {
      setLoadingTimes(true);
      setSelectedTime('');
      
      // First get the date ID if it exists
      const { data: dateData } = await supabase
        .from('available_dates')
        .select('id')
        .eq('date', date)
        .maybeSingle();

      if (dateData) {
        // Check if service has specific configuration
        const { data: serviceConfig } = await supabase
          .from('service_availability')
          .select('id')
          .eq('service_id', serviceId)
          .limit(1);

        if (serviceConfig && serviceConfig.length > 0) {
          // Service has configuration - fetch service-specific times
          const { data: serviceTimesData } = await supabase
            .from('service_availability')
            .select('time, is_available')
            .eq('service_id', serviceId)
            .eq('date_id', dateData.id)
            .eq('is_available', true)
            .order('time');

          setAvailableTimes(serviceTimesData || []);
        } else {
          // Service has no configuration - get general availability excluding service-specific times
          const { data: generalTimesData } = await supabase
            .from('available_times')
            .select('time, is_available')
            .eq('date_id', dateData.id)
            .eq('is_available', true)
            .order('time');

          if (generalTimesData) {
            // Get all service-specific times for this date to exclude them
            const { data: allServiceTimes } = await supabase
              .from('service_availability')
              .select('time')
              .eq('date_id', dateData.id);

            const serviceSpecificTimes = new Set(allServiceTimes?.map(t => t.time) || []);
            
            // Filter out times that are service-specific
            const availableGeneralTimes = generalTimesData.filter(
              time => !serviceSpecificTimes.has(time.time)
            );
            
            setAvailableTimes(availableGeneralTimes);
          } else {
            setAvailableTimes([]);
          }
        }
      } else {
        setAvailableTimes([]);
      }
    } catch (error) {
      console.error('Error fetching service-specific times:', error);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const fetchAvailableTimes = async (date: string) => {
    try {
      setLoadingTimes(true);
      setSelectedTime('');
      
      // First get the date ID if it exists
      const { data: dateData } = await supabase
        .from('available_dates')
        .select('id')
        .eq('date', date)
        .maybeSingle();

      if (dateData) {
        // Fetch general times for this date
        const { data: timesData } = await supabase
          .from('available_times')
          .select('time, is_available')
          .eq('date_id', dateData.id)
          .eq('is_available', true)
          .order('time');

        if (timesData) {
          // Get all service-specific times for this date to exclude them
          const { data: allServiceTimes } = await supabase
            .from('service_availability')
            .select('time')
            .eq('date_id', dateData.id);

          const serviceSpecificTimes = new Set(allServiceTimes?.map(t => t.time) || []);
          
          // Filter out times that are service-specific
          const availableGeneralTimes = timesData.filter(
            time => !serviceSpecificTimes.has(time.time)
          );
          
          setAvailableTimes(availableGeneralTimes);
        } else {
          setAvailableTimes([]);
        }
      } else {
        // No times available for this date
        setAvailableTimes([]);
      }
    } catch (error) {
      console.error('Error fetching times:', error);
      setAvailableTimes([]);
    } finally {
      setLoadingTimes(false);
    }
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setFormData({ ...formData, time });
  };

  const handleServiceChange = (serviceId: string) => {
    setFormData({ ...formData, service: serviceId, date: '', time: '' });
    setSelectedTime('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all required fields
    if (!formData.name || !formData.service || !formData.date || !formData.time) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    setSubmitting(true);
    
    try {
      console.log('Form data:', formData);
      
      // Create the appointment directly with Supabase
      const { data: appointmentData, error: appointmentError } = await supabase
        .from('appointments')
        .insert([{
          client_name: formData.name,
          service_id: formData.service,
          date: formData.date,
          time: formData.time,
          status: 'pending'
        }])
        .select()
        .single();

      if (appointmentError) {
        console.error('Error creating appointment:', appointmentError);
        throw new Error('Erro ao criar agendamento: ' + appointmentError.message);
      }

      console.log('Appointment created successfully:', appointmentData);

      // If appointment was created successfully, mark the time as unavailable
      if (appointmentData) {
        const { data: dateData } = await supabase
          .from('available_dates')
          .select('id')
          .eq('date', formData.date)
          .maybeSingle();

        if (dateData) {
          // Try to update service-specific availability first
          const { data: serviceAvailability } = await supabase
            .from('service_availability')
            .select('id')
            .eq('service_id', formData.service)
            .eq('date_id', dateData.id)
            .eq('time', formData.time)
            .maybeSingle();

          if (serviceAvailability) {
            // Update service-specific availability
            const { error: updateServiceError } = await supabase
              .from('service_availability')
              .update({ is_available: false })
              .eq('id', serviceAvailability.id);

            if (updateServiceError) {
              console.error('Error updating service availability:', updateServiceError);
            }
          } else {
            // Fallback to general availability
            const { error: updateError } = await supabase
              .from('available_times')
              .update({ is_available: false })
              .eq('date_id', dateData.id)
              .eq('time', formData.time);

            if (updateError) {
              console.error('Error updating time availability:', updateError);
            }
          }
        }
      }

      // Call the onSubmit callback to proceed with the appointment flow
      onSubmit(formData);
    } catch (error) {
      console.error('Error in appointment submission:', error);
      alert(error instanceof Error ? error.message : 'Erro ao processar agendamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = formData.name && formData.service && formData.date && formData.time;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Name Field */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 text-sm font-bold text-gray-200">
          <User className="h-4 w-4 text-purple-400" />
          <span>Nome Completo *</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="relative w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 backdrop-blur-sm transition-all duration-300"
            required
            placeholder="Digite seu nome completo"
          />
        </div>
      </div>

      {/* Service Field */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 text-sm font-bold text-gray-200">
          <Sparkles className="h-4 w-4 text-purple-400" />
          <span>Serviço *</span>
        </label>
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl blur-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
          <select
            id="service"
            value={formData.service}
            onChange={(e) => handleServiceChange(e.target.value)}
            className="relative w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-400/50 backdrop-blur-sm transition-all duration-300"
            required
          >
            <option value="" className="bg-slate-800 text-gray-300">Selecione um serviço</option>
            {services.map((service) => (
              <option key={service.id} value={service.id} className="bg-slate-800 text-white">
                {service.name} - R$ {service.price} ({service.duration})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Service Suggestion - Only shows for services with specific configuration */}
      {serviceSuggestion && hasServiceConfiguration && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 rounded-xl blur-lg"></div>
          <div className="relative bg-gradient-to-r from-blue-500/10 to-indigo-500/10 backdrop-blur-sm border border-blue-400/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-lg flex-shrink-0">
                <Info className="h-4 w-4 text-blue-300" />
              </div>
              <div>
                <h4 className="font-bold text-blue-200 text-sm mb-1">Sugestão de Horário</h4>
                <p className="text-blue-100 text-sm">{serviceSuggestion}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Date Field */}
      <div className="space-y-3">
        <label className="flex items-center space-x-2 text-sm font-bold text-gray-200">
          <Calendar className="h-4 w-4 text-purple-400" />
          <span>Data *</span>
        </label>
        <DateSelector
          selectedDate={formData.date}
          onDateSelect={(date) => {
            setFormData({ ...formData, date, time: '' });
            setSelectedTime('');
          }}
          availableDates={availableDates}
        />
      </div>

      {/* Time Field */}
      {formData.date && (
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-bold text-gray-200">
            <Clock className="h-4 w-4 text-purple-400" />
            <span>Horário *</span>
          </label>
          {loadingTimes ? (
            <div className="flex justify-center py-8">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-400"></div>
                <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-purple-400 opacity-20"></div>
              </div>
            </div>
          ) : (
            <TimeSelector
              times={availableTimes}
              selectedTime={selectedTime}
              onTimeSelect={handleTimeSelect}
            />
          )}
        </div>
      )}

      {/* No times available message */}
      {formData.date && availableTimes.length === 0 && !loadingTimes && (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-xl blur-lg"></div>
          <div className="relative bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-400/20 rounded-xl p-4">
            <p className="text-yellow-200 text-sm font-medium text-center">
              {formData.service 
                ? hasServiceConfiguration
                  ? 'Não há horários específicos disponíveis para este serviço nesta data. Entre em contato conosco para verificar outras opções.'
                  : 'Não há horários disponíveis para esta data. Por favor, escolha outra data ou entre em contato conosco.'
                : 'Não há horários disponíveis para esta data. Por favor, escolha outra data ou entre em contato conosco.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormValid || submitting}
        className={`group relative w-full py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 transform ${
          isFormValid && !submitting
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-1 hover:scale-105'
            : 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
        }`}
      >
        {(isFormValid && !submitting) && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
        )}
        <div className="relative flex items-center justify-center space-x-3">
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              <span>Processando...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5" />
              <span>
                {!formData.name || !formData.service
                  ? 'Preencha nome e serviço'
                  : !formData.date
                  ? 'Selecione uma data'
                  : !formData.time
                  ? 'Selecione um horário'
                  : 'Agendar Horário'
                }
              </span>
            </>
          )}
        </div>
      </button>
    </form>
  );
};

export default AppointmentForm;