import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, Newspaper, Star, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const CATEGORIAS = [
  { value: 'geral', label: 'Geral' },
  { value: 'institucional', label: 'Institucional' },
  { value: 'eventos', label: 'Eventos' },
  { value: 'comunicados', label: 'Comunicados' },
];

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function AdminNoticias() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState(null);
  const [user, setUser] = useState(null);
  const [userRepresentante, setUserRepresentante] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [formData, setFormData] = useState({
    titulo: '',
    resumo: '',
    conteudo: '',
    imagem_url: '',
    link_externo: '',
    categoria: 'geral',
    estado: '',
    cidade: '',
    destaque: false,
    ativo: true,
    data_publicacao: format(new Date(), 'yyyy-MM-dd'),
  });

  const queryClient = useQueryClient();

  // Carrega usuário logado e verifica se é representante
  React.useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        // Busca representante se não for admin puro
        if (userData.role !== 'admin') {
          const allReps = await base44.entities.Representante.list();
          const foundRep = allReps.find(rep => rep.email === userData.email);
          setUserRepresentante(foundRep);
        }
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  const { data: noticias, isLoading } = useQuery({
    queryKey: ['admin-noticias', loadingUser, userRepresentante?.id],
    queryFn: async () => {
      const allNoticias = await base44.entities.Noticia.list('-created_date');
      
      // Se for representante Presidente Municipal, filtra por cidade
      if (userRepresentante && userRepresentante.cargo === 'Presidente Municipal') {
        return allNoticias.filter(n => 
          (n.estado === userRepresentante.estado && n.cidade === userRepresentante.cidade) ||
          (!n.estado && !n.cidade) // Mostra também as nacionais para referência
        );
      }
      
      // Admin puro vê tudo
      return allNoticias;
    },
    enabled: !loadingUser,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Noticia.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-noticias'] });
      toast.success('Notícia criada com sucesso!');
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Noticia.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-noticias'] });
      toast.success('Notícia atualizada!');
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Noticia.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-noticias'] });
      toast.success('Notícia excluída!');
    },
  });

  const openCreate = () => {
    setEditingNoticia(null);
    const initialData = {
      titulo: '',
      resumo: '',
      conteudo: '',
      imagem_url: '',
      link_externo: '',
      categoria: 'geral',
      estado: '',
      cidade: '',
      destaque: false,
      ativo: true,
      data_publicacao: format(new Date(), 'yyyy-MM-dd'),
    };
    
    // Se for Presidente Municipal, preenche automaticamente estado/cidade
    if (userRepresentante?.cargo === 'Presidente Municipal') {
      initialData.estado = userRepresentante.estado;
      initialData.cidade = userRepresentante.cidade;
    }
    
    setFormData(initialData);
    setDialogOpen(true);
  };

  const openEdit = (noticia) => {
    // Presidente Municipal não pode editar notícias nacionais
    if (userRepresentante?.cargo === 'Presidente Municipal' && !noticia.estado && !noticia.cidade) {
      toast.error('Apenas a matriz nacional pode editar notícias nacionais');
      return;
    }
    
    setEditingNoticia(noticia);
    setFormData({
      titulo: noticia.titulo || '',
      resumo: noticia.resumo || '',
      conteudo: noticia.conteudo || '',
      imagem_url: noticia.imagem_url || '',
      link_externo: noticia.link_externo || '',
      categoria: noticia.categoria || 'geral',
      estado: noticia.estado || '',
      cidade: noticia.cidade || '',
      destaque: noticia.destaque ?? false,
      ativo: noticia.ativo ?? true,
      data_publicacao: noticia.data_publicacao || format(new Date(), 'yyyy-MM-dd'),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingNoticia(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingNoticia) {
      updateMutation.mutate({ id: editingNoticia.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, imagem_url: file_url });
      toast.success('Imagem enviada!');
    } catch (error) {
      toast.error('Erro ao enviar imagem');
    }
  };

  const categoriaColors = {
    geral: 'bg-gray-100 text-gray-700',
    institucional: 'bg-[#1e3a5f] text-white',
    eventos: 'bg-[#d4af37] text-[#1e3a5f]',
    comunicados: 'bg-red-100 text-red-700',
  };

  if (isLoading || loadingUser) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  const isPresidenteMunicipal = userRepresentante?.cargo === 'Presidente Municipal';
  const isAdminPuro = user?.role === 'admin' && !userRepresentante;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Notícias</h1>
          <Button onClick={openCreate} className="bg-[#1e3a5f] hover:bg-[#152a45]">
            <Plus className="w-4 h-4 mr-2" />
            Nova Notícia
          </Button>
        </div>

        <div className="grid gap-4">
          {noticias?.length === 0 ? (
            <Card className="p-8 text-center">
              <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma notícia cadastrada</p>
            </Card>
          ) : (
            noticias?.map((noticia) => (
              <Card key={noticia.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-start gap-4">
                    <div className="w-32 h-24 bg-gray-100 flex-shrink-0">
                      {noticia.imagem_url ? (
                        <img
                          src={noticia.imagem_url}
                          alt={noticia.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Newspaper className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 py-3">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{noticia.titulo}</h3>
                        {noticia.destaque && (
                          <Star className="w-4 h-4 text-[#d4af37] fill-[#d4af37]" />
                        )}
                        <Badge variant={noticia.ativo ? 'default' : 'secondary'}>
                          {noticia.ativo ? 'Ativa' : 'Inativa'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-2">{noticia.resumo}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <Badge className={categoriaColors[noticia.categoria]}>
                          {CATEGORIAS.find(c => c.value === noticia.categoria)?.label}
                        </Badge>
                        {noticia.estado && noticia.cidade && (
                          <Badge variant="outline" className="text-[#1e3a5f]">
                            {noticia.cidade} - {noticia.estado}
                          </Badge>
                        )}
                        {!noticia.estado && !noticia.cidade && (
                          <Badge className="bg-[#d4af37] text-[#1e3a5f]">Nacional</Badge>
                        )}
                        {noticia.data_publicacao && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(noticia.data_publicacao), 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pr-4 pt-3">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEdit(noticia)}
                        disabled={isPresidenteMunicipal && !noticia.estado && !noticia.cidade}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (isPresidenteMunicipal && !noticia.estado && !noticia.cidade) {
                            toast.error('Apenas a matriz nacional pode excluir notícias nacionais');
                            return;
                          }
                          deleteMutation.mutate(noticia.id);
                        }}
                        disabled={isPresidenteMunicipal && !noticia.estado && !noticia.cidade}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingNoticia ? 'Editar Notícia' : 'Nova Notícia'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Título da notícia"
                required
              />
            </div>

            <div>
              <Label>Resumo</Label>
              <Textarea
                value={formData.resumo}
                onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                placeholder="Breve resumo da notícia"
                rows={2}
                required
              />
            </div>

            <div>
              <Label>Conteúdo Completo (opcional)</Label>
              <Textarea
                value={formData.conteudo}
                onChange={(e) => setFormData({ ...formData, conteudo: e.target.value })}
                placeholder="Conteúdo completo da notícia..."
                rows={4}
              />
            </div>

            <div>
              <Label>Imagem de Capa</Label>
              <div className="space-y-2">
                {formData.imagem_url && (
                  <img
                    src={formData.imagem_url}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                )}
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <Input
                  value={formData.imagem_url}
                  onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                  placeholder="Ou cole a URL da imagem"
                />
              </div>
            </div>

            <div>
              <Label>Link Externo (opcional)</Label>
              <Input
                value={formData.link_externo}
                onChange={(e) => setFormData({ ...formData, link_externo: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {/* Campos de Localização - apenas admin puro pode deixar vazio (nacional) */}
            {isAdminPuro && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Estado (vazio = nacional)</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(val) => setFormData({ ...formData, estado: val, cidade: '' })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Nacional" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>Nacional</SelectItem>
                      {ESTADOS.map(uf => (
                        <SelectItem key={uf} value={uf}>{uf}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cidade</Label>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Deixe vazio para nacional"
                    disabled={!formData.estado}
                  />
                </div>
              </div>
            )}
            
            {isPresidenteMunicipal && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
                Esta notícia será exibida em: <strong>{userRepresentante.cidade} - {userRepresentante.estado}</strong>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Categoria</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(val) => setFormData({ ...formData, categoria: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Data de Publicação</Label>
                <Input
                  type="date"
                  value={formData.data_publicacao}
                  onChange={(e) => setFormData({ ...formData, data_publicacao: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.destaque}
                  onCheckedChange={(val) => setFormData({ ...formData, destaque: val })}
                />
                <Label>Destaque</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
                />
                <Label>Ativa</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#152a45]">
                {editingNoticia ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}