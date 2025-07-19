import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X, Settings, Calendar, ArrowLeft, CreditCard, Sparkles, MapPin } from 'lucide-react';
import { Service } from '../types';
import { supabase } from '../lib/supabase';
import AvailabilityManager from './AvailabilityManager';
import ServiceAvailabilityManager from './ServiceAvailabilityManager';
import PaymentSettings from './PaymentSettings';

interface AdminPanelProps {
  services: Service[];
  onServicesUpdate: (services: Service[]) => void;
  onBackToAppointments?: () => void;
  onSettingsUpdate?: () => void;
}

const AdminPanel = ({ services, onServicesUpdate, onBackToAppointments, onSettingsUpdate }: AdminPanelProps) => {
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [newService, setNewService] = useState<Partial<Service>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAvailability, setShowAvailability] = useState(false);
  const [showServiceAvailability, setShowServiceAvailability] = useState(false);
  const [showPaymentSettings, setShowPaymentSettings] = useState(false);
  const [showAddressSettings, setShowAddressSettings] = useState(false);
  const [showAboutMeSettings, setShowAboutMeSettings] = useState(false);
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [salonAddress, setSalonAddress] = useState('');
  const [aboutMeText, setAboutMeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load salon settings from Supabase database
    loadSalonSettingsFromDB();
  }, []);

  const loadSalonSettingsFromDB = async () => {
    try {
      const { data: settings, error } = await supabase
        .from('salon_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('Error fetching salon settings:', error);
        return;
      }

      if (settings && settings.length > 0) {
        const settingsMap = settings.reduce((acc, setting) => {
          acc[setting.setting_key] = setting.setting_value;
          return acc;
        }, {} as Record<string, string>);

        setSalonAddress(settingsMap.salon_address || 'Rua das Flores, 123 - Centro, Recife - PE');
        setAboutMeText(settingsMap.about_me_text || 'Profissional especializada em beleza e bem-estar, com anos de experiência em transformar sonhos em realidade. Apaixonada por criar looks únicos que realçam a beleza natural de cada cliente.');
      } else {
        // No settings found, use defaults
        setSalonAddress('Rua das Flores, 123 - Centro, Recife - PE');
        setAboutMeText('Profissional especializada em beleza e bem-estar, com anos de experiência em transformar sonhos em realidade. Apaixonada por criar looks únicos que realçam a beleza natural de cada cliente.');
      }
    } catch (error) {
      console.error('Error loading salon settings:', error);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
  };

  const handleSave = async (service: Service) => {
    setLoading(true);
    setError('');
    
    try {
      const { error: updateError } = await supabase
        .from('services')
        .update({
          name: service.name,
          duration: service.duration,
          price: service.price,
          updated_at: new Date().toISOString()
        })
        .eq('id', service.id);

      if (updateError) throw updateError;

      onServicesUpdate(services.map(s => s.id === service.id ? service : s));
      setEditingService(null);
    } catch (err) {
      console.error('Error updating service:', err);
      setError('Erro ao atualizar serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) {
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { error: deleteError } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      onServicesUpdate(services.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting service:', err);
      setError('Erro ao excluir serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newService.name || !newService.duration || !newService.price) {
      setError('Todos os campos são obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data, error: insertError } = await supabase
        .from('services')
        .insert([{
          name: newService.name,
          duration: newService.duration,
          price: Number(newService.price)
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      const newServiceData: Service = {
        id: data.id,
        name: data.name,
        duration: data.duration,
        price: data.price
      };

      onServicesUpdate([...services, newServiceData]);
      setNewService({});
      setShowAddForm(false);
    } catch (err) {
      console.error('Error adding service:', err);
      setError('Erro ao adicionar serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      alert('Credenciais atualizadas com sucesso!');
      setShowSettings(false);
      setEmail('');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      alert('Erro ao atualizar credenciais');
    }
  };

  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Save to Supabase database
      const { error: upsertError } = await supabase
        .from('salon_settings')
        .upsert({
          setting_key: 'salon_address',
          setting_value: salonAddress,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (upsertError) {
        throw upsertError;
      }

      alert('Endereço atualizado com sucesso!');
      onSettingsUpdate?.();
      setShowAddressSettings(false);
    } catch (error) {
      console.error('Error updating salon address:', error);
      alert('Erro ao atualizar endereço');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAboutMe = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      // Save to Supabase database
      const { error: upsertError } = await supabase
        .from('salon_settings')
        .upsert({
          setting_key: 'about_me_text',
          setting_value: aboutMeText,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'setting_key'
        });

      if (upsertError) {
        throw upsertError;
      }

      alert('Texto "Sobre mim" atualizado com sucesso!');
      onSettingsUpdate?.();
      setShowAboutMeSettings(false);
    } catch (error) {
      console.error('Error updating about me text:', error);
      alert('Erro ao atualizar texto "Sobre mim"');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4 mb-6">
          {/* Title and Back Button */}
          <div className="flex items-center space-x-4">
            {onBackToAppointments && (
              <button
                onClick={onBackToAppointments}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
                title="Voltar para área de agendamento"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="text-sm font-medium hidden sm:inline">Voltar</span>
              </button>
            )}
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gerenciar Serviços</h2>
          </div>
          
          {/* Action Buttons - Mobile Responsive */}
          <div className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-3">
            <button
              onClick={() => setShowAvailability(true)}
              className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition duration-200 text-sm"
            >
              <Calendar className="h-4 w-4" />
              <span className="whitespace-nowrap">Horários Gerais</span>
            </button>

            <button
              onClick={() => setShowServiceAvailability(true)}
              className="flex items-center justify-center space-x-2 bg-indigo-600 text-white px-3 py-2 rounded-md hover:bg-indigo-700 transition duration-200 text-sm"
            >
              <Sparkles className="h-4 w-4" />
              <span className="whitespace-nowrap">Horários por Serviço</span>
            </button>
            
            <button
              onClick={() => setShowPaymentSettings(true)}
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition duration-200 text-sm"
            >
              <CreditCard className="h-4 w-4" />
              <span className="whitespace-nowrap">Configurar Pagamentos</span>
            </button>
            
            <button
              onClick={() => setShowAddressSettings(true)}
              className="flex items-center justify-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition duration-200 text-sm"
            >
              <MapPin className="h-4 w-4" />
              <span className="whitespace-nowrap">Editar Endereço</span>
            </button>
            
            <button
              onClick={() => setShowAboutMeSettings(true)}
              className="flex items-center justify-center space-x-2 bg-orange-600 text-white px-3 py-2 rounded-md hover:bg-orange-700 transition duration-200 text-sm sm:col-span-1"
            >
              <Sparkles className="h-4 w-4" />
              <span className="whitespace-nowrap">Editar Sobre Mim</span>
            </button>
            
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center justify-center space-x-2 bg-gray-600 text-white px-3 py-2 rounded-md hover:bg-gray-700 transition duration-200 text-sm sm:col-span-1"
            >
              <Settings className="h-4 w-4" />
              <span className="whitespace-nowrap">Alterar Credenciais</span>
            </button>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center justify-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 transition duration-200 text-sm sm:col-span-2"
            >
              <Plus className="h-4 w-4" />
              <span className="whitespace-nowrap">Adicionar Serviço</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        {showAvailability && (
          <AvailabilityManager onClose={() => setShowAvailability(false)} />
        )}

        {showServiceAvailability && (
          <ServiceAvailabilityManager 
            onClose={() => setShowServiceAvailability(false)} 
            services={services}
          />
        )}

        {showPaymentSettings && (
          <PaymentSettings onClose={() => setShowPaymentSettings(false)} />
        )}

        {showAddressSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Editar Endereço do Salão</h3>
              <form onSubmit={handleUpdateAddress} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Endereço Completo
                  </label>
                  <textarea
                    value={salonAddress}
                    onChange={(e) => setSalonAddress(e.target.value)}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                    placeholder="Rua, número - Bairro, Cidade - Estado"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Este endereço será exibido na área de agendamento
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-200"
                  >
                    Salvar Endereço
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressSettings(false);
                      // Reload settings from database
                      loadSalonSettingsFromDB();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAboutMeSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Editar "Sobre Mim"</h3>
              <form onSubmit={handleUpdateAboutMe} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Texto "Sobre Mim"
                  </label>
                  <textarea
                    value={aboutMeText}
                    onChange={(e) => setAboutMeText(e.target.value)}
                    rows={6}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                    placeholder="Descreva sua experiência e especialidades..."
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Este texto será exibido no menu "Informações" da área de agendamento
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-200"
                  >
                    Salvar Texto
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAboutMeSettings(false);
                      // Reload settings from database
                      loadSalonSettingsFromDB();
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showSettings && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Alterar Credenciais</h3>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Novo Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Senha Atual
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 p-2 border"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 transition duration-200"
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSettings(false);
                      setEmail('');
                      setCurrentPassword('');
                      setNewPassword('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition duration-200"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showAddForm && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Novo Serviço</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <input
                type="text"
                placeholder="Nome do serviço"
                className="border rounded-md p-2 w-full"
                value={newService.name || ''}
                onChange={e => setNewService({ ...newService, name: e.target.value })}
              />
              <input
                type="text"
                placeholder="Duração (ex: 30min)"
                className="border rounded-md p-2 w-full"
                value={newService.duration || ''}
                onChange={e => setNewService({ ...newService, duration: e.target.value })}
              />
              <input
                type="number"
                placeholder="Preço"
                className="border rounded-md p-2 w-full"
                value={newService.price || ''}
                onChange={e => setNewService({ ...newService, price: Number(e.target.value) })}
              />
            </div>
            <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={handleAdd}
                disabled={loading}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-200 disabled:opacity-50 flex-shrink-0"
              >
                {loading ? 'Adicionando...' : 'Adicionar'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewService({});
                  setError('');
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition duration-200 flex-shrink-0"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Services Table - Mobile Responsive */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duração
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço
                </th>
                <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map(service => (
                <tr key={service.id}>
                  {editingService?.id === service.id ? (
                    <>
                      <td className="px-3 sm:px-6 py-4">
                        <input
                          type="text"
                          className="border rounded p-1 w-full text-sm"
                          value={editingService.name}
                          onChange={e => setEditingService({ ...editingService, name: e.target.value })}
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <input
                          type="text"
                          className="border rounded p-1 w-full text-sm"
                          value={editingService.duration}
                          onChange={e => setEditingService({ ...editingService, duration: e.target.value })}
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <input
                          type="number"
                          className="border rounded p-1 w-full text-sm"
                          value={editingService.price}
                          onChange={e => setEditingService({ ...editingService, price: Number(e.target.value) })}
                        />
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleSave(editingService)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingService(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 sm:px-6 py-4 text-sm font-medium text-gray-900">{service.name}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">{service.duration}</td>
                      <td className="px-3 sm:px-6 py-4 text-sm text-gray-500">R$ {service.price}</td>
                      <td className="px-3 sm:px-6 py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-900 disabled:opacity-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;