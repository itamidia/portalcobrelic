import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseApi';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bell, 
  Mail, 
  MessageCircle,
  Clock,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Notificacoes() {
  const { user, representante } = useAuth();
  const queryClient = useQueryClient();
  const [notificacaoSelecionada, setNotificacaoSelecionada] = useState(null);

  // Buscar notificações globais do tipo 'notificacao' (app apenas)
  const { data: notificacoes, isLoading } = useQuery({
    queryKey: ['minhas-notificacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .is('destinatario_id', null)  // Notificações em massa (sem destinatario específico)
        .eq('canal', 'notificacao')   // Apenas notificações do app
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: true,
  });

  // Marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true, data_leitura: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minhas-notificacoes'] });
    },
  });

  // Excluir notificação
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('notificacoes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['minhas-notificacoes'] });
      toast.success('Notificação excluída');
      setNotificacaoSelecionada(null);
    },
  });

  const getCanalIcon = (canal) => {
    switch (canal) {
      case 'email':
        return <Mail className="w-4 h-4 text-blue-500" />;
      case 'whatsapp':
        return <MessageCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Bell className="w-4 h-4 text-[#1e3a5f]" />;
    }
  };

  const getCanalLabel = (canal) => {
    switch (canal) {
      case 'email':
        return 'E-mail';
      case 'whatsapp':
        return 'WhatsApp';
      default:
        return 'Notificação';
    }
  };

  const naoLidasCount = notificacoes?.filter(n => !n.lida).length || 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="w-6 h-6 text-[#1e3a5f]" />
            Notificações
            {naoLidasCount > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {naoLidasCount}
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-1">
            {naoLidasCount > 0 
              ? `Você tem ${naoLidasCount} notificação${naoLidasCount > 1 ? 's' : ''} não lida${naoLidasCount > 1 ? 's' : ''}`
              : 'Todas as notificações foram lidas'
            }
          </p>
        </div>

        {/* Lista de Notificações */}
        <div className="space-y-3">
          {notificacoes?.map((notif) => (
            <Card 
              key={notif.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                !notif.lida ? 'border-l-4 border-l-[#1e3a5f]' : ''
              }`}
              onClick={() => {
                setNotificacaoSelecionada(notif);
                if (!notif.lida) {
                  markAsReadMutation.mutate(notif.id);
                }
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getCanalIcon(notif.canal)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold truncate ${!notif.lida ? 'text-[#1e3a5f]' : 'text-gray-700'}`}>
                        {notif.titulo}
                      </h3>
                      {!notif.lida && (
                        <span className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {notif.mensagem}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {notif.created_at && format(new Date(notif.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      <span className="mx-1">•</span>
                      {getCanalLabel(notif.canal)}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}

          {(!notificacoes || notificacoes.length === 0) && (
            <Card>
              <CardContent className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhuma notificação recebida</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Modal de Detalhes */}
        {notificacaoSelecionada && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md max-h-[80vh] overflow-auto">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  {getCanalIcon(notificacaoSelecionada.canal)}
                  <span className="text-sm text-gray-500">{getCanalLabel(notificacaoSelecionada.canal)}</span>
                  {!notificacaoSelecionada.lida && (
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded">
                      Não lida
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg">{notificacaoSelecionada.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {notificacaoSelecionada.mensagem}
                </p>
                <div className="text-sm text-gray-400 border-t pt-4">
                  <p>Recebida em: {notificacaoSelecionada.created_at && format(new Date(notificacaoSelecionada.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  {notificacaoSelecionada.data_leitura && (
                    <p>Lida em: {format(new Date(notificacaoSelecionada.data_leitura), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setNotificacaoSelecionada(null)}
                  >
                    Fechar
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir esta notificação?')) {
                        deleteMutation.mutate(notificacaoSelecionada.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
