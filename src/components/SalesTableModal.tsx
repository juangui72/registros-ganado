import React, { useState, useEffect } from 'react';
import { X, Calendar, Users, TrendingUp, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface VentaDetallada {
  id: string;
  fecha_venta: string;
  socio: string;
  inventario_total: number;
  salidas_venta: number;
  salidas_muerte: number;
  salidas_robo: number;
  vr_kilo_venta: number;
  total_kilos_venta: number;
  total_venta: number;
  porcentaje_60: number;
  porcentaje_40: number;
  inventario_actual: number;
}

interface SalesTableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SalesTableModal: React.FC<SalesTableModalProps> = ({
  isOpen,
  onClose
}) => {
  const [ventas, setVentas] = useState<VentaDetallada[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      loadVentasDetalladas();
    }
  }, [isOpen]);

  const loadVentasDetalladas = async () => {
    try {
      setLoading(true);
      setError('');

      // Obtener todas las ventas
      const { data: ventasData, error: ventasError } = await supabase
        .from('ventas')
        .select('*')
        .order('fecha', { ascending: false });

      if (ventasError) throw ventasError;

      // Obtener todos los registros para calcular estadísticas
      const { data: registrosData, error: registrosError } = await supabase
        .from('registros')
        .select('*');

      if (registrosError) throw registrosError;

      // Obtener detalles de salidas
      const { data: salidasData, error: salidasError } = await supabase
        .from('salidas_detalle')
        .select('*');

      if (salidasError) throw salidasError;

      // Procesar datos para crear la tabla detallada
      const ventasDetalladas: VentaDetallada[] = ventasData.map(venta => {
        // Calcular inventario total (suma de todas las entradas del socio)
        const inventarioTotal = registrosData
          .filter(r => r.socio === venta.socio)
          .reduce((sum, r) => sum + (r.entradas || 0), 0);

        // Calcular salidas por tipo para este socio
        const salidasSocio = salidasData.filter(s => s.socio === venta.socio);
        const salidasVenta = salidasSocio
          .filter(s => s.causa === 'ventas')
          .reduce((sum, s) => sum + s.cantidad, 0);
        const salidasMuerte = salidasSocio
          .filter(s => s.causa === 'muerte')
          .reduce((sum, s) => sum + s.cantidad, 0);
        const salidasRobo = salidasSocio
          .filter(s => s.causa === 'robo')
          .reduce((sum, s) => sum + s.cantidad, 0);

        // Calcular inventario actual
        const totalSalidas = registrosData
          .filter(r => r.socio === venta.socio)
          .reduce((sum, r) => sum + (r.salidas || 0), 0);
        const inventarioActual = inventarioTotal - totalSalidas;

        // Calcular porcentajes (60% y 40% del total de venta)
        const porcentaje60 = venta.valor_venta * 0.6;
        const porcentaje40 = venta.valor_venta * 0.4;

        return {
          id: venta.id,
          fecha_venta: venta.fecha,
          socio: venta.socio,
          inventario_total: inventarioTotal,
          salidas_venta: salidasVenta,
          salidas_muerte: salidasMuerte,
          salidas_robo: salidasRobo,
          vr_kilo_venta: venta.valor_kilo_venta || 0,
          total_kilos_venta: venta.total_kilos || 0,
          total_venta: venta.valor_venta || 0,
          porcentaje_60: porcentaje60,
          porcentaje_40: porcentaje40,
          inventario_actual: inventarioActual
        };
      });

      setVentas(ventasDetalladas);
    } catch (error) {
      console.error('Error loading ventas detalladas:', error);
      setError('Error al cargar los datos de ventas');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `$${Math.round(value).toLocaleString('es-CO')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString + 'T00:00:00').toLocaleDateString('es-CO');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-emerald-600" />
              Tabla de Ventas Detallada
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Resumen completo de todas las ventas por socio
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="ml-3 text-gray-600">Cargando datos...</span>
            </div>
          ) : ventas.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay ventas registradas
              </h3>
              <p className="text-gray-500">
                Las ventas aparecerán aquí una vez que se registren.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha Venta
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inventario Total
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salidas Venta
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salidas Muerte
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salidas Robo
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vr/Kilo Venta
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Kilos
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Venta
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      60%
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      40%
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Inventario Actual
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Socio
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {ventas.map((venta) => (
                    <tr key={venta.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {formatDate(venta.fecha_venta)}
                        </div>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <span className="font-medium text-blue-600">
                          {venta.inventario_total}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <span className="font-medium text-green-600">
                          {venta.salidas_venta}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <span className="font-medium text-red-600">
                          {venta.salidas_muerte}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <span className="font-medium text-orange-600">
                          {venta.salidas_robo}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        {formatCurrency(venta.vr_kilo_venta)}
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <span className="font-medium">
                          {Math.round(venta.total_kilos_venta)} kg
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="font-bold text-green-700">
                          {formatCurrency(venta.total_venta)}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="font-medium text-emerald-600">
                          {formatCurrency(venta.porcentaje_60)}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <span className="font-medium text-teal-600">
                          {formatCurrency(venta.porcentaje_40)}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap text-center">
                        <span className={`font-bold ${venta.inventario_actual >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {venta.inventario_actual}
                        </span>
                      </td>
                      <td className="px-3 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-2 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {venta.socio}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Total de ventas: <span className="font-medium">{ventas.length}</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesTableModal;