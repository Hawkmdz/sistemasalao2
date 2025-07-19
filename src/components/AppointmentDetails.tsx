import React from 'react';
import { Calendar, Clock, User, Share2, AlertCircle, CheckCircle, Crown, Sparkles } from 'lucide-react';
import { Service } from '../types';

interface AppointmentDetailsProps {
  appointment: {
    name: string;
    service: string;
    date: string;
    time: string;
  };
  onNewAppointment: () => void;
  services: Service[];
}

const AppointmentDetails = ({ appointment, onNewAppointment, services }: AppointmentDetailsProps) => {
  const formatDate = (dateStr: string) => {
    // Create date object with explicit timezone handling
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getServiceDetails = (serviceId: string) => {
    return services.find(s => s.id === serviceId);
  };

  const serviceDetails = getServiceDetails(appointment.service);

  const handleWhatsAppShare = () => {
    const formattedDate = formatDate(appointment.date);
    
    const message = `*Confirmação de Agendamento - SALON TIME*\n\n` +
      `👤 Cliente: ${appointment.name}\n` +
      `✨ Serviço: ${serviceDetails?.name}\n` +
      `⏱️ Duração: ${serviceDetails?.duration}\n` +
      `💰 Valor: R$ ${serviceDetails?.price}\n` +
      `📅 Data: ${formattedDate}\n` +
      `🕐 Horário: ${appointment.time}\n\n` +
      `Agradecemos a preferência!`;

    // Detect device type for optimal WhatsApp experience
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, use the mobile WhatsApp URL
      const mobileUrl = `https://wa.me/5581996763099?text=${encodeURIComponent(message)}`;
      window.open(mobileUrl, '_blank');
    } else {
      // On desktop, use WhatsApp Web
      const whatsappUrl = `https://web.whatsapp.com/send?phone=5581996763099&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-3xl blur-xl"></div>
      
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
        {/* Success Header */}
        <div className="relative bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-green-600/20 p-8 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-transparent to-emerald-600/5 animate-pulse"></div>
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-3xl shadow-2xl mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent mb-3">
              Agendamento Confirmado!
            </h2>
            <p className="text-gray-300 text-lg">
              Seu horário foi reservado com sucesso
            </p>
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Appointment Details */}
          <div className="space-y-6">
            {/* Client Name */}
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl">
                <User className="h-6 w-6 text-purple-300" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Cliente</p>
                <p className="text-xl font-bold text-white">{appointment.name}</p>
              </div>
            </div>

            {/* Service Details */}
            <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-xl">
                <Crown className="h-6 w-6 text-purple-300" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Serviço</p>
                <p className="text-xl font-bold text-white">{serviceDetails?.name}</p>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-sm text-gray-300 bg-white/10 px-3 py-1 rounded-full">
                    {serviceDetails?.duration}
                  </span>
                  <span className="text-sm font-bold text-green-400">
                    R$ {serviceDetails?.price}
                  </span>
                </div>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl">
                  <Calendar className="h-6 w-6 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Data</p>
                  <p className="text-lg font-bold text-white">{formatDate(appointment.date)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-indigo-600/30 to-purple-600/30 rounded-xl">
                  <Clock className="h-6 w-6 text-indigo-300" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Horário</p>
                  <p className="text-lg font-bold text-white">{appointment.time}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Important Notice */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur-lg"></div>
            <div className="relative bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <div className="flex items-start space-x-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-xl flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-yellow-300" />
                </div>
                <div>
                  <h4 className="font-bold text-yellow-200 mb-2">Próximo Passo</h4>
                  <p className="text-yellow-100 text-sm leading-relaxed">
                    Para confirmar definitivamente seu agendamento, envie o comprovante de pagamento através do WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleWhatsAppShare}
              className="group relative w-full py-4 px-6 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center space-x-3">
                <Share2 className="h-6 w-6" />
                <span>Enviar Comprovante via WhatsApp</span>
              </div>
            </button>

            <button
              onClick={onNewAppointment}
              className="group relative w-full py-3 px-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/30 text-gray-300 hover:text-white font-medium rounded-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-center space-x-3">
                <Sparkles className="h-5 w-5" />
                <span>Fazer Novo Agendamento</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetails;