import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
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
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminAprovacoes() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [editDialog, setEditDialog] = useState({ open: false, associado: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, associado: null });
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    data_nascimento: '',
    cidade: '',
    estado: '',
    endereco: '',
    cep: '',
    profissao: '',
    biografia: '',
  });

  const [aba, setAba] = useState('aguardando');

  // Buscar representantes aguardando aprovação (pendentes)
  const { data: associadosAguardando = [], isLoading: loadingAguardando } = useQuery({
    queryKey: ['representantes-aguardando'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('representantes')
        .select('*')
        .eq('status_aprovacao', 'pendente')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Buscar representantes aprovados
  const { data: associadosAprovados = [], isLoading: loadingAprovados } = useQuery({
    queryKey: ['representantes-aprovados'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('representantes')
        .select('*')
        .eq('status_aprovacao', 'aprovado')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  // Mutation para aprovar cadastro de representante e criar associado/pagamento
  const aprovarMutation = useMutation({
    mutationFn: async (representante) => {
      console.log('Aprovando representante:', representante);

      // 1. Aprovar representante
      const { data: repData, error: repError } = await supabase
        .from('representantes')
        .update({ status_aprovacao: 'aprovado', ativo: true, updated_at: new Date().toISOString() })
        .eq('id', representante.id)
        .select()
        .single();

      if (repError) {
        console.error('Erro ao aprovar representante:', repError);
        throw repError;
      }

      console.log('Representante aprovado:', repData);

      // 2. Buscar plano ativo
      const { data: planoData, error: planoError } = await supabase
        .from('planos')
        .select('id, valor')
        .eq('ativo', true)
        .order('ordem')
        .limit(1)
        .single();

      if (planoError && planoError.code !== 'PGRST116') {
        console.error('Erro ao buscar plano:', planoError);
      }

      const planoId = planoData?.id || null;
      const planoValor = planoData?.valor || 30.00;
      console.log('Plano encontrado:', planoId, planoValor);

      // 3. Criar associado
      const { data: associadoData, error: associadoError } = await supabase
        .from('associados')
        .insert({
          nome_completo: representante.nome,
          email: representante.email,
          telefone: representante.telefone,
          cpf: representante.cpf,
          representante_id: representante.id,
          status_aprovacao: 'aprovado',
          status_assinatura: 'ativo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (associadoError) {
        console.error('Erro ao criar associado:', associadoError);
        throw associadoError;
      }

      console.log('Associado criado:', associadoData);

      // 4. Calcular data de vencimento (dia 5 do próximo mês)
      const hoje = new Date();
      const proximoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 5);
      const dataVencimento = proximoMes.toISOString().split('T')[0];

      // 5. Criar pagamento
      const { data: pagamentoData, error: pagamentoError } = await supabase
        .from('pagamentos')
        .insert({
          associado_id: associadoData.id,
          valor: planoValor,
          status: 'pendente',
          data_vencimento: dataVencimento,
          descricao: 'Mensalidade - ' + new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (pagamentoError) {
        console.error('Erro ao criar pagamento:', pagamentoError);
        throw pagamentoError;
      }

      console.log('Pagamento criado:', pagamentoData);

      return { representante: repData, associado: associadoData, pagamento: pagamentoData };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['representantes-aguardando'] });
      queryClient.invalidateQueries({ queryKey: ['representantes-aprovados'] });
      toast.success(`Cadastro aprovado! Associado e pagamento criados.`);
      console.log('Dados criados:', data);
    },
    onError: (error) => {
      console.error('Erro completo:', error);
      toast.error('Erro ao aprovar cadastro: ' + error.message);
    },
  });

  // Mutation para rejeitar
  const rejeitarMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('representantes')
        .update({ status_aprovacao: 'rejeitado', updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representantes-aguardando'] });
      queryClient.invalidateQueries({ queryKey: ['representantes-aprovados'] });
      toast.success('Cadastro rejeitado!');
    },
    onError: (error) => toast.error('Erro ao rejeitar cadastro: ' + error.message),
  });

  // Mutation para editar
  const editarMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('representantes')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representantes-aguardando'] });
      queryClient.invalidateQueries({ queryKey: ['representantes-aprovados'] });
      setEditDialog({ open: false, associado: null });
      toast.success('Cadastro atualizado!');
    },
    onError: (error) => toast.error('Erro ao atualizar cadastro: ' + error.message),
  });

  // Mutation para excluir
  const excluirMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('representantes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representantes-aguardando'] });
      queryClient.invalidateQueries({ queryKey: ['representantes-aprovados'] });
      setDeleteDialog({ open: false, associado: null });
      toast.success('Cadastro excluído!');
    },
    onError: (error) => toast.error('Erro ao excluir cadastro: ' + error.message),
  });

  const handleOpenEdit = (associado) => {
    setFormData({
      nome: associado.nome || '',
      cpf: associado.cpf || '',
      telefone: associado.telefone || '',
      email: associado.email || '',
      data_nascimento: associado.data_nascimento || '',
      cidade: associado.cidade || '',
      estado: associado.estado || '',
      endereco: associado.endereco || '',
      cep: associado.cep || '',
      profissao: associado.profissao || '',
      biografia: associado.biografia || '',
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

  // Filtrar por busca de acordo com a aba ativa
  const getListaAtual = () => {
    switch (aba) {
      case 'aguardando':
        return associadosAguardando;
      case 'aprovados':
        return associadosAprovados;
      default:
        return associadosAguardando;
    }
  };
  
  const listaAtual = getListaAtual();
  const associadosFiltrados = listaAtual.filter(a => 
    a.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.cpf?.includes(searchTerm) ||
    a.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout currentPage="AdminAprovacoes">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Aprovações</h1>
            <p className="text-gray-500">Gerencie cadastros pendentes e aprovações de pagamento de planos</p>
          </div>
          <Badge className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            {associadosAguardando.length} aguardando
          </Badge>
        </div>

        {/* Abas */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAba('aguardando')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              aba === 'aguardando'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Aguardando Aprovação
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${aba === 'aguardando' ? 'bg-white/20 text-white' : 'bg-yellow-100 text-yellow-800'}`}>
              {associadosAguardando.length}
            </span>
          </button>
          <button
            onClick={() => setAba('aprovados')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              aba === 'aprovados'
                ? 'bg-[#1e3a5f] text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Aprovados
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${aba === 'aprovados' ? 'bg-white/20 text-white' : 'bg-green-100 text-green-800'}`}>
              {associadosAprovados.length}
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
        {(loadingAguardando || loadingAprovados) ? (
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
                {aba === 'aguardando' ? 'Nenhum cadastro aguardando' : 'Nenhum cadastro aprovado'}
              </h3>
              <p className="text-gray-500">
                {aba === 'aguardando' ? 'Todos os cadastros foram processados.' : 'Nenhum cadastro aprovado ainda.'}
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
                            <h3 className="font-bold text-lg text-gray-800">{associado.nome}</h3>
                            {associado.status_aprovacao && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusLabel[associado.status_aprovacao]?.color}`}>
                                {statusLabel[associado.status_aprovacao]?.label}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            Cadastrado em {associado.created_at ? format(new Date(associado.created_at), 'dd/MM/yyyy HH:mm') : 'N/A'}
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

                      {(associado.cidade || associado.estado) && (
                        <div className="flex items-center gap-2 text-gray-600 text-sm mt-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>
                            {associado.cidade} - {associado.estado}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-wrap gap-2">
                      {aba === 'aguardando' ? (
                        // Ações para aguardando aprovação
                        <>
                          <Button
                            onClick={() => aprovarMutation.mutate(associado)}
                            disabled={aprovarMutation.isPending}
                            className='bg-green-600 hover:bg-green-700 text-white'
                          >
                            {aprovarMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Aprovar Cadastro
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
                        </>
                      ) : (
                        // Ações para aprovados - apenas editar e excluir
                        <>
                          <Button
                            disabled
                            className='bg-green-100 text-green-700 cursor-not-allowed'
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Aprovado
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
                        </>
                      )}
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
              <Label>Nome</Label>
              <Input
                value={formData.nome || ''}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cidade</Label>
                <Input
                  value={formData.cidade || ''}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Estado</Label>
                <Input
                  value={formData.estado || ''}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Endereço</Label>
              <Input
                value={formData.endereco || ''}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>CEP</Label>
              <Input
                value={formData.cep || ''}
                onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Profissão</Label>
              <Input
                value={formData.profissao || ''}
                onChange={(e) => setFormData({ ...formData, profissao: e.target.value })}
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
              Tem certeza que deseja excluir o cadastro de <strong>{deleteDialog.associado?.nome}</strong>? 
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