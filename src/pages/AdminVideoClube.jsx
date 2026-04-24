import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video, Save, Loader2, Trash2, ExternalLink, Plus, Star, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

export default function AdminVideoClube() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    titulo: '',
    url_video: '',
    destaque: false,
    ordem: 0,
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ['video-clube'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('video_clube')
        .select('*')
        .order('ordem', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editingId) {
        const { error } = await supabase
          .from('video_clube')
          .update(data)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('video_clube')
          .insert([{ ...data, ativo: true }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-clube'] });
      toast.success(editingId ? 'Vídeo atualizado!' : 'Vídeo adicionado!');
      setEditingId(null);
      setFormData({ titulo: '', url_video: '', destaque: false, ordem: 0 });
    },
    onError: (error) => {
      toast.error('Erro ao salvar: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('video_clube')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-clube'] });
      toast.success('Vídeo removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover: ' + error.message);
    },
  });

  const toggleDestaqueMutation = useMutation({
    mutationFn: async ({ id, destaque }) => {
      // Se estiver ativando destaque, desativa outros primeiro
      if (destaque) {
        await supabase
          .from('video_clube')
          .update({ destaque: false })
          .neq('id', id);
      }
      const { error } = await supabase
        .from('video_clube')
        .update({ destaque })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-clube'] });
      toast.success('Status de destaque atualizado!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.url_video) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleEdit = (video) => {
    setEditingId(video.id);
    setFormData({
      titulo: video.titulo,
      url_video: video.url_video,
      destaque: video.destaque || false,
      ordem: video.ordem || 0,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ titulo: '', url_video: '', destaque: false, ordem: 0 });
  };

  // Função para converter URL do YouTube para embed
  const getEmbedUrl = (url) => {
    if (!url) return '';
    
    // Se já é uma URL de embed, retorna direto
    if (url.includes('embed')) return url;
    
    // Converte URLs do YouTube
    const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    return url;
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Video className="w-7 h-7 text-[#1e3a5f]" />
            Gerenciar Vídeos
          </h1>
          <p className="text-gray-600 mt-1">
            Adicione múltiplos vídeos. Marque um como "Destaque" para exibir na página de Notícias.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Editar Vídeo' : 'Adicionar Novo Vídeo'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Título do Vídeo</Label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Ex: Conheça o Clube de Benefícios"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>URL do Vídeo (YouTube)</Label>
                  <Input
                    value={formData.url_video}
                    onChange={(e) => setFormData({ ...formData, url_video: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=XXXXX"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Aceita links do YouTube ou URLs de embed
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <Switch
                    checked={formData.destaque}
                    onCheckedChange={(checked) => setFormData({ ...formData, destaque: checked })}
                  />
                  <Label className="cursor-pointer">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Vídeo em Destaque (aparece na página de Notícias)
                    </div>
                  </Label>
                </div>

                <div>
                  <Label>Ordem (opcional)</Label>
                  <Input
                    type="number"
                    value={formData.ordem}
                    onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                    placeholder="0"
                    className="mt-1 w-24"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="bg-[#1e3a5f] hover:bg-[#152a45]"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : editingId ? (
                      <Save className="w-4 h-4 mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {editingId ? 'Atualizar' : 'Adicionar'}
                  </Button>

                  {editingId && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                    >
                      Cancelar
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.url_video ? (
                <div className="aspect-video w-full bg-gray-900 rounded-xl overflow-hidden">
                  <iframe
                    src={getEmbedUrl(formData.url_video)}
                    title={formData.titulo}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-gray-100 rounded-xl flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Video className="w-16 h-16 mx-auto mb-2" />
                    <p>Nenhum vídeo configurado</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lista de Vídeos */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Vídeos Cadastrados ({videos?.length || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
                ))}
              </div>
            ) : videos?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nenhum vídeo cadastrado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {videos?.map((video, index) => (
                  <div
                    key={video.id}
                    className={`flex items-center gap-4 p-4 rounded-lg border ${
                      video.destaque ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-gray-400">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    
                    <div className="w-24 h-16 bg-gray-900 rounded overflow-hidden flex-shrink-0">
                      <iframe
                        src={getEmbedUrl(video.url_video)}
                        title={video.titulo}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-800 truncate">{video.titulo}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {video.destaque && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                            <Star className="w-3 h-3 mr-1" />
                            Destaque
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500">Ordem: {video.ordem || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={video.destaque || false}
                        onCheckedChange={(checked) => 
                          toggleDestaqueMutation.mutate({ id: video.id, destaque: checked })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(video)}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => deleteMutation.mutate(video.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}