/*
  # Create registros table for livestock registry

  1. New Tables
    - `registros`
      - `id` (uuid, primary key)
      - `socio` (text, partner name)
      - `fecha` (date)
      - `entradas` (integer, entries)
      - `salidas` (integer, exits)
      - `saldo` (integer, balance)
      - `kg_totales` (numeric, total kg)
      - `vr_kilo` (numeric, price per kg)
      - `fletes` (numeric, freight costs)
      - `comision` (numeric, commission)
      - `valor_animal` (numeric, value per animal)
      - `total` (numeric, total value)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for public access

  3. Indexes
    - Index on socio for filtering
    - Index on fecha for sorting
*/

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create registros table
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_registros_socio ON registros(socio);
CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros(fecha);

-- Enable RLS
ALTER TABLE registros ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on registros"
  ON registros
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create trigger for updated_at
CREATE TRIGGER update_registros_updated_at
  BEFORE UPDATE ON registros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();