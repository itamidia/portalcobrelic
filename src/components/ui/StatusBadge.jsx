import React from 'react';
import { CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const statusConfig = {
  ativo: {
    label: 'Ativo',
    icon: CheckCircle,
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  },
  inativo: {
    label: 'Inativo',
    icon: XCircle,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  aguardando_pagamento: {
    label: 'Aguardando Pagamento',
    icon: Clock,
    className: 'bg-amber-100 text-amber-700 border-amber-200',
  },
  atrasado: {
    label: 'Atrasado',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-700 border-red-200',
  },
  cancelado: {
    label: 'Cancelado',
    icon: XCircle,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
  },
  pendente: {
    label: 'Pendente',
    icon: Clock,
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
};

export default function StatusBadge({ status, size = 'default' }) {
  const config = statusConfig[status] || statusConfig.aguardando_pagamento;
  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className={`${config.className} ${
        size === 'large' ? 'px-4 py-2 text-base' : 'px-3 py-1'
      } font-medium`}
    >
      <Icon className={`${size === 'large' ? 'w-5 h-5' : 'w-4 h-4'} mr-2`} />
      {config.label}
    </Badge>
  );
}