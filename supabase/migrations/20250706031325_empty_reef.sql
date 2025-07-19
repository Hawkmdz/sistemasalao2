/*
  # Corrigir políticas RLS para permitir agendamentos de convidados

  1. Mudanças
    - Atualizar políticas da tabela appointments para permitir INSERT de usuários anônimos
    - Garantir que todas as tabelas relacionadas permitam SELECT para usuários anônimos
    - Manter segurança para operações de gerenciamento (apenas usuários autenticados)

  2. Segurança
    - Usuários anônimos podem apenas INSERIR agendamentos
    - Usuários anônimos podem LER serviços e disponibilidade
    - Apenas usuários autenticados podem gerenciar dados
*/

-- Remover políticas existentes para recriar corretamente
DROP POLICY IF EXISTS "Anyone can create appointments" ON appointments;
DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can view all appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can update appointments" ON appointments;
DROP POLICY IF EXISTS "Authenticated users can delete appointments" ON appointments;

-- Permitir que usuários anônimos criem agendamentos
CREATE POLICY "Anyone can create appointments"
  ON appointments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Permitir que usuários autenticados vejam todos os agendamentos
CREATE POLICY "Authenticated users can view all appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (true);

-- Permitir que usuários autenticados atualizem agendamentos
CREATE POLICY "Authenticated users can update appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Permitir que usuários autenticados excluam agendamentos
CREATE POLICY "Authenticated users can delete appointments"
  ON appointments
  FOR DELETE
  TO authenticated
  USING (true);

-- Atualizar políticas de serviços para permitir acesso anônimo
DROP POLICY IF EXISTS "Anyone can read services" ON services;
DROP POLICY IF EXISTS "Allow public read access to services" ON services;
DROP POLICY IF EXISTS "Allow authenticated users to manage services" ON services;
DROP POLICY IF EXISTS "Authenticated users can manage services" ON services;

CREATE POLICY "Anyone can read services"
  ON services
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage services"
  ON services
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Atualizar políticas de datas disponíveis
DROP POLICY IF EXISTS "Anyone can view available dates" ON available_dates;
DROP POLICY IF EXISTS "Authenticated users can manage available dates" ON available_dates;

CREATE POLICY "Anyone can view available dates"
  ON available_dates
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage available dates"
  ON available_dates
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Atualizar políticas de horários disponíveis
DROP POLICY IF EXISTS "Anyone can view available times" ON available_times;
DROP POLICY IF EXISTS "Authenticated users can manage available times" ON available_times;

CREATE POLICY "Anyone can view available times"
  ON available_times
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage available times"
  ON available_times
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Atualizar políticas de disponibilidade por serviço
DROP POLICY IF EXISTS "Anyone can view service availability" ON service_availability;
DROP POLICY IF EXISTS "Authenticated users can manage service availability" ON service_availability;

CREATE POLICY "Anyone can view service availability"
  ON service_availability
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage service availability"
  ON service_availability
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);