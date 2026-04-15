import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Wallet, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminFinanceiro() {
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: pagamentos, isLoading: loadingPagamentos } = useQuery({
    queryKey: ['admin-pagamentos-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pagamentos')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const { data: associados } = useQuery({
    queryKey: ['admin-associados-fin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('representantes')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const associadosMap = associados?.reduce((acc, a) => {
    acc[a.id] = a;
    return acc;
  }, {}) || {};
  
  // Map associado_id to nome for display
  const getAssociadoNome = (associadoId) => {
    const associado = associadosMap[associadoId];
    return associado?.nome || 'Não encontrado';
  };

  const filteredPagamentos = pagamentos?.filter(p => 
    statusFilter === 'all' || p.status === statusFilter
  );

  const stats = {
    confirmados: pagamentos?.filter(p => p.status === 'confirmado')
      .reduce((sum, p) => sum + (p.valor || 0), 0) || 0,
    pendentes: pagamentos?.filter(p => p.status === 'pendente')
      .reduce((sum, p) => sum + (p.valor || 0), 0) || 0,
    atrasados: pagamentos?.filter(p => p.status === 'atrasado')
      .reduce((sum, p) => sum + (p.valor || 0), 0) || 0,
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              R$ {value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`w-12 h-12 ${bgColor} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loadingPagamentos) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Controle Financeiro</h1>
          <p className="text-gray-500">Gestão de pagamentos e assinaturas</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Pagamentos Confirmados"
            value={stats.confirmados}
            icon={CheckCircle}
            color="text-emerald-600"
            bgColor="bg-emerald-100"
          />
          <StatCard
            title="Pagamentos Pendentes"
            value={stats.pendentes}
            icon={Clock}
            color="text-amber-600"
            bgColor="bg-amber-100"
          />
          <StatCard
            title="Pagamentos Atrasados"
            value={stats.atrasados}
            icon={AlertTriangle}
            color="text-red-600"
            bgColor="bg-red-100"
          />
        </div>

        {/* Payments Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Histórico de Pagamentos</CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="confirmado">Confirmados</SelectItem>
                <SelectItem value="pendente">Pendentes</SelectItem>
                <SelectItem value="atrasado">Atrasados</SelectItem>
                <SelectItem value="cancelado">Cancelados</SelectItem>
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Associado</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPagamentos?.map((pagamento) => (
                  <TableRow key={pagamento.id}>
                    <TableCell className="font-medium">
                      {associadosMap[pagamento.associado_id]?.nome_completo || 'N/A'}
                    </TableCell>
                    <TableCell>R$ {pagamento.valor?.toFixed(2)}</TableCell>
                    <TableCell>
                      {pagamento.data_vencimento 
                        ? format(new Date(pagamento.data_vencimento), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {pagamento.data_pagamento 
                        ? format(new Date(pagamento.data_pagamento), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell className="capitalize">
                      {pagamento.metodo_pagamento || '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                        pagamento.status === 'confirmado' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : pagamento.status === 'atrasado'
                            ? 'bg-red-100 text-red-700'
                            : pagamento.status === 'cancelado'
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-amber-100 text-amber-700'
                      }`}>
                        {pagamento.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredPagamentos || filteredPagamentos.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum pagamento encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}