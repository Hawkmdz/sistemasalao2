import React, { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Banknote, Save, X } from 'lucide-react';

interface PaymentSettingsProps {
  onClose: () => void;
}

interface PaymentConfig {
  pixEnabled: boolean;
  cardEnabled: boolean;
  cashEnabled: boolean;
  pixKey: string;
  pixKeyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
}

const PaymentSettings = ({ onClose }: PaymentSettingsProps) => {
  const [settings, setSettings] = useState<PaymentConfig>({
    pixEnabled: true,
    cardEnabled: true,
    cashEnabled: true,
    pixKey: '000.000.000-00',
    pixKeyType: 'cpf'
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('paymentSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        // Validate pixKeyType and provide default if invalid
        const validPixKeyTypes = ['cpf', 'cnpj', 'email', 'phone', 'random'];
        if (!parsed.pixKeyType || !validPixKeyTypes.includes(parsed.pixKeyType)) {
          parsed.pixKeyType = 'cpf';
        }
        setSettings(parsed);
      } catch (error) {
        console.error('Error parsing payment settings from localStorage:', error);
        // Keep default settings if parsing fails
      }
    }
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Save to localStorage (in a real app, this would be saved to the database)
      localStorage.setItem('paymentSettings', JSON.stringify(settings));
      setSuccess('Configurações salvas com sucesso!');
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const formatPixKey = (value: string) => {
    switch (settings.pixKeyType) {
      case 'cpf':
        const cpfNumbers = value.replace(/\D/g, '');
        if (cpfNumbers.length <= 11) {
          return cpfNumbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        return value;
      
      case 'cnpj':
        const cnpjNumbers = value.replace(/\D/g, '');
        if (cnpjNumbers.length <= 14) {
          return cnpjNumbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return value;
      
      case 'phone':
        const phoneNumbers = value.replace(/\D/g, '');
        if (phoneNumbers.length <= 11) {
          return phoneNumbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        return value;
      
      case 'email':
      case 'random':
      default:
        return value;
    }
  };

  const handlePixKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPixKey(e.target.value);
    setSettings({ ...settings, pixKey: formatted });
  };

  const handlePixKeyTypeChange = (type: PaymentConfig['pixKeyType']) => {
    setSettings({ 
      ...settings, 
      pixKeyType: type,
      pixKey: '' // Clear key when type changes
    });
  };

  const getPixKeyPlaceholder = () => {
    switch (settings.pixKeyType) {
      case 'cpf': return '000.000.000-00';
      case 'cnpj': return '00.000.000/0000-00';
      case 'email': return 'seu@email.com';
      case 'phone': return '(11) 99999-9999';
      case 'random': return 'Chave aleatória (UUID)';
      default: return '';
    }
  };

  const getPixKeyMaxLength = () => {
    switch (settings.pixKeyType) {
      case 'cpf': return 14;
      case 'cnpj': return 18;
      case 'phone': return 15;
      case 'email': return 50;
      case 'random': return 36;
      default: return 50;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">Configurações de Pagamento</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-md text-sm">
              {success}
            </div>
          )}

          <div className="space-y-6">
            {/* PIX Settings */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                    <Smartphone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">PIX</h4>
                    <p className="text-sm text-gray-500">Pagamento instantâneo</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pixEnabled}
                    onChange={(e) => setSettings({ ...settings, pixEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>
              
              {settings.pixEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Chave PIX
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {[
                      { value: 'cpf', label: 'CPF' },
                      { value: 'cnpj', label: 'CNPJ' },
                      { value: 'email', label: 'E-mail' },
                      { value: 'phone', label: 'Telefone' },
                      { value: 'random', label: 'Chave Aleatória' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => handlePixKeyTypeChange(option.value as PaymentConfig['pixKeyType'])}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                          settings.pixKeyType === option.value
                            ? 'bg-green-100 border-green-500 text-green-700'
                            : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chave PIX ({settings.pixKeyType.toUpperCase()})
                  </label>
                  <input
                    type={settings.pixKeyType === 'email' ? 'email' : 'text'}
                    value={settings.pixKey}
                    onChange={handlePixKeyChange}
                    placeholder={getPixKeyPlaceholder()}
                    maxLength={getPixKeyMaxLength()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {settings.pixKeyType === 'random' && 'Chave aleatória gerada pelo banco (UUID)'}
                    {settings.pixKeyType === 'email' && 'E-mail cadastrado no banco'}
                    {settings.pixKeyType === 'phone' && 'Telefone cadastrado no banco'}
                    {settings.pixKeyType === 'cpf' && 'CPF do titular da conta'}
                    {settings.pixKeyType === 'cnpj' && 'CNPJ da empresa'}
                  </p>
                </div>
              )}
            </div>

            {/* Card Settings */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Cartão</h4>
                    <p className="text-sm text-gray-500">Crédito ou Débito</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cardEnabled}
                    onChange={(e) => setSettings({ ...settings, cardEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>

            {/* Cash Settings */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg">
                    <Banknote className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Dinheiro</h4>
                    <p className="text-sm text-gray-500">Pagamento no local</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.cashEnabled}
                    onChange={(e) => setSettings({ ...settings, cashEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="mt-8 flex space-x-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 flex items-center justify-center space-x-2 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Salvar</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;