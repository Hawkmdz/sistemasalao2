import React from 'react';
import { QrCode, Smartphone, Copy, CheckCircle, Zap, Shield, CreditCard } from 'lucide-react';

interface PaymentScreenProps {
  amount: number;
  onPaymentComplete: () => void;
}

const PaymentScreen = ({ amount, onPaymentComplete }: PaymentScreenProps) => {
  const pixKey = '000.000.00-00';
  const [copied, setCopied] = React.useState(false);

  const handleCopyPixKey = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      {/* Animated background */}
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
              Pagamento Seguro
            </h2>
            <p className="text-gray-300 text-lg">
              Finalize seu agendamento com PIX instantâneo
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

          {/* PIX Key Section */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl blur-lg"></div>
            <div className="relative bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-600/30 to-blue-600/30 rounded-xl">
                    <Smartphone className="h-5 w-5 text-purple-300" />
                  </div>
                  <span className="font-bold text-white text-lg">Chave PIX (CPF)</span>
                </div>
                <button
                  onClick={handleCopyPixKey}
                  className="group flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 border border-blue-400/30 rounded-xl transition-all duration-300 transform hover:scale-105"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-400" />
                      <span className="text-green-400 font-medium">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-5 w-5 text-blue-300" />
                      <span className="text-blue-300 font-medium">Copiar</span>
                    </>
                  )}
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl blur-sm"></div>
                <div className="relative bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-xl p-4">
                  <div className="text-2xl font-mono text-center text-white font-bold tracking-wider">
                    {pixKey}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-2xl blur-lg"></div>
            <div className="relative bg-gradient-to-r from-yellow-500/10 to-orange-500/10 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-500/30 to-orange-500/30 rounded-xl">
                  <Zap className="h-5 w-5 text-yellow-300" />
                </div>
                <h3 className="font-bold text-yellow-200 text-lg">Como pagar via PIX:</h3>
              </div>
              
              <ol className="space-y-3 text-gray-300">
                {[
                  'Abra o app do seu banco',
                  'Escolha pagar via PIX',
                  'Cole a chave PIX copiada',
                  `Confirme o valor de R$ ${amount.toFixed(2)}`,
                  'Conclua o pagamento'
                ].map((step, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-400/30">
                      <span className="text-yellow-300 font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="font-medium">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Security Badge */}
          <div className="flex items-center justify-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-2xl border border-green-400/20">
            <Shield className="h-5 w-5 text-green-400" />
            <span className="text-green-300 font-medium text-sm">
              Pagamento 100% seguro e criptografado
            </span>
          </div>

          {/* Confirm Button */}
          <button
            onClick={onPaymentComplete}
            className="group relative w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center space-x-3">
              <CheckCircle className="h-6 w-6" />
              <span>Confirmar Pagamento</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;