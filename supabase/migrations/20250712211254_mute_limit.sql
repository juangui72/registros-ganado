/*
  # Create salidas_detalle table

  1. New Tables
    - `salidas_detalle`
      - `id` (uuid, primary key)
      - `registro_id` (uuid, foreign key to registros)
      - `socio` (text, not null)
      - `fecha` (date, not null)
      - `cantidad` (integer, not null)
      - `causa` (text, check constraint for valid values)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `salidas_detalle` table
    - Add policy for public access

  3. Constraints
    - Foreign key relationship with registros table
    - Check constraint for valid causa values

  4. Indexes
    - Index on `registro_id` for foreign key performance
    - Index on `socio` for filtering
*/

-- Create the salidas_detalle table
CREATE TABLE IF NOT EXISTS salidas_detalle (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_id uuid,
  socio text NOT NULL,
  fecha date NOT NULL,
  cantidad integer NOT NULL,
  causa text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add check constraint for causa values
ALTER TABLE salidas_detalle 
ADD CONSTRAINT salidas_detalle_causa_check 
CHECK (causa = ANY (ARRAY['ventas'::text, 'muerte'::text, 'robo'::text]));

-- Add foreign key constraint
ALTER TABLE salidas_detalle 
ADD CONSTRAINT salidas_detalle_registro_id_fkey 
FOREIGN KEY (registro_id) REFERENCES registros(id) ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE salidas_detalle ENABLE ROW LEVEL SECURITY;

-- Create policy for public access
CREATE POLICY "Allow all operations on salidas_detalle"
  ON salidas_detalle
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_salidas_detalle_registro_id ON salidas_detalle (registro_id);
CREATE INDEX IF NOT EXISTS idx_salidas_detalle_socio ON salidas_detalle (socio);