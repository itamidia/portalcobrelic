import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../components/admin/AdminLayout';
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
  MapPin
} from 'lucide-react';
import { toast } from 'sonner';

const CARGOS = [
  'Presidente Estadual',
  'Presidente Municipal',
  'Líder Comunitário',
];

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function AdminRepresentantes() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editando, setEditando] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCargo, setFiltroCargo] = useState('todos');
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);
  const [userRepresentante, setUserRepresentante] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  
  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    estado: '',
    cidade: '',
    cargo: '',
    foto_url: '',
    descricao: '',
    ativo: true,
  });

  // Carrega usuário logado e verifica se é representante
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
        
        // Busca representante pelo user_id
        const { data: foundRep, error } = await supabase
          .from('representantes')
          .select('*')
          .eq('user_id', userData.id)
          .maybeSingle();
        
        if (error) {
          console.error('� Erro ao buscar representante:', error);
        }
        
        if (foundRep) {
          console.log('🟢 REPRESENTANTE ENCONTRADO:', foundRep.nome, foundRep.cargo);
          setUserRepresentante(foundRep);
        } else {
          console.log('🔴 NENHUM REPRESENTANTE para user_id:', userData.id);
          setUserRepresentante(null);
        }
      } catch (error) {
        console.error('🔴 Erro ao carregar usuário:', error);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  const { data: representantes, isLoading } = useQuery({
    queryKey: ['representantes-admin', user?.id, userRepresentante?.id, userRepresentante?.cargo, userRepresentante?.estado, userRepresentante?.cidade],
    queryFn: async () => {
      let query = supabase.from('representantes').select('*');
      
      // REGRA 1: Presidente Estadual - vê apenas Presidentes Municipais e Líderes do seu estado
      if (userRepresentante?.cargo === 'Presidente Estadual' && userRepresentante?.estado) {
        query = query.eq('estado', userRepresentante.estado)
                     .in('cargo', ['Presidente Municipal', 'Líder Comunitário']);
      }
      // REGRA 2: Presidente Municipal - vê apenas Líderes da sua cidade/estado
      else if (userRepresentante?.cargo === 'Presidente Municipal' && userRepresentante?.cidade && userRepresentante?.estado) {
        query = query.eq('estado', userRepresentante.estado)
                     .eq('cidade', userRepresentante.cidade)
                     .eq('cargo', 'Líder Comunitário');
      }
      // REGRA 3: Admin vê todos
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !loadingUser && !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { data: result, error } = await supabase
        .from('representantes')
        .insert([data])
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representantes-admin'] });
      toast.success('Representante cadastrado com sucesso!');
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao cadastrar:', error);
      toast.error(error?.message || 'Erro ao cadastrar representante');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { data: result, error } = await supabase
        .from('representantes')
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representantes-admin'] });
      toast.success('Representante atualizado com sucesso!');
      resetForm();
    },
    onError: (error) => {
      console.error('Erro ao atualizar:', error);
      toast.error(error?.message || 'Erro ao atualizar representante');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('representantes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['representantes-admin'] });
      toast.success('Representante removido com sucesso!');
    },
    onError: () => toast.error('Erro ao remover representante'),
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      cpf: '',
      telefone: '',
      email: '',
      estado: '',
      cidade: '',
      cargo: '',
      foto_url: '',
      descricao: '',
      ativo: true,
    });
    setEditando(null);
    setDialogOpen(false);
  };

  const handleEdit = (rep) => {
    setFormData({
      nome: rep.nome || '',
      cpf: rep.cpf || '',
      telefone: rep.telefone || '',
      email: rep.email || '',
      estado: rep.estado || '',
      cidade: rep.cidade || '',
      cargo: rep.cargo || '',
      foto_url: rep.foto_url || '',
      descricao: rep.descricao || '',
      ativo: rep.ativo !== false,
    });
    setEditando(rep);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.nome || !formData.telefone || !formData.email || !formData.estado || !formData.cidade || !formData.cargo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editando) {
      updateMutation.mutate({ id: editando.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja remover este representante?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `representantes/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);
        
      setFormData({ ...formData, foto_url: publicUrl });
      toast.success('Foto enviada com sucesso!');
    } catch (error) {
      console.error('Erro upload:', error);
      toast.error('Erro ao enviar foto: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
  };

  const representantesFiltrados = representantes?.filter(r => {
    const matchSearch = r.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        r.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || r.estado === filtroEstado;
    const matchCargo = filtroCargo === 'todos' || r.cargo === filtroCargo;
    return matchSearch && matchEstado && matchCargo;
  }) || [];

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

  const isPresidenteNacional = user?.role === 'admin';
  const isPresidenteEstadual = userRepresentante?.cargo === 'Presidente Estadual';
  const isPresidenteMunicipal = userRepresentante?.cargo === 'Presidente Municipal';

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {isPresidenteNacional ? 'Todos os Representantes' : 'Gestão de Representantes'}
            </h1>
            <p className="text-gray-500">
              {isPresidenteNacional && 'Visualização completa de Presidentes Estaduais, Municipais e Líderes Comunitários'}
              {isPresidenteEstadual && 'Gerencie os Líderes Comunitários do seu estado'}
              {isPresidenteMunicipal && 'Gerencie os Líderes Comunitários da sua cidade'}
            </p>
          </div>
          {!isPresidenteNacional && (
            <Button 
              onClick={() => setDialogOpen(true)}
              className="bg-[#1e3a5f] hover:bg-[#152a45]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Representante
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-[#1e3a5f]" />
                <div>
                  <p className="text-2xl font-bold">{representantes?.length || 0}</p>
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
                  <p className="text-2xl font-bold">{representantes?.filter(r => r.ativo).length || 0}</p>
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
                    {new Set(representantes?.map(r => r.estado)).size || 0}
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
                    {new Set(representantes?.map(r => r.cidade)).size || 0}
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
              <Select value={filtroCargo} onValueChange={setFiltroCargo}>
                <SelectTrigger>
                  <SelectValue placeholder="Cargo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os cargos</SelectItem>
                  {CARGOS.map(cargo => (
                    <SelectItem key={cargo} value={cargo}>{cargo}</SelectItem>
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
                  <TableHead>Representante</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  {representantesFiltrados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                      Nenhum representante encontrado
                    </TableCell>
                  </TableRow>
                  ) : (
                  representantesFiltrados.map((rep) => (
                    <TableRow key={rep.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100">
                            {rep.foto_url ? (
                              <img src={rep.foto_url} alt={rep.nome} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <User className="w-5 h-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{rep.nome}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          rep.cargo === 'Presidente Estadual' ? 'bg-purple-100 text-purple-700' :
                          rep.cargo === 'Presidente Municipal' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }>
                          {rep.cargo}
                        </Badge>
                      </TableCell>
                      <TableCell>{rep.cidade} - {rep.estado}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{rep.telefone}</p>
                          <p className="text-gray-500">{rep.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={rep.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'}>
                          {rep.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(rep)}>
                            <Pencil className="w-4 h-4" />
                          </Button>
                          {!isPresidenteNacional && (
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(rep.id)}>
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          )}
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
              {editando ? 'Editar Representante' : 'Novo Representante'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {/* Foto */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                {formData.foto_url ? (
                  <img src={formData.foto_url} alt="Foto" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="foto" className="cursor-pointer">
                  <div className="flex items-center gap-2 text-[#1e3a5f] hover:underline">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Enviando...' : 'Carregar foto'}
                  </div>
                </Label>
                <Input
                  id="foto"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Nome do representante"
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
                <Label>CPF (opcional)</Label>
                <Input
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                  placeholder="000.000.000-00"
                />
              </div>

              <div>
                <Label>Cargo *</Label>
                <select
                  name="cargo"
                  value={formData.cargo}
                  onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Selecione o cargo</option>
                  <option value="Presidente Estadual">Presidente Estadual</option>
                  <option value="Presidente Municipal">Presidente Municipal</option>
                  <option value="Líder Comunitário">Líder Comunitário</option>
                </select>
              </div>

              <div>
                <Label>Estado *</Label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Selecione o estado</option>
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RS">RS</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </select>
              </div>

              <div>
                <Label>Cidade *</Label>
                <Input
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  placeholder="Nome da cidade"
                />
              </div>

              <div className="col-span-2">
                <Label>Biografia / Descrição</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Uma breve descrição sobre o representante..."
                  rows={3}
                />
              </div>

              <div className="col-span-2 flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Status Ativo</p>
                  <p className="text-sm text-gray-500">Representantes inativos não aparecem na página pública</p>
                </div>
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                />
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