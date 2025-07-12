/*
  # Create ventas table

  1. New Tables
    - `ventas`
      - `id` (uuid, primary key)
      - `registro_id` (uuid, foreign key to registros)
      - `socio` (text, partner name)
      - `fecha` (date)
      - `valor_kilo_venta` (numeric, sale price per kg)
      - `total_kilos` (numeric, total kg sold)
      - `valor_venta` (numeric, calculated sale value)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on ventas table
    - Add policy for public access

  3. Indexes
    - Index on socio for better performance
    - Index on registro_id for relationships
*/

CREATE TABLE IF NOT EXISTS ventas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id uuid,
  socio text NOT NULL,
  fecha date NOT NULL,
  valor_kilo_venta numeric(10,2) DEFAULT 0,
  total_kilos numeric(10,2) DEFAULT 0,
  valor_venta numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT ventas_registro_id_fkey 
    FOREIGN KEY (registro_id) REFERENCES registros(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ventas_socio ON ventas(socio);
CREATE INDEX IF NOT EXISTS idx_ventas_registro_id ON ventas(registro_id);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha);

-- Enable RLS
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on ventas"
  ON ventas
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);