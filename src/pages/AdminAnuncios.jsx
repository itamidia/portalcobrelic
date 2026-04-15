import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Pencil, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

const POSICOES = [
  { value: 'topo', label: 'Topo da Página' },
  { value: 'lateral', label: 'Lateral / Sidebar' },
  { value: 'rodape', label: 'Rodapé' },
];

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export default function AdminAnuncios() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnuncio, setEditingAnuncio] = useState(null);
  const [user, setUser] = useState(null);
  const [userRepresentante, setUserRepresentante] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [formData, setFormData] = useState({
    titulo: '',
    imagem_url: '',
    link_destino: '',
    posicao: 'lateral',
    estado: '',
    cidade: '',
    nacional_controlado: false,
    ativo: true,
    ordem: 0,
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

  const { data: anuncios, isLoading } = useQuery({
    queryKey: ['admin-anuncios', loadingUser, userRepresentante?.id],
    queryFn: async () => {
      const allAnuncios = await base44.entities.Anuncio.list();
      
      // Se for representante Presidente Municipal, filtra por cidade
      if (userRepresentante && userRepresentante.cargo === 'Presidente Municipal') {
        // Mostra anúncios da sua cidade + nacionais não controlados
        return allAnuncios.filter(a => {
          const isDaCidade = a.estado === userRepresentante.estado && 
                             a.cidade === userRepresentante.cidade;
          const isNacionalEditavel = (!a.estado && !a.cidade && !a.nacional_controlado);
          return isDaCidade || isNacionalEditavel;
        });
      }
      
      // Admin puro vê tudo
      return allAnuncios;
    },
    enabled: !loadingUser,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Anuncio.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-anuncios'] });
      toast.success('Anúncio criado com sucesso!');
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Anuncio.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-anuncios'] });
      toast.success('Anúncio atualizado!');
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Anuncio.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-anuncios'] });
      toast.success('Anúncio excluído!');
    },
  });

  const openCreate = () => {
    setEditingAnuncio(null);
    // Se for Presidente Municipal, preenche automaticamente estado/cidade
    const initialData = {
      titulo: '',
      imagem_url: '',
      link_destino: '',
      posicao: 'lateral',
      estado: '',
      cidade: '',
      nacional_controlado: false,
      ativo: true,
      ordem: 0,
    };
    
    if (userRepresentante?.cargo === 'Presidente Municipal') {
      initialData.estado = userRepresentante.estado;
      initialData.cidade = userRepresentante.cidade;
    }
    
    setFormData(initialData);
    setDialogOpen(true);
  };

  const openEdit = (anuncio) => {
    // Presidente Municipal não pode editar anúncios nacionais controlados
    if (userRepresentante?.cargo === 'Presidente Municipal' && 
        anuncio.nacional_controlado && !anuncio.estado && !anuncio.cidade) {
      toast.error('Apenas a matriz nacional pode editar este anúncio');
      return;
    }
    
    setEditingAnuncio(anuncio);
    setFormData({
      titulo: anuncio.titulo || '',
      imagem_url: anuncio.imagem_url || '',
      link_destino: anuncio.link_destino || '',
      posicao: anuncio.posicao || 'lateral',
      estado: anuncio.estado || '',
      cidade: anuncio.cidade || '',
      nacional_controlado: anuncio.nacional_controlado || false,
      ativo: anuncio.ativo ?? true,
      ordem: anuncio.ordem || 0,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAnuncio(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação: Presidente Municipal não pode marcar como nacional_controlado
    if (userRepresentante?.cargo === 'Presidente Municipal' && formData.nacional_controlado) {
      toast.error('Apenas a matriz nacional pode criar anúncios controlados');
      return;
    }
    
    if (editingAnuncio) {
      updateMutation.mutate({ id: editingAnuncio.id, data: formData });
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

  if (isLoading || loadingUser) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
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
          <h1 className="text-2xl font-bold text-gray-800">Anúncios</h1>
          <Button onClick={openCreate} className="bg-[#1e3a5f] hover:bg-[#152a45]">
            <Plus className="w-4 h-4 mr-2" />
            Novo Anúncio
          </Button>
        </div>

        <div className="grid gap-4">
          {anuncios?.length === 0 ? (
            <Card className="p-8 text-center">
              <ImageIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhum anúncio cadastrado</p>
            </Card>
          ) : (
            anuncios?.map((anuncio) => (
              <Card key={anuncio.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex items-center gap-4">
                    <div className="w-40 h-24 bg-gray-100 flex-shrink-0">
                      {anuncio.imagem_url ? (
                        <img
                          src={anuncio.imagem_url}
                          alt={anuncio.titulo}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 py-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800">{anuncio.titulo}</h3>
                        <Badge variant={anuncio.ativo ? 'default' : 'secondary'}>
                          {anuncio.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {anuncio.nacional_controlado && (
                          <Badge className="bg-[#d4af37] text-[#1e3a5f]">Nacional</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Posição: {POSICOES.find(p => p.value === anuncio.posicao)?.label}</span>
                        <span>Ordem: {anuncio.ordem}</span>
                        {anuncio.estado && anuncio.cidade && (
                          <span className="text-[#1e3a5f] font-medium">{anuncio.cidade} - {anuncio.estado}</span>
                        )}
                        {anuncio.link_destino && (
                          <a
                            href={anuncio.link_destino}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Ver link
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pr-4">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEdit(anuncio)}
                        disabled={isPresidenteMunicipal && anuncio.nacional_controlado && !anuncio.estado}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (isPresidenteMunicipal && anuncio.nacional_controlado && !anuncio.estado) {
                            toast.error('Apenas a matriz nacional pode excluir este anúncio');
                            return;
                          }
                          deleteMutation.mutate(anuncio.id);
                        }}
                        disabled={isPresidenteMunicipal && anuncio.nacional_controlado && !anuncio.estado}
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
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingAnuncio ? 'Editar Anúncio' : 'Novo Anúncio'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Título</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Nome do anúncio"
                required
              />
            </div>

            <div>
              <Label>Imagem</Label>
              <div className="space-y-2">
                {formData.imagem_url && (
                  <img
                    src={formData.imagem_url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
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
              <Label>Link de Destino</Label>
              <Input
                value={formData.link_destino}
                onChange={(e) => setFormData({ ...formData, link_destino: e.target.value })}
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
                Este anúncio será exibido em: <strong>{userRepresentante.cidade} - {userRepresentante.estado}</strong>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Posição</Label>
                <Select
                  value={formData.posicao}
                  onValueChange={(val) => setFormData({ ...formData, posicao: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POSICOES.map((pos) => (
                      <SelectItem key={pos.value} value={pos.value}>
                        {pos.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Ordem</Label>
                <Input
                  type="number"
                  value={formData.ordem}
                  onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.ativo}
                  onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
                />
                <Label>Anúncio ativo</Label>
              </div>
              
              {isAdminPuro && !formData.estado && (
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.nacional_controlado}
                    onCheckedChange={(val) => setFormData({ ...formData, nacional_controlado: val })}
                  />
                  <Label>Controlado pela matriz (bloqueia edição municipal)</Label>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button type="submit" className="bg-[#1e3a5f] hover:bg-[#152a45]">
                {editingAnuncio ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}