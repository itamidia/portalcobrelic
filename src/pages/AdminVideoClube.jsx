import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Video, Save, Loader2, Trash2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminVideoClube() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    titulo: '',
    url_video: '',
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ['video-clube'],
    queryFn: async () => {
      const { data, error } = await supabase.from('video_clube').select('*');
      if (error) throw error;
      return data || [];
    },
  });

  // Atualiza o form quando os dados carregam
  React.useEffect(() => {
    if (videos && videos.length > 0) {
      setFormData({
        titulo: videos[0].titulo || '',
        url_video: videos[0].url_video || '',
      });
    }
  }, [videos]);

  // Atualiza o form quando os dados carregam
  React.useEffect(() => {
    if (videos && videos.length > 0) {
      setFormData({
        titulo: videos[0].titulo || '',
        url_video: videos[0].url_video || '',
      });
    }
  }, [videos]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (videos && videos.length > 0) {
        const { error } = await supabase
          .from('video_clube')
          .update(data)
          .eq('id', videos[0].id);
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
      toast.success('Vídeo salvo com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao salvar: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (videos && videos.length > 0) {
        const { error } = await supabase
          .from('video_clube')
          .delete()
          .eq('id', videos[0].id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['video-clube'] });
      setFormData({ titulo: '', url_video: '' });
      toast.success('Vídeo removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover: ' + error.message);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.titulo || !formData.url_video) {
      toast.error('Preencha todos os campos');
      return;
    }
    saveMutation.mutate(formData);
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
            Vídeo do Clube de Benefícios
          </h1>
          <p className="text-gray-600 mt-1">
            Configure o vídeo explicativo que aparece na página do Clube de Benefícios
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário */}
          <Card>
            <CardHeader>
              <CardTitle>Configurar Vídeo</CardTitle>
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
                  <Label>URL do Vídeo</Label>
                  <Input
                    value={formData.url_video}
                    onChange={(e) => setFormData({ ...formData, url_video: e.target.value })}
                    placeholder="Cole a URL do YouTube aqui"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Aceita links do YouTube (ex: https://www.youtube.com/watch?v=XXXXX)
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="bg-[#1e3a5f] hover:bg-[#152a45]"
                  >
                    {saveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Salvar Vídeo
                  </Button>

                  {videos && videos.length > 0 && (
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4 mr-2" />
                      )}
                      Remover
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Preview
                <a
                  href="/ClubeBeneficios"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-normal text-[#1e3a5f] hover:underline flex items-center gap-1"
                >
                  Ver página <ExternalLink className="w-4 h-4" />
                </a>
              </CardTitle>
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
      </div>
    </AdminLayout>
  );
}