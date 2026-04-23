import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  User, 
  Upload,
  Users,
  MapPin,
  Heart,
  CreditCard
} from 'lucide-react';
import { toast } from 'sonner';

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const STATUS_APROVACAO = [
  'aprovado',
  'pendente',
  'rejeitado'
];

const STATUS_ASSINATURA = [
  'ativo',
  'inativo',
  'cancelado',
  'suspenso'
];

export default function AdminAssociados() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const [formData, setFormData] = useState({
    nome_completo: '',
    cpf: '',
    telefone: '',
    email: '',
    status_aprovacao: 'pendente',
    status_assinatura: 'ativo',
  });

  // Carrega usuário logado
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { user: userData } } = await supabase.auth.getUser();
        if (!userData) {
          setLoadingUser(false);
          return;
        }
        
        console.log('🟢 Usuário carregado:', userData.email);
        setUser(userData);
      } catch (error) {
        console.error('🔴 Erro ao carregar usuário:', error);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  const { data: associados, isLoading } = useQuery({
    queryKey: ['associados-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('associados')
        .select(`
          *,
          representantes:representante_id (nome, cidade, estado)
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !loadingUser && !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('associados')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associados-admin'] });
      toast.success('Associado cadastrado com sucesso!');
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao cadastrar:', error);
      toast.error(error?.message || 'Erro ao cadastrar associado');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: result, error } = await supabase
        .from('associados')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associados-admin'] });
      toast.success('Associado atualizado com sucesso!');
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao atualizar:', error);
      toast.error(error?.message || 'Erro ao atualizar associado');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('associados')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['associados-admin'] });
      toast.success('Associado removido com sucesso!');
    },
    onError: () => toast.error('Erro ao remover associado'),
  });

  const resetForm = () => {
    setFormData({
      nome_completo: '',
      cpf: '',
      telefone: '',
      email: '',
      status_aprovacao: 'pendente',
      status_assinatura: 'ativo',
    });
    setEditando(null);
    setDialogOpen(false);
  };

  const handleEdit = (assoc) => {
    setFormData({
      nome_completo: assoc.nome_completo || '',
      cpf: assoc.cpf || '',
      telefone: assoc.telefone || '',
      email: assoc.email || '',
      status_aprovacao: assoc.status_aprovacao || 'pendente',
      status_assinatura: assoc.status_assinatura || 'ativo',
    });
    setEditando(assoc);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.nome_completo || !formData.telefone || !formData.email) {
      toast.error('Preencha nome, telefone e email');
      return;
    }

    if (editando) {
      updateMutation.mutate({ id: editando.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja remover este associado?')) {
      deleteMutation.mutate(id);
    }
  };


  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
  };

  const associadosFiltrados = associados?.filter(a => {
    const nome = a.nome_completo || '';
    const cidade = a.representantes?.cidade || '';
    const email = a.email || '';
    const matchSearch = nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        cidade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || a.representantes?.estado === filtroEstado;
    const matchStatus = filtroStatus === 'todos' || a.status_aprovacao === filtroStatus;
    return matchSearch && matchEstado && matchStatus;
  }) || [];

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (isLoading || !user || loadingUser) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gestão de Associados</h1>
            <p className="text-gray-500">
              {associados?.length || 0} associados cadastrados
            </p>
          </div>
          <Button 
            onClick={() => setDialogOpen(true)}
            className="bg-[#1e3a5f] hover:bg-[#152a45]"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Associado
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-[#1e3a5f]" />
                <div>
                  <p className="text-2xl font-bold">{associados?.length || 0}</p>
                  <p className="text-sm text-gray-500">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold">{associados?.filter(a => a.ativo).length || 0}</p>
                  <p className="text-sm text-gray-500">Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-[#d4af37]" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(associados?.map(a => a.estado)).size || 0}
                  </p>
                  <p className="text-sm text-gray-500">Estados</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(associados?.map(a => a.cidade)).size || 0}
                  </p>
                  <p className="text-sm text-gray-500">Cidades</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, cidade ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger>
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os estados</SelectItem>
                  {ESTADOS.map(uf => (
                    <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  {STATUS_APROVACAO.map(status => (
                    <SelectItem key={status} value={status}>
                      {status === 'aprovado' ? 'Aprovado' :
                       status === 'pendente' ? 'Pendente' : 'Rejeitado'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Associado</TableHead>
                  <TableHead>Representante</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Aprovação</TableHead>
                  <TableHead>Assinatura</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {associadosFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum associado encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  associadosFiltrados.map((assoc) => (
                    <TableRow key={assoc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-5 h-5 text-gray-400" />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{assoc.nome_completo || '-'}</div>
                            <div className="text-xs text-gray-500">{assoc.cpf ? formatCPF(assoc.cpf) : ''}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{assoc.representantes?.nome || '-'}</div>
                        <div className="text-xs text-gray-500">
                          {assoc.representantes?.cidade ? `${assoc.representantes.cidade} - ${assoc.representantes.estado}` : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{assoc.telefone || '-'}</div>
                          <div className="text-gray-500 text-xs">{assoc.email || ''}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          assoc.status_aprovacao === 'aprovado' ? 'bg-emerald-100 text-emerald-700' :
                          assoc.status_aprovacao === 'pendente' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }>
                          {assoc.status_aprovacao === 'aprovado' ? 'Aprovado' :
                           assoc.status_aprovacao === 'pendente' ? 'Pendente' : 'Rejeitado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          assoc.status_assinatura === 'ativo' ? 'bg-blue-100 text-blue-700' :
                          assoc.status_assinatura === 'cancelado' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {assoc.status_assinatura === 'ativo' ? 'Ativo' :
                           assoc.status_assinatura === 'cancelado' ? 'Cancelado' :
                           assoc.status_assinatura === 'suspenso' ? 'Suspenso' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(assoc)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(assoc.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog Criar/Editar */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); else setDialogOpen(true); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {editando ? 'Editar Associado' : 'Novo Associado'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                  placeholder="Nome do associado"
                />
              </div>

              <div>
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <Label>Telefone *</Label>
                <Input
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>

              <div>
                <Label>CPF</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <Label>Status Aprovação</Label>
                <select
                  name="status_aprovacao"
                  value={formData.status_aprovacao}
                  onChange={(e) => setFormData({ ...formData, status_aprovacao: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="pendente">Pendente</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
              </div>

              <div>
                <Label>Status Assinatura</Label>
                <select
                  name="status_assinatura"
                  value={formData.status_assinatura}
                  onChange={(e) => setFormData({ ...formData, status_assinatura: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                  <option value="cancelado">Cancelado</option>
                  <option value="suspenso">Suspenso</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#1e3a5f] hover:bg-[#152a45]"
              >
                {editando ? 'Salvar Alterações' : 'Cadastrar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}