import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import { Wallet, CheckCircle, Clock, AlertTriangle, TrendingUp, Eye, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminFinanceiro() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('all');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPagamento, setSelectedPagamento] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'pendente',
    data_pagamento: '',
    metodo_pagamento: '',
    valor: 0
  });

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
        .from('associados')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const associadosMap = associados?.reduce((acc, a) => {
    acc[a.id] = a;
    return acc;
  }, {}) || {};

  // Mutation para atualizar pagamento
  const updatePagamentoMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('pagamentos')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pagamentos-all'] });
      setEditModalOpen(false);
      alert('Pagamento atualizado com sucesso!');
    },
    onError: (error) => {
      alert('Erro ao atualizar: ' + error.message);
    },
  });

  const handleEditClick = (pagamento) => {
    setSelectedPagamento(pagamento);
    setEditForm({
      status: pagamento.status || 'pendente',
      data_pagamento: pagamento.data_pagamento ? pagamento.data_pagamento.split('T')[0] : '',
      metodo_pagamento: pagamento.metodo_pagamento || '',
      valor: pagamento.valor || 0
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    const updateData = {
      status: editForm.status,
      metodo_pagamento: editForm.metodo_pagamento,
      valor: parseFloat(editForm.valor)
    };
    if (editForm.data_pagamento) {
      updateData.data_pagamento = editForm.data_pagamento;
    }
    updatePagamentoMutation.mutate({ id: selectedPagamento.id, data: updateData });
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
                  <TableHead>Ações</TableHead>
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
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" onClick={() => alert('Ver detalhes: ' + pagamento.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditClick(pagamento)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => alert('Excluir: ' + pagamento.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredPagamentos || filteredPagamentos.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum pagamento encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Status</Label>
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm({ ...editForm, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={editForm.valor}
                onChange={(e) => setEditForm({ ...editForm, valor: e.target.value })}
              />
            </div>
            <div>
              <Label>Data do Pagamento</Label>
              <Input
                type="date"
                value={editForm.data_pagamento}
                onChange={(e) => setEditForm({ ...editForm, data_pagamento: e.target.value })}
              />
            </div>
            <div>
              <Label>Método de Pagamento</Label>
              <Input
                value={editForm.metodo_pagamento}
                onChange={(e) => setEditForm({ ...editForm, metodo_pagamento: e.target.value })}
                placeholder="Ex: Cartão, Boleto, PIX"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={updatePagamentoMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updatePagamentoMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}