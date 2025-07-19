import React, { useState, useEffect } from 'react';
import { Sparkles, UserCircle, Clock, DollarSign, Star, MessageCircle, Zap, Scissors, Crown, Menu, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import AppointmentForm from './components/AppointmentForm';
import AppointmentDetails from './components/AppointmentDetails';
import PaymentOptions from './components/PaymentOptions';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import ProfileScreen from './components/ProfileScreen';
import { Service } from './types';
import { getCurrentUser, signOut, UserRole, supabase } from './lib/supabase';

const createDefaultServicesWithUUIDs = (): Service[] => [
  { id: uuidv4(), name: 'Corte Feminino', duration: '45min', price: 80 },
  { id: uuidv4(), name: 'Escova e Prancha', duration: '60min', price: 60 },
  { id: uuidv4(), name: 'Coloração', duration: '120min', price: 150 },
  { id: uuidv4(), name: 'Manicure', duration: '30min', price: 35 },
  { id: uuidv4(), name: 'Pedicure', duration: '45min', price: 45 },
  { id: uuidv4(), name: 'Sobrancelha', duration: '20min', price: 25 },
];

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInfoMenuOpen, setIsInfoMenuOpen] = useState(false);
  const [appointment, setAppointment] = useState<null | {
    name: string;
    service: string;
    date: string;
    time: string;
  }>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [salonAddress, setSalonAddress] = useState('');
  const [aboutMeText, setAboutMeText] = useState('');

  // Load salon settings from Supabase database
  const loadSalonSettings = () => {
    fetchSalonSettingsFromDB();
  };

  // Fetch salon settings from Supabase
  const fetchSalonSettingsFromDB = async () => {
    try {
      const { data: settings, error } = await supabase
        .from('salon_settings')
        .select('setting_key, setting_value');

      if (error) {
        console.error('Error fetching salon settings:', error);
        // Use defaults if error
        setSalonAddress('Rua das Flores, 123 - Centro, Recife - PE');
        setAboutMeText('Profissional especializada em beleza e bem-estar, com anos de experiência em transformar sonhos em realidade. Apaixonada por criar looks únicos que realçam a beleza natural de cada cliente.');
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
      console.error('Error in fetchSalonSettingsFromDB:', error);
      // Use defaults if error
      setSalonAddress('Rua das Flores, 123 - Centro, Recife - PE');
      setAboutMeText('Profissional especializada em beleza e bem-estar, com anos de experiência em transformar sonhos em realidade. Apaixonada por criar looks únicos que realçam a beleza natural de cada cliente.');
    }
  };

  // Get current salon address
  const getSalonAddress = () => {
    return salonAddress || 'Rua das Flores, 123 - Centro, Recife - PE';
  };

  // Get current about me text
  const getAboutMeText = () => {
    return aboutMeText || 'Profissional especializada em beleza e bem-estar, com anos de experiência em transformar sonhos em realidade. Apaixonada por criar looks únicos que realçam a beleza natural de cada cliente.';
  };

  // Load services from database
  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading services:', error);
        // If there's an error or no services, use default services
        setServices(createDefaultServicesWithUUIDs());
        return;
      }

      if (data && data.length > 0) {
        // Convert database services to our Service type
        const dbServices: Service[] = data.map(service => ({
          id: service.id,
          name: service.name,
          duration: service.duration,
          price: service.price
        }));
        setServices(dbServices);
      } else {
        // No services in database, insert default services
        await insertDefaultServices();
      }
    } catch (error) {
      console.error('Error in loadServices:', error);
      setServices(createDefaultServicesWithUUIDs());
    }
  };

  // Insert default services into database
  const insertDefaultServices = async () => {
    try {
      const defaultServices = createDefaultServicesWithUUIDs();
      const { data, error } = await supabase
        .from('services')
        .insert(defaultServices.map(service => ({
          id: service.id,
          name: service.name,
          duration: service.duration,
          price: service.price
        })))
        .select();

      if (error) {
        console.error('Error inserting default services:', error);
        setServices(createDefaultServicesWithUUIDs());
        return;
      }

      if (data) {
        const dbServices: Service[] = data.map(service => ({
          id: service.id,
          name: service.name,
          duration: service.duration,
          price: service.price
        }));
        setServices(dbServices);
      }
    } catch (error) {
      console.error('Error in insertDefaultServices:', error);
      setServices(createDefaultServicesWithUUIDs());
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getCurrentUser();
        
        if (user) {
          setIsLoggedIn(true);
          setUserRole(user.user_metadata?.role as UserRole);
          setIsGuest(false);
          
          // Auto-show admin panel for admin users
          if (user.user_metadata?.role === 'admin') {
            setShowAdminPanel(true);
          }
        } else {
          // User not found or session invalid
          setIsLoggedIn(false);
          setUserRole(undefined);
          setIsGuest(false);
        }
      } catch (error) {
        console.error('Error checking user session:', error);
        setIsLoggedIn(false);
        setUserRole(undefined);
        setIsGuest(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();
    loadServices();
    loadSalonSettings();
  }, []);

  const handleAppointmentSubmit = (appointmentData: {
    name: string;
    service: string;
    date: string;
    time: string;
  }) => {
    setAppointment(appointmentData);
    setShowPayment(true);
  };

  const handleNewAppointment = () => {
    setAppointment(null);
    setShowPayment(false);
  };

  const getServicePrice = (serviceId: string): number => {
    const service = services.find(s => s.id === serviceId);
    return service?.price || 0;
  };

  const getServiceName = (serviceId: string): string => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || '';
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsLoggedIn(false);
      setUserRole(undefined);
      setShowProfile(false);
      setShowAdminPanel(false);
      setIsGuest(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleWhatsAppContact = () => {
    const message = `Olá! Gostaria de mais informações sobre os serviços do SALON TIME.`;
    
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

  // Get payment settings from localStorage
  const getPaymentSettings = () => {
    const savedSettings = localStorage.getItem('paymentSettings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      pixEnabled: true,
      cardEnabled: true,
      cashEnabled: true,
      pixKey: '000.000.000-00'
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-400"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border border-purple-400 opacity-20"></div>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={(role) => {
          setIsLoggedIn(true);
          setUserRole(role);
          setIsGuest(false);
          
          // Auto-show admin panel for admin users
          if (role === 'admin') {
            setShowAdminPanel(true);
          }
        }}
        onGuestContinue={() => {
          setIsLoggedIn(true);
          setUserRole('client');
          setIsGuest(true);
        }}
      />
    );
  }

  const Header = () => (
    <header className="relative bg-gradient-to-r from-slate-900/95 via-purple-900/95 to-slate-900/95 backdrop-blur-xl border-b border-purple-500/20 shadow-2xl">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute -top-2 right-1/4 w-16 h-16 bg-pink-500/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute top-0 right-0 w-32 h-8 bg-gradient-to-l from-purple-500/5 to-transparent"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl transform group-hover:scale-105 transition-transform duration-300">
                <Crown className="h-8 w-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                SALON TIME
              </h1>
              <div className="h-0.5 w-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {userRole === 'admin' && (
              <button
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className={`group relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                  showAdminPanel 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                    : 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/30'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">
                    {showAdminPanel ? 'Área de Agendamento' : 'Painel Admin'}
                  </span>
                </div>
                {!showAdminPanel && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600/0 to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-300"></div>
                )}
              </button>
            )}
            
            {!isGuest && (
              <button
                onClick={() => setShowProfile(true)}
                className="group flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/30 transition-all duration-300"
              >
                <UserCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Perfil</span>
              </button>
            )}
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300"
            >
              Sair
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center w-10 h-10 bg-white/5 border border-purple-500/30 rounded-lg text-purple-200 hover:text-white hover:bg-white/10 transition-all duration-200 backdrop-blur-sm"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 relative">
            <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl" />
            <div className="relative z-10 p-4 space-y-3">
              {userRole === 'admin' && (
                <button
                  onClick={() => {
                    setShowAdminPanel(!showAdminPanel);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 ${
                    showAdminPanel 
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25' 
                      : 'text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/30'
                  }`}
                >
                  <Zap className="h-5 w-5" />
                  <span>
                    {showAdminPanel ? 'Área de Agendamento' : 'Painel Admin'}
                  </span>
                </button>
              )}
              
              {!isGuest && (
                <button
                  onClick={() => {
                    setShowProfile(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/30 transition-all duration-300"
                >
                  <UserCircle className="h-5 w-5" />
                  <span>Perfil</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-400/30 transition-all duration-300"
              >
                <span>Sair</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );

  if (showProfile && !isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <ProfileScreen onBack={() => setShowProfile(false)} />
      </div>
    );
  }

  if (userRole === 'admin' && showAdminPanel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Header />
        <AdminPanel 
          services={services} 
          onServicesUpdate={(updatedServices) => {
            setServices(updatedServices);
          }}
          onBackToAppointments={() => setShowAdminPanel(false)}
          onSettingsUpdate={loadSalonSettings}
        />
      </div>
    );
  }

  const getServiceIcon = (serviceName: string) => {
    if (serviceName.toLowerCase().includes('corte') || serviceName.toLowerCase().includes('escova')) {
      return <Scissors className="h-6 w-6" />;
    }
    return <Sparkles className="h-6 w-6" />;
  };

  const getServiceGradient = (serviceName: string) => {
    if (serviceName.includes('Corte')) {
      return 'from-purple-500 via-purple-600 to-violet-700';
    } else if (serviceName.includes('Escova')) {
      return 'from-indigo-500 via-purple-600 to-purple-700';
    } else if (serviceName.includes('Coloração')) {
      return 'from-violet-500 via-purple-600 to-pink-600';
    } else if (serviceName.includes('Manicure')) {
      return 'from-purple-500 via-indigo-600 to-blue-600';
    } else if (serviceName.includes('Pedicure')) {
      return 'from-violet-500 via-purple-600 to-indigo-600';
    } else {
      return 'from-purple-500 via-violet-600 to-purple-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <Header />

      <main className="relative z-0 max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {appointment ? (
            showPayment ? (
              <PaymentOptions 
                amount={getServicePrice(appointment.service)}
                serviceName={getServiceName(appointment.service)}
                appointmentData={appointment}
                paymentSettings={getPaymentSettings()}
                onPaymentComplete={() => setShowPayment(false)}
              />
            ) : (
              <AppointmentDetails
                appointment={appointment}
                onNewAppointment={handleNewAppointment}
                services={services}
              />
            )
          ) : (
            <>
              {/* Appointment Booking Section */}
              <div className="relative mb-16">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl blur-xl"></div>
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                  {/* Header with animated gradient */}
                  <div className="relative bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 p-8 border-b border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-transparent to-pink-600/5 animate-pulse"></div>
                    <div className="relative text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl mb-6">
                        <Sparkles className="h-8 w-8 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-3">
                        Agende seu Horário
                      </h2>
                      <p className="text-gray-300 text-lg">
                        Transforme seu visual com nossos serviços premium
                      </p>
                      <div className="mt-4 flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-xl border border-purple-400/20">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <button
                          onClick={() => {
                            const address = encodeURIComponent(getSalonAddress());
                            window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
                          }}
                          className="text-purple-200 hover:text-white text-sm font-medium transition-colors duration-200 cursor-pointer underline decoration-purple-400/50 hover:decoration-white/70"
                          title="Clique para abrir no Google Maps"
                        >
                          {getSalonAddress()}
                        </button>
                      </div>
                      
                      {/* Info Menu Button */}
                      <div className="mt-4 flex justify-center">
                        <div className="relative">
                          <button
                            onClick={() => setIsInfoMenuOpen(!isInfoMenuOpen)}
                            className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/30 rounded-xl text-purple-200 hover:text-white transition-all duration-200 backdrop-blur-sm"
                          >
                            {isInfoMenuOpen ? (
                              <X className="h-4 w-4" />
                            ) : (
                              <Menu className="h-4 w-4" />
                            )}
                            <span className="text-sm font-medium">Informações</span>
                          </button>
                          
                          {/* Info Menu Dropdown */}
                          {isInfoMenuOpen && (
                            <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-50 w-64">
                              <div className="absolute inset-0 bg-slate-800/80 backdrop-blur-xl rounded-2xl border border-purple-500/30 shadow-2xl" />
                              <div className="relative z-10 p-4 space-y-3">
                                <div className="text-center mb-3">
                                  <h4 className="text-purple-200 font-bold text-sm">INFORMAÇÕES</h4>
                                  <div className="h-0.5 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mt-1"></div>
                                </div>
                                
                                <div className="space-y-3">
                                  <div className="flex items-start space-x-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                    <Sparkles className="h-5 w-5 text-purple-300 mt-0.5" />
                                    <div>
                                      <p className="text-white text-sm font-medium">Sobre mim</p>
                                      <p className="text-gray-300 text-xs leading-relaxed">
                                        {aboutMeText}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                    <MessageCircle className="h-5 w-5 text-green-300" />
                                    <div>
                                      <p className="text-white text-sm font-medium">WhatsApp</p>
                                      <p className="text-gray-300 text-xs">(81) 99676-3099</p>
                                    </div>
                                  </div>
                                  
                                  <button
                                    onClick={() => {
                                      handleWhatsAppContact();
                                      setIsInfoMenuOpen(false);
                                    }}
                                    className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-medium rounded-xl transition-all duration-300 text-sm"
                                  >
                                    <MessageCircle className="h-4 w-4" />
                                    <span>Falar no WhatsApp</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 h-1 w-32 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <AppointmentForm onSubmit={handleAppointmentSubmit} services={services} />
                  </div>
                </div>
              </div>

              {/* Services Section */}
              <div className="relative mb-16">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-3xl blur-xl"></div>
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                  <div className="relative bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 p-8 border-b border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-transparent to-purple-600/5 animate-pulse"></div>
                    <div className="relative text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl mb-6">
                        <Star className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-white via-indigo-200 to-purple-200 bg-clip-text text-transparent mb-3">
                        Nossos Serviços
                      </h3>
                      <p className="text-gray-300 text-lg">
                        Experiências únicas em beleza e bem-estar
                      </p>
                      <div className="mt-4 h-1 w-32 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mx-auto"></div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                      {services.map((service) => (
                        <div
                          key={service.id}
                          className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/10 backdrop-blur-sm border border-white/10 hover:border-purple-400/30 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                        >
                          {/* Gradient Background */}
                          <div className={`absolute inset-0 bg-gradient-to-br ${getServiceGradient(service.name)} opacity-20 group-hover:opacity-30 transition-opacity duration-500`} />
                          
                          {/* Animated border */}
                          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.4), transparent)', height: '1px'}}></div>
                          
                          {/* Content */}
                          <div className="relative p-8 text-white">
                            {/* Icon with glow effect */}
                            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                              {getServiceIcon(service.name)}
                            </div>
                            
                            {/* Service Name */}
                            <h4 className="text-xl font-bold mb-4 leading-tight bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                              {service.name}
                            </h4>
                            
                            {/* Service Details */}
                            <div className="space-y-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-lg">
                                  <Clock className="h-4 w-4 text-purple-300" />
                                </div>
                                <span className="text-sm font-medium text-gray-200">{service.duration}</span>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center justify-center w-8 h-8 bg-white/10 rounded-lg">
                                  <DollarSign className="h-4 w-4 text-green-300" />
                                </div>
                                <span className="text-xl font-bold text-white">R$ {service.price}</span>
                              </div>
                            </div>
                            
                            {/* Decorative Elements */}
                            <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl"></div>
                            <div className="absolute bottom-4 right-4 w-12 h-12 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-lg"></div>
                          </div>
                          
                          {/* Hover Effect Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/0 via-transparent to-pink-600/0 group-hover:from-purple-600/10 group-hover:to-pink-600/10 transition-all duration-500 rounded-2xl"></div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Call to Action */}
                    <div className="mt-12 text-center">
                      <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full border border-purple-400/30">
                        <Star className="h-5 w-5 text-purple-300" />
                        <p className="text-gray-300 text-sm font-medium">
                          Todos os serviços incluem consulta personalizada e produtos premium
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* WhatsApp Contact Section */}
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-green-600/10 to-emerald-600/10 rounded-3xl blur-xl"></div>
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
                  <div className="relative bg-gradient-to-r from-green-600/20 via-emerald-600/20 to-green-600/20 p-8 border-b border-white/10">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600/5 via-transparent to-emerald-600/5 animate-pulse"></div>
                    <div className="relative text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-2xl mb-6">
                        <MessageCircle className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-3xl font-bold bg-gradient-to-r from-white via-green-200 to-emerald-200 bg-clip-text text-transparent mb-3">
                        Precisa de Ajuda?
                      </h3>
                      <p className="text-gray-300 text-lg">
                        Estamos aqui para tornar sua experiência perfeita
                      </p>
                      <div className="mt-4 h-1 w-32 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mx-auto"></div>
                    </div>
                  </div>
                  
                  <div className="p-8 text-center">
                    <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                      Entre em contato conosco pelo WhatsApp para tirar dúvidas, confirmar agendamentos ou obter mais informações sobre nossos serviços premium.
                    </p>
                    
                    <button
                      onClick={handleWhatsAppContact}
                      className="group relative inline-flex items-center space-x-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 mb-6"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 rounded-2xl blur-lg opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
                      <MessageCircle className="h-6 w-6 relative z-10" />
                      <span className="relative z-10">Falar no WhatsApp</span>
                      <div className="relative z-10 w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </button>
                    
                    <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-400/20">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <p className="text-green-300 text-sm font-medium">
                        Respondemos rapidamente durante o horário comercial
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;