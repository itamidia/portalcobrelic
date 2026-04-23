import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
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
  const { user: authUser, representante: userRepresentante, loading: loadingUser } = useAuth();
  const user = authUser;
  const [formData, setFormData] = useState({
    titulo: '',
    resumo: '',
    conteudo: '',
    imagem_url: '',
    categoria: 'geral',
    destaque: false,
    ativo: true,
    publicado_em: format(new Date(), 'yyyy-MM-dd'),
  });

  const queryClient = useQueryClient();

  // user e userRepresentante vêm do AuthContext

  const { data: noticias, isLoading } = useQuery({
    queryKey: ['admin-noticias'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Converter data string para datetime
      const cleanData = {
        ...data,
        publicado_em: data.publicado_em ? new Date(data.publicado_em).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('noticias').insert([cleanData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-noticias'] });
      toast.success('Notícia criada com sucesso!');
      closeDialog();
    },
    onError: (error) => {
      toast.error('Erro ao criar notícia: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      // Converter data string para datetime
      const cleanData = {
        ...data,
        publicado_em: data.publicado_em ? new Date(data.publicado_em).toISOString() : new Date().toISOString(),
      };
      const { error } = await supabase.from('noticias').update(cleanData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-noticias'] });
      toast.success('Notícia atualizada!');
      closeDialog();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('noticias').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-noticias'] });
      toast.success('Notícia excluída!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir: ' + error.message);
    },
  });

  const openCreate = () => {
    setEditingNoticia(null);
    setFormData({
      titulo: '',
      resumo: '',
      conteudo: '',
      imagem_url: '',
      categoria: 'geral',
      destaque: false,
      ativo: true,
      publicado_em: format(new Date(), 'yyyy-MM-dd'),
    });
    setDialogOpen(true);
  };

  const openEdit = (noticia) => {
    setEditingNoticia(noticia);
    setFormData({
      titulo: noticia.titulo || '',
      resumo: noticia.resumo || '',
      conteudo: noticia.conteudo || '',
      imagem_url: noticia.imagem_url || '',
      categoria: noticia.categoria || 'geral',
      destaque: noticia.destaque ?? false,
      ativo: noticia.ativo ?? true,
      publicado_em: noticia.publicado_em ? format(new Date(noticia.publicado_em), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingNoticia(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('=== handleSubmit ===');
    console.log('formData:', formData);
    
    // Criar objeto limpo apenas com campos válidos
    const cleanFormData = {
      titulo: formData.titulo,
      resumo: formData.resumo,
      conteudo: formData.conteudo,
      imagem_url: formData.imagem_url,
      categoria: formData.categoria,
      destaque: formData.destaque,
      ativo: formData.ativo,
      publicado_em: formData.publicado_em,
    };
    console.log('cleanFormData:', cleanFormData);
    
    if (editingNoticia) {
      updateMutation.mutate({ id: editingNoticia.id, data: cleanFormData });
    } else {
      createMutation.mutate(cleanFormData);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `noticias/${fileName}`;

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
                        {noticia.publicado_em && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(noticia.publicado_em), 'dd/MM/yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pr-4 pt-3">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => openEdit(noticia)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteMutation.mutate(noticia.id)}
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
                  value={formData.publicado_em}
                  onChange={(e) => setFormData({ ...formData, publicado_em: e.target.value })}
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