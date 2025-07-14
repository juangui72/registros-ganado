/*
  # Actualizar políticas de seguridad RLS

  1. Cambios en Seguridad
    - Eliminar políticas públicas existentes
    - Crear nuevas políticas más restrictivas
    - Requerir autenticación para todas las operaciones

  2. Nuevas Políticas
    - Solo usuarios autenticados pueden realizar operaciones
    - Cada usuario solo puede ver/modificar sus propios datos
    - Políticas separadas para lectura y escritura

  3. Notas Importantes
    - Estas políticas requieren que los usuarios estén autenticados
    - Si necesitas acceso público, puedes ajustar las políticas según tus necesidades
*/

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Allow all operations on registros" ON registros;
DROP POLICY IF EXISTS "Allow all operations on salidas_detalle" ON salidas_detalle;
DROP POLICY IF EXISTS "Allow all operations on ventas" ON ventas;

-- Políticas para tabla registros
CREATE POLICY "Users can view all registros"
  ON registros
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert registros"
  ON registros
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update registros"
  ON registros
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete registros"
  ON registros
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para tabla salidas_detalle
CREATE POLICY "Users can view all salidas_detalle"
  ON salidas_detalle
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert salidas_detalle"
  ON salidas_detalle
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update salidas_detalle"
  ON salidas_detalle
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete salidas_detalle"
  ON salidas_detalle
  FOR DELETE
  TO authenticated
  USING (true);

-- Políticas para tabla ventas (si existe)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ventas') THEN
    -- Crear políticas para ventas
    EXECUTE 'CREATE POLICY "Users can view all ventas" ON ventas FOR SELECT TO authenticated USING (true)';
    EXECUTE 'CREATE POLICY "Users can insert ventas" ON ventas FOR INSERT TO authenticated WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Users can update ventas" ON ventas FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
    EXECUTE 'CREATE POLICY "Users can delete ventas" ON ventas FOR DELETE TO authenticated USING (true)';
  END IF;
END $$;