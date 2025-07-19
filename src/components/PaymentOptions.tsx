import React, { useState } from 'react';
import { CreditCard, Smartphone, Banknote, Copy, CheckCircle, MessageCircle, Shield } from 'lucide-react';

interface PaymentOptionsProps {
  amount: number;
  serviceName: string;
  appointmentData: {
    name: string;
    service: string;
    date: string;
    time: string;
  };
  paymentSettings: {
    pixEnabled: boolean;
    cardEnabled: boolean;
    cashEnabled: boolean;
    pixKey: string;
    pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  };
  onPaymentComplete: () => void;
}

const PaymentOptions = ({ 
  amount, 
  serviceName, 
  appointmentData, 
  paymentSettings, 
  onPaymentComplete 
}: PaymentOptionsProps) => {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(paymentSettings.pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCardPayment = () => {
    const formattedDate = formatDate(appointmentData.date);
    
    const message = `*Agendamento SALON TIME - Pagamento Cartão*\n\n` +
      `👤 Cliente: ${appointmentData.name}\n` +
      `✨ Serviço: ${serviceName}\n` +
      `💰 Valor: R$ ${amount.toFixed(2)}\n` +
      `📅 Data: ${formattedDate}\n` +
      `🕐 Horário: ${appointmentData.time}\n\n` +
      `💳 Forma de pagamento: CARTÃO DE CRÉDITO/DÉBITO\n\n` +
      `Gostaria de confirmar o agendamento e realizar o pagamento no cartão.`;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      const mobileUrl = `https://wa.me/5581996763099?text=${encodeURIComponent(message)}`;
      window.open(mobileUrl, '_blank');
    } else {
      const whatsappUrl = `https://web.whatsapp.com/send?phone=5581996763099&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
    
    onPaymentComplete();
  };

  const handleCashPayment = () => {
    const formattedDate = formatDate(appointmentData.date);
    
    const message = `*Agendamento SALON TIME - Pagamento Dinheiro*\n\n` +
      `👤 Cliente: ${appointmentData.name}\n` +
      `✨ Serviço: ${serviceName}\n` +
      `💰 Valor: R$ ${amount.toFixed(2)}\n` +
      `📅 Data: ${formattedDate}\n` +
      `🕐 Horário: ${appointmentData.time}\n\n` +
      `💵 Forma de pagamento: DINHEIRO\n\n` +
      `Gostaria de confirmar o agendamento e pagar em dinheiro no local.`;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      const mobileUrl = `https://wa.me/5581996763099?text=${encodeURIComponent(message)}`;
      window.open(mobileUrl, '_blank');
    } else {
      const whatsappUrl = `https://web.whatsapp.com/send?phone=5581996763099&text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
    
    onPaymentComplete();
  };

  const handlePixPayment = () => {
    onPaymentComplete();
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-xl"></div>
      
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-blue-600/20 p-8 border-b border-white/10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5 animate-pulse"></div>
          <div className="relative text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl mb-6">
              <CreditCard className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-3">
              Escolha o Pagamento
            </h2>
            <p className="text-gray-300 text-lg">
              Selecione sua forma de pagamento preferida
            </p>
            <div className="mt-4 h-1 w-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Amount Display */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-lg"></div>
              <div className="relative bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-sm border border-green-400/20 rounded-2xl p-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2">
                  R$ {amount.toFixed(2)}
                </div>
                <p className="text-gray-300 text-sm font-medium">Valor total do serviço</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-4">
            {/* PIX Option */}
            {paymentSettings.pixEnabled && (
              <div className={`relative transition-all duration-300 ${selectedMethod === 'pix' ? 'scale-105' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl blur-lg"></div>
                <div className={`relative bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                  selectedMethod === 'pix' 
                    ? 'border-green-400/50 bg-green-500/10' 
                    : 'border-white/10 hover:border-green-400/30 hover:bg-green-500/5'
                }`} onClick={() => setSelectedMethod('pix')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-green-600/30 to-emerald-600/30 rounded-xl">
                        <Smartphone className="h-6 w-6 text-green-300" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">PIX</h3>
                        <p className="text-gray-300 text-sm">Pagamento instantâneo</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      selectedMethod === 'pix' 
                        ? 'border-green-400 bg-green-400' 
                        : 'border-gray-400'
                    }`}>
                      {selectedMethod === 'pix' && (
                        <CheckCircle className="h-4 w-4 text-white m-0.5" />
                      )}
                    </div>
                  </div>
                  
                  {selectedMethod === 'pix' && (
                    <div className="space-y-4 border-t border-green-400/20 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-green-200">
                          Chave PIX ({paymentSettings.pixKeyType?.toUpperCase() || 'CPF'})
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyPixKey();
                          }}
                          className="flex items-center space-x-2 px-3 py-1 bg-green-600/20 hover:bg-green-600/30 border border-green-400/30 rounded-lg transition-all duration-300"
                        >
                          {copied ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-400" />
                              <span className="text-green-400 text-sm">Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4 text-green-300" />
                              <span className="text-green-300 text-sm">Copiar</span>
                            </>
                          )}
                        </button>
                      </div>
                      
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-xl font-mono text-center text-white font-bold tracking-wider">
                          {paymentSettings.pixKey}
                        </div>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePixPayment();
                        }}
                        className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl transition-all duration-300"
                      >
                        Confirmar Pagamento PIX
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Card Option */}
            {paymentSettings.cardEnabled && (
              <div className={`relative transition-all duration-300 ${selectedMethod === 'card' ? 'scale-105' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur-lg"></div>
                <div className={`relative bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                  selectedMethod === 'card' 
                    ? 'border-blue-400/50 bg-blue-500/10' 
                    : 'border-white/10 hover:border-blue-400/30 hover:bg-blue-500/5'
                }`} onClick={() => setSelectedMethod('card')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl">
                        <CreditCard className="h-6 w-6 text-blue-300" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Cartão</h3>
                        <p className="text-gray-300 text-sm">Crédito ou Débito</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      selectedMethod === 'card' 
                        ? 'border-blue-400 bg-blue-400' 
                        : 'border-gray-400'
                    }`}>
                      {selectedMethod === 'card' && (
                        <CheckCircle className="h-4 w-4 text-white m-0.5" />
                      )}
                    </div>
                  </div>
                  
                  {selectedMethod === 'card' && (
                    <div className="space-y-4 border-t border-blue-400/20 pt-4">
                      <p className="text-blue-200 text-sm">
                        Você será redirecionado para o WhatsApp para confirmar o pagamento no cartão.
                      </p>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardPayment();
                        }}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-300"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span>Confirmar via WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cash Option */}
            {paymentSettings.cashEnabled && (
              <div className={`relative transition-all duration-300 ${selectedMethod === 'cash' ? 'scale-105' : ''}`}>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-2xl blur-lg"></div>
                <div className={`relative bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${
                  selectedMethod === 'cash' 
                    ? 'border-yellow-400/50 bg-yellow-500/10' 
                    : 'border-white/10 hover:border-yellow-400/30 hover:bg-yellow-500/5'
                }`} onClick={() => setSelectedMethod('cash')}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-yellow-600/30 to-orange-600/30 rounded-xl">
                        <Banknote className="h-6 w-6 text-yellow-300" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">Dinheiro</h3>
                        <p className="text-gray-300 text-sm">Pagamento no local</p>
                      </div>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${
                      selectedMethod === 'cash' 
                        ? 'border-yellow-400 bg-yellow-400' 
                        : 'border-gray-400'
                    }`}>
                      {selectedMethod === 'cash' && (
                        <CheckCircle className="h-4 w-4 text-white m-0.5" />
                      )}
                    </div>
                  </div>
                  
                  {selectedMethod === 'cash' && (
                    <div className="space-y-4 border-t border-yellow-400/20 pt-4">
                      <p className="text-yellow-200 text-sm">
                        Você pagará em dinheiro no momento do atendimento.
                      </p>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCashPayment();
                        }}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all duration-300"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span>Confirmar via WhatsApp</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-400/20">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-green-300 font-medium text-sm">
              Pagamento 100% seguro e criptografado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptions;