import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
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
  { value: 'home', label: 'Home' },
  { value: 'topo', label: 'Topo da Página' },
  { value: 'lateral', label: 'Lateral / Sidebar' },
  { value: 'rodape', label: 'Rodapé' },
];

export default function AdminAnuncios() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnuncio, setEditingAnuncio] = useState(null);
  const { user: authUser, representante: userRepresentante, loading: loadingUser } = useAuth();
  const user = authUser;
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    imagem_url: '',
    link: '',
    posicao: 'home',
    ordem: 0,
    data_inicio: '',
    data_fim: '',
    ativo: true,
  });

  const queryClient = useQueryClient();

  // user e userRepresentante agora vêm do AuthContext

  const { data: anuncios, isLoading } = useQuery({
    queryKey: ['admin-anuncios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      console.log('=== createMutation.mutationFn ===');
      // Converter strings vazias para null nas datas
      const cleanData = {
        ...data,
        data_inicio: data.data_inicio || null,
        data_fim: data.data_fim || null,
      };
      console.log('Dados a serem inseridos:', cleanData);
      const { data: result, error } = await supabase.from('anuncios').insert([cleanData]).select();
      console.log('Resultado do insert:', result);
      console.log('Erro do insert:', error);
      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      console.log('=== createMutation.onSuccess ===', result);
      queryClient.invalidateQueries({ queryKey: ['admin-anuncios'] });
      toast.success('Anúncio criado com sucesso!');
      closeDialog();
    },
    onError: (error) => {
      console.error('=== createMutation.onError ===', error);
      toast.error('Erro ao criar anúncio: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      console.log('=== updateMutation.mutationFn ===');
      console.log('ID:', id);
      // Converter strings vazias para null nas datas
      const cleanData = {
        ...data,
        data_inicio: data.data_inicio || null,
        data_fim: data.data_fim || null,
      };
      console.log('Dados a serem atualizados:', cleanData);
      const { data: result, error } = await supabase.from('anuncios').update(cleanData).eq('id', id).select();
      console.log('Resultado do update:', result);
      console.log('Erro do update:', error);
      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      console.log('=== updateMutation.onSuccess ===', result);
      queryClient.invalidateQueries({ queryKey: ['admin-anuncios'] });
      toast.success('Anúncio atualizado!');
      closeDialog();
    },
    onError: (error) => {
      console.error('=== updateMutation.onError ===', error);
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('anuncios').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-anuncios'] });
      toast.success('Anúncio excluído!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir: ' + error.message);
    },
  });

  const openCreate = () => {
    setEditingAnuncio(null);
    setFormData({
      titulo: '',
      descricao: '',
      imagem_url: '',
      link: '',
      posicao: 'home',
      ordem: 0,
      data_inicio: '',
      data_fim: '',
      ativo: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (anuncio) => {
    setEditingAnuncio(anuncio);
    setFormData({
      titulo: anuncio.titulo || '',
      descricao: anuncio.descricao || '',
      imagem_url: anuncio.imagem_url || '',
      link: anuncio.link || '',
      posicao: anuncio.posicao || 'home',
      ordem: anuncio.ordem || 0,
      data_inicio: anuncio.data_inicio || '',
      data_fim: anuncio.data_fim || '',
      ativo: anuncio.ativo ?? true,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAnuncio(null);
  };

  const handleSubmit = () => {
    console.log('=== handleSubmit iniciado ===');
    console.log('formData:', formData);
    console.log('editingAnuncio:', editingAnuncio);
    
    // Validação básica
    if (!formData.titulo || !formData.imagem_url) {
      console.log('Validação falhou: título ou imagem vazios');
      toast.error('Preencha o título e a imagem do anúncio');
      return;
    }
    
    console.log('Validação passou, verificando mutation...');
    
    if (editingAnuncio) {
      console.log('Chamando updateMutation.mutate...');
      updateMutation.mutate({ id: editingAnuncio.id, data: formData });
    } else {
      console.log('Chamando createMutation.mutate...');
      createMutation.mutate(formData);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `anuncios/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('fotos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, imagem_url: publicUrl });
      toast.success('Imagem enviada!');
    } catch (error) {
      toast.error('Erro ao enviar imagem: ' + error.message);
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
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Posição: {POSICOES.find(p => p.value === anuncio.posicao)?.label}</span>
                        <span>Ordem: {anuncio.ordem}</span>
                        {anuncio.link && (
                          <a
                            href={anuncio.link}
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
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteMutation.mutate(anuncio.id)}
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
          <form className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input
                value={formData.titulo}
                onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                placeholder="Nome do anúncio"
                required
              />
            </div>

            <div>
              <Label>Descrição</Label>
              <Input
                value={formData.descricao}
                onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                placeholder="Descrição do anúncio"
              />
            </div>

            <div>
              <Label>Imagem *</Label>
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
              <Label>Link</Label>
              <Input
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="https://..."
              />
            </div>

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

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Data Início</Label>
                <Input
                  type="date"
                  value={formData.data_inicio}
                  onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })}
                />
              </div>
              <div>
                <Label>Data Fim</Label>
                <Input
                  type="date"
                  value={formData.data_fim}
                  onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.ativo}
                onCheckedChange={(val) => setFormData({ ...formData, ativo: val })}
              />
              <Label>Anúncio ativo</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancelar
              </Button>
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-[#1e3a5f] hover:bg-[#152a45]"
              >
                {editingAnuncio ? 'Salvar' : 'Criar'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}