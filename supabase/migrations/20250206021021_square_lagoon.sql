/*
  # Esquema inicial do banco de dados

  1. Novas Tabelas
    - `profiles`
      - `id` (uuid, chave primária)
      - `email` (text, único)
      - `full_name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `subscriptions`
      - `id` (uuid, chave primária)
      - `user_id` (uuid, referência a profiles)
      - `status` (text)
      - `plan_id` (text)
      - `current_period_end` (timestamp)
      - `created_at` (timestamp)
    - `modules`
      - `id` (uuid, chave primária)
      - `name` (text)
      - `description` (text)
      - `price` (integer)
      - `active` (boolean)

  2. Segurança
    - RLS ativado em todas as tabelas
    - Políticas de acesso para usuários autenticados
*/

-- Profiles table
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ler seu próprio perfil"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar seu próprio perfil"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'active',
  plan_id text NOT NULL,
  current_period_end timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias assinaturas"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Modules table
CREATE TABLE modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price integer NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer um pode ver módulos ativos"
  ON modules
  FOR SELECT
  USING (active = true);