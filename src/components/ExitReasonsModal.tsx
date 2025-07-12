import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, DollarSign, Skull, Shield } from 'lucide-react';
import { supabase, CausaSalida, causaSalidaLabels } from '../lib/supabase';

interface ExitReasonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exitReasons: ExitReasonEntry[]) => void;
  onSalesClick: () => void;
  totalExits: number;
  socio: string;
  fecha: string;
  registroId?: string;
  existingReasons?: ExitReasonEntry[];
}

export interface ExitReasonEntry {
  causa: CausaSalida;
  cantidad: number;
}

const ExitReasonsModal: React.FC<ExitReasonsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onSalesClick,
  totalExits,
  socio,
  fecha,
  registroId,
  existingReasons = []
}) => {
  const [exitReasons, setExitReasons] = useState<ExitReasonEntry[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      if (existingReasons.length > 0) {
        setExitReasons(existingReasons);
      } else {
        // Initialize with empty entries for each cause
        setExitReasons([
          { causa: 'ventas', cantidad: 0 },
          { causa: 'muerte', cantidad: 0 },
          { causa: 'robo', cantidad: 0 }
        ]);
      }
      setError('');
    }
  }, [isOpen, existingReasons]);

  const handleCausaClick = (causa: CausaSalida) => {
    if (causa === 'ventas') {
      onSalesClick();
      return;
    }
    
    // For other causes, toggle selection
    setExitReasons(prev => 
      prev.map(entry => 
        entry.causa === causa 
          ? { ...entry, cantidad: entry.cantidad > 0 ? 0 : 1 }
          : entry
      )
    );
    setError('');
  };

  const getTotalAssigned = () => {
    return exitReasons.reduce((sum, entry) => sum + entry.cantidad, 0);
  };

  const handleSave = () => {
    const totalAssigned = getTotalAssigned();
    
    if (totalAssigned !== totalExits) {
      setError(`El total asignado (${totalAssigned}) debe ser igual al total de salidas (${totalExits})`);
      return;
    }

    // Filter out entries with 0 quantity
    const validReasons = exitReasons.filter(entry => entry.cantidad > 0);
    onSave(validReasons);
  };

  const getIconForCause = (causa: CausaSalida) => {
    switch (causa) {
      case 'ventas':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'muerte':
        return <Skull className="w-5 h-5 text-red-600" />;
      case 'robo':
        return <Shield className="w-5 h-5 text-orange-600" />;
    }
  };

  const getColorForCause = (causa: CausaSalida, isSelected: boolean) => {
    const baseColor = isSelected ? 'border-2' : 'border';
    switch (causa) {
      case 'ventas':
        return `${baseColor} border-green-300 bg-green-50 hover:bg-green-100`;
      case 'muerte':
        return `${baseColor} border-red-300 bg-red-50 hover:bg-red-100`;
      case 'robo':
        return `${baseColor} border-orange-300 bg-orange-50 hover:bg-orange-100`;
    }
  };

  if (!isOpen) return null;

  const totalAssigned = getTotalAssigned();
  const remaining = totalExits - totalAssigned;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Seleccionar Tipo de Salida
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
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Total de salidas: <span className="font-bold text-gray-900">{totalExits}</span>
              </span>
              <span className={`text-sm font-medium ${remaining === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                Restante: {remaining}
              </span>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {exitReasons.map((entry) => {
              const isSelected = entry.cantidad > 0;
              return (
                <button
                  key={entry.causa}
                  onClick={() => handleCausaClick(entry.causa)}
                  className={`w-full p-4 rounded-lg transition-all cursor-pointer ${getColorForCause(entry.causa, isSelected)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getIconForCause(entry.causa)}
                      <span className="ml-2 font-medium text-gray-900">
                        {causaSalidaLabels[entry.causa]}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="text-lg font-bold text-gray-900">
                        ✓
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Total asignado:
              </span>
              <span className={`font-bold ${totalAssigned === totalExits ? 'text-green-600' : 'text-orange-600'}`}>
                {totalAssigned} / {totalExits}
              </span>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={totalAssigned !== totalExits}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExitReasonsModal;