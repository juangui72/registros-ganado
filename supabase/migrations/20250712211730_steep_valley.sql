/*
  # Create salidas_detalle table for exit details

  1. New Tables
    - `salidas_detalle`
      - `id` (uuid, primary key)
      - `registro_id` (uuid, foreign key to registros)
      - `socio` (text, partner name)
      - `fecha` (date)
      - `cantidad` (integer, quantity)
      - `causa` (text, reason: 'ventas', 'muerte', 'robo')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on table
    - Add policies for public access

  3. Constraints
    - Foreign key to registros table
    - Check constraint for causa values
*/

-- Create salidas_detalle table
CREATE TABLE IF NOT EXISTS salidas_detalle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id uuid,
  socio text NOT NULL,
  fecha date NOT NULL,
  cantidad integer NOT NULL,
  causa text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT salidas_detalle_registro_id_fkey 
    FOREIGN KEY (registro_id) REFERENCES registros(id) ON DELETE CASCADE,
  CONSTRAINT salidas_detalle_causa_check 
    CHECK (causa IN ('ventas', 'muerte', 'robo'))
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_salidas_detalle_registro_id ON salidas_detalle(registro_id);
CREATE INDEX IF NOT EXISTS idx_salidas_detalle_socio ON salidas_detalle(socio);

-- Enable RLS
ALTER TABLE salidas_detalle ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on salidas_detalle"
  ON salidas_detalle
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);