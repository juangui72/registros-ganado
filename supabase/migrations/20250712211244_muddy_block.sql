/*
  # Create registros table and related schema

  1. New Tables
    - `registros`
      - `id` (uuid, primary key)
      - `socio` (text, not null)
      - `fecha` (date, not null)
      - `entradas` (integer, default 0)
      - `salidas` (integer, default 0)
      - `saldo` (integer, default 0)
      - `kg_totales` (numeric, default 0)
      - `vr_kilo` (numeric, default 0)
      - `fletes` (numeric, default 0)
      - `comision` (numeric, default 0)
      - `valor_animal` (numeric, default 0)
      - `total` (numeric, default 0)
      - `created_at` (timestamptz, default now())
      - `updated_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `registros` table
    - Add policy for public access (as per current schema)

  3. Indexes
    - Index on `socio` for faster queries
    - Index on `fecha` for date-based filtering

  4. Triggers
    - Auto-update `updated_at` timestamp on record changes
*/

-- Create the registros table
CREATE TABLE IF NOT EXISTS registros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  socio text NOT NULL,
  fecha date NOT NULL,
  entradas integer DEFAULT 0,
  salidas integer DEFAULT 0,
  saldo integer DEFAULT 0,
  kg_totales numeric(10,2) DEFAULT 0,
  vr_kilo numeric(10,2) DEFAULT 0,
  fletes numeric(10,2) DEFAULT 0,
  comision numeric(10,2) DEFAULT 0,
  valor_animal numeric(10,2) DEFAULT 0,
  total numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Create policy for public access (matching current schema)
CREATE POLICY "Allow all operations on registros"
  ON registros
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registros_socio ON registros (socio);
CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros (fecha);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_registros_updated_at
  BEFORE UPDATE ON registros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();