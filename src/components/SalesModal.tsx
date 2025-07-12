import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calculator } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saleData: SaleData) => void;
  socio: string;
  fecha: string;
  registroId?: string;
}

export interface SaleData {
  valor_kilo_venta: number;
  total_kilos: number;
  valor_venta: number;
}

const SalesModal: React.FC<SalesModalProps> = ({
  isOpen,
  onClose,
  onSave,
  socio,
  fecha,
  registroId
}) => {
  const [formData, setFormData] = useState({
    valorKiloVenta: '',
    totalKilos: ''
  });
  const [valorVenta, setValorVenta] = useState(0);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setFormData({
        valorKiloVenta: '',
        totalKilos: ''
      });
      setValorVenta(0);
      setError('');
    }
  }, [isOpen]);

  useEffect(() => {
    const valorKilo = parseFloat(formData.valorKiloVenta) || 0;
    const kilos = parseFloat(formData.totalKilos) || 0;
    setValorVenta(valorKilo * kilos);
  }, [formData.valorKiloVenta, formData.totalKilos]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSave = async () => {
    const valorKilo = parseFloat(formData.valorKiloVenta) || 0;
    const kilos = parseFloat(formData.totalKilos) || 0;

    if (valorKilo <= 0) {
      setError('El valor por kilo debe ser mayor a 0');
      return;
    }

    if (kilos <= 0) {
      setError('El total de kilos debe ser mayor a 0');
      return;
    }

    const saleData: SaleData = {
      valor_kilo_venta: valorKilo,
      total_kilos: kilos,
      valor_venta: valorVenta
    };

    try {
      // Save to ventas table
      const { error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          registro_id: registroId,
          socio: socio,
          fecha: fecha,
          valor_kilo_venta: valorKilo,
          total_kilos: kilos,
          valor_venta: valorVenta
        }]);

      if (ventaError) throw ventaError;

      onSave(saleData);
    } catch (error) {
      console.error('Error saving sale:', error);
      setError('Error al guardar la venta');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Registro de Venta
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {socio} - {new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO')}
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor por Kilo de Venta *
              </label>
              <input
                type="number"
                name="valorKiloVenta"
                value={formData.valorKiloVenta}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Kilos *
              </label>
              <input
                type="number"
                name="totalKilos"
                value={formData.totalKilos}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              />
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Calculator className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-green-700">
                    Valor Total de Venta:
                  </span>
                </div>
                <span className="text-lg font-bold text-green-900">
                  ${Math.round(valorVenta).toLocaleString('es-CO')}
                </span>
              </div>
              {formData.valorKiloVenta && formData.totalKilos && (
                <div className="text-xs text-green-600 mt-2">
                  {formData.valorKiloVenta} × {formData.totalKilos} = {valorVenta.toFixed(2)}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.valorKiloVenta || !formData.totalKilos}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Guardar Venta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesModal;