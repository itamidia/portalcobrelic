import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  CheckCircle, 
  XCircle, 
  Pencil, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  Search,
  UserCheck,
  Loader2,
  CalendarDays
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminAprovacoes() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, associado: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, associado: null });
  const [formData, setFormData] = useState({});

  const [aba, setAba] = useState('pendentes');

  // Buscar todos os associados pendentes
  const { data: associadosPendentes = [], isLoading } = useQuery({
    queryKey: ['associados-pendentes'],
    queryFn: () => base44.entities.Associado.filter({ status_aprovacao: 'pendente' }, '-created_date'),
  });

  // Buscar cadastros recentes (todos, ordenados por data)
  const { data: todosAssociados = [], isLoading: isLoadingRecentes } = useQuery({
    queryKey: ['associados-recentes'],
    queryFn: () => base44.entities.Associado.list('-created_date', 50),
  });

  // Filtrar os cadastros dos últimos 7 dias
  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const associadosRecentes = todosAssociados.filter(a => 
    a.created_date && new Date(a.created_date) >= seteDiasAtras
  );

  // Mutation para aprovar
  const aprovarMutation = useMutation({
    mutationFn: (id) => base44.entities.Associado.update(id, { status_aprovacao: 'aprovado' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associados-pendentes'] });
      toast.success('Cadastro aprovado com sucesso!');
    },
    onError: () => toast.error('Erro ao aprovar cadastro'),
  });

  // Mutation para rejeitar
  const rejeitarMutation = useMutation({
    mutationFn: (id) => base44.entities.Associado.update(id, { status_aprovacao: 'rejeitado' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associados-pendentes'] });
      toast.success('Cadastro rejeitado!');
    },
    onError: () => toast.error('Erro ao rejeitar cadastro'),
  });

  // Mutation para editar
  const editarMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Associado.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associados-pendentes'] });
      setEditDialog({ open: false, associado: null });
      toast.success('Cadastro atualizado!');
    },
    onError: () => toast.error('Erro ao atualizar cadastro'),
  });

  // Mutation para excluir
  const excluirMutation = useMutation({
    mutationFn: (id) => base44.entities.Associado.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associados-pendentes'] });
      setDeleteDialog({ open: false, associado: null });
      toast.success('Cadastro excluído!');
    },
    onError: () => toast.error('Erro ao excluir cadastro'),
  });

  const handleOpenEdit = (associado) => {
    setFormData({
      nome_completo: associado.nome_completo || '',
      cpf: associado.cpf || '',
      telefone: associado.telefone || '',
      email: associado.email || '',
      data_nascimento: associado.data_nascimento || '',
    });
    setEditDialog({ open: true, associado });
  };

  const handleSaveEdit = () => {
    editarMutation.mutate({ id: editDialog.associado.id, data: formData });
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  const statusLabel = {
    pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
    aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
    rejeitado: { label: 'Rejeitado', color: 'bg-red-100 text-red-800' },
  };

  // Filtrar por busca
  const listaAtual = aba === 'pendentes' ? associadosPendentes : associadosRecentes;
  const associadosFiltrados = listaAtual.filter(a => 
    a.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.cpf?.includes(searchTerm) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout currentPage="AdminAprovacoes">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Aprovação de Cadastros</h1>
            <p className="text-gray-500">Gerencie os cadastros pendentes de aprovação</p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            {associadosPendentes.length} pendentes
          </Badge>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAba('pendentes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              aba === 'pendentes'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Pendentes de Aprovação
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${aba === 'pendentes' ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
              {associadosPendentes.length}
            </span>
          </button>
          <button
            onClick={() => setAba('recentes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              aba === 'recentes'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Cadastros Recentes (7 dias)
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${aba === 'recentes' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>
              {associadosRecentes.length}
            </span>
          </button>
        </div>

        {/* Busca */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar por nome, CPF ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de Cadastros */}
        {(isLoading || isLoadingRecentes) ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : associadosFiltrados.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
            <UserCheck className="w-16 h-16 text-green-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {aba === 'pendentes' ? 'Nenhum cadastro pendente' : 'Nenhum cadastro recente'}
            </h3>
            <p className="text-gray-500">
              {aba === 'pendentes' ? 'Todos os cadastros foram processados.' : 'Nenhum cadastro nos últimos 7 dias.'}
            </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {associadosFiltrados.map(associado => (
              <Card key={associado.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Informações do Associado */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-[#1e3a5f]" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-gray-800">{associado.nome_completo}</h3>
                            {aba === 'recentes' && associado.status_aprovacao && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusLabel[associado.status_aprovacao]?.color}`}>
                                {statusLabel[associado.status_aprovacao]?.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Cadastrado em {associado.created_date ? format(new Date(associado.created_date), 'dd/MM/yyyy HH:mm') : 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>CPF: {formatCPF(associado.cpf)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <span>{formatPhone(associado.telefone)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span>{associado.email}</span>
                        </div>
                      </div>

                      {associado.endereco && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>
                            {associado.endereco.cidade} - {associado.endereco.estado}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => aprovarMutation.mutate(associado.id)}
                        disabled={aprovarMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {aprovarMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Ativar
                      </Button>
                      <Button
                        onClick={() => handleOpenEdit(associado)}
                        variant="outline"
                        className="border-[#1e3a5f] text-[#1e3a5f]"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        onClick={() => setDeleteDialog({ open: true, associado })}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({ open, associado: null })}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Cadastro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Nome Completo</Label>
              <Input
                value={formData.nome_completo || ''}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>CPF</Label>
              <Input
                value={formData.cpf || ''}
                onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Data de Nascimento</Label>
              <Input
                type="date"
                value={formData.data_nascimento || ''}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialog({ open: false, associado: null })}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveEdit}
              disabled={editarMutation.isPending}
              className="bg-[#1e3a5f]"
            >
              {editarMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, associado: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o cadastro de <strong>{deleteDialog.associado?.nome_completo}</strong>? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => excluirMutation.mutate(deleteDialog.associado?.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              {excluirMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}