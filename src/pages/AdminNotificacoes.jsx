import React, { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Bell, Send, Mail, MessageCircle, Loader2, CheckCircle, XCircle, Clock, Search, Filter, Trash2, Eye, BarChart3 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminNotificacoes() {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [canal, setCanal] = useState('notificacao');
  const [destinatarios, setDestinatarios] = useState('todos');
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [mostrarEstatisticas, setMostrarEstatisticas] = useState(false);
  const enviandoRef = useRef(false);  // Ref para prevenir duplo envio
  const envioIdRef = useRef(0);  // ID único para cada envio
  const queryClient = useQueryClient();

  const { data: notificacoes, isLoading } = useQuery({
    queryKey: ['admin-notificacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: associados } = useQuery({
    queryKey: ['admin-associados-notif'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('representantes')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      console.log(`[DEBUG] [Envio #${data._envioId}] Iniciando mutation...`);
      console.log('[DEBUG] Dados:', { titulo: data.titulo, mensagem: data.mensagem, canal: data.canal, destinatarios: data.destinatarios });
      console.log('[DEBUG] Associados disponíveis:', associados?.length || 0);

      // Filtrar destinatários
      let targets = [];
      
      if (data.destinatarios === 'todos') {
        targets = associados || [];
      } else if (data.destinatarios === 'ativos') {
        targets = associados?.filter(a => a.status_aprovacao === 'aprovado') || [];
      } else if (data.destinatarios === 'inadimplentes') {
        targets = associados?.filter(a => 
          a.status_aprovacao === 'pendente' || a.status_aprovacao === 'rejeitado'
        ) || [];
      }

      console.log(`[DEBUG] [Envio #${data._envioId}] Targets filtrados:`, targets.length);

      if (targets.length === 0) {
        console.warn('[DEBUG] Nenhum destinatário encontrado!');
        return { count: 0, canal: data.canal };
      }

      // Criar apenas 1 registro por envio em massa (não 1 por usuário)
      // Todos os usuários verão a mesma notificação no app
      const notification = {
        tipo: 'em_massa',
        canal: data.canal,  // 'notificacao', 'email' ou 'whatsapp'
        titulo: data.titulo,
        mensagem: data.mensagem,
        lida: data.canal === 'notificacao' ? false : true,  // Email/WhatsApp já são "enviados"
        total_destinatarios: targets.length,  // Quantidade de usuários que receberam
      };

      console.log(`[DEBUG] [Envio #${data._envioId}] Salvando 1 registro para ${targets.length} destinatários`);

      const { error, data: insertedData } = await supabase.from('notificacoes').insert(notification).select();
      if (error) {
        console.error('[DEBUG] Erro ao inserir:', error);
        throw error;
      }
      console.log(`[DEBUG] [Envio #${data._envioId}] Inserido com sucesso: 1 registro`);

      // Simular envio para email e whatsapp (TODO: integrar com serviços reais)
      if (data.canal === 'email') {
        console.log(`[EMAIL] Enviando ${targets.length} emails:`);
        targets.forEach(t => console.log(`  → ${t.email}: ${data.titulo}`));
      } else if (data.canal === 'whatsapp') {
        console.log(`[WHATSAPP] Enviando ${targets.length} mensagens:`);
        targets.forEach(t => console.log(`  → ${t.telefone || t.whatsapp}: ${data.titulo}`));
      }

      return { count: targets.length, canal: data.canal };
    },
    onSuccess: (result, variables) => {
      enviandoRef.current = false;
      console.log(`[DEBUG] [Envio #${variables._envioId}] Sucesso!`);
      if (result.canal === 'notificacao') {
        queryClient.invalidateQueries({ queryKey: ['admin-notificacoes'] });
        toast.success(`${result.count} notificações salvas no app!`);
      } else if (result.canal === 'email') {
        toast.success(`${result.count} emails enviados! (simulação)`);
      } else if (result.canal === 'whatsapp') {
        toast.success(`${result.count} mensagens WhatsApp enviadas! (simulação)`);
      }
      setTitulo('');
      setMensagem('');
    },
    onError: (error, variables) => {
      enviandoRef.current = false;
      console.error(`[DEBUG] [Envio #${variables._envioId}] Erro:`, error.message);
      toast.error('Erro ao enviar: ' + error.message);
    },
  });

  const handleSend = () => {
    if (!titulo || !mensagem) {
      toast.error('Preencha o título e a mensagem');
      return;
    }
    if (enviandoRef.current) {
      console.log('[DEBUG] Já está enviando, ignorando clique');
      return;
    }
    
    enviandoRef.current = true;
    envioIdRef.current += 1;
    const currentId = envioIdRef.current;
    console.log(`[DEBUG] Iniciando envio #${currentId}...`);
    sendMutation.mutate({ titulo, mensagem, canal, destinatarios, _envioId: currentId });
  };

  // Mutation para marcar como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true, data_leitura: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notificacoes'] });
      toast.success('Notificação marcada como lida');
    },
    onError: (error) => {
      toast.error('Erro: ' + error.message);
    },
  });

  // Mutation para excluir
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('notificacoes').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notificacoes'] });
      toast.success('Notificação excluída');
    },
    onError: (error) => {
      toast.error('Erro ao excluir: ' + error.message);
    },
  });

  // Estatísticas
  const estatisticas = React.useMemo(() => {
    if (!notificacoes) return { total: 0, lidas: 0, naoLidas: 0 };
    const total = notificacoes.length;
    const lidas = notificacoes.filter(n => n.lida).length;
    const naoLidas = total - lidas;
    return { total, lidas, naoLidas };
  }, [notificacoes]);

  // Filtros
  const notificacoesFiltradas = React.useMemo(() => {
    if (!notificacoes) return [];
    return notificacoes.filter(n => {
      const matchBusca = busca === '' || 
        n.titulo?.toLowerCase().includes(busca.toLowerCase()) ||
        n.mensagem?.toLowerCase().includes(busca.toLowerCase());
      const matchStatus = filtroStatus === 'todos' ||
        (filtroStatus === 'lidas' && n.lida) ||
        (filtroStatus === 'nao-lidas' && !n.lida);
      return matchBusca && matchStatus;
    });
  }, [notificacoes, busca, filtroStatus]);

  const getStatusIcon = (lida) => {
    return lida 
      ? <CheckCircle className="w-4 h-4 text-emerald-500" />
      : <Clock className="w-4 h-4 text-amber-500" />;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header com estatísticas */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Notificações em Massa</h1>
            <p className="text-gray-500">Envie mensagens para seus associados</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setMostrarEstatisticas(!mostrarEstatisticas)}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            {mostrarEstatisticas ? 'Ocultar' : 'Mostrar'} Estatísticas
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        {mostrarEstatisticas && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{estatisticas.total}</p>
                </div>
                <Bell className="w-8 h-8 text-[#1e3a5f] opacity-20" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Lidas</p>
                  <p className="text-2xl font-bold text-emerald-600">{estatisticas.lidas}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-emerald-500 opacity-20" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Não Lidas</p>
                  <p className="text-2xl font-bold text-amber-600">{estatisticas.naoLidas}</p>
                </div>
                <Clock className="w-8 h-8 text-amber-500 opacity-20" />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Send Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Nova Notificação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Canal de Envio</Label>
                <Select value={canal} onValueChange={setCanal}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="notificacao">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Notificação no App
                      </div>
                    </SelectItem>
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        E-mail (não salva no app)
                      </div>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp (não salva no app)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Destinatários</Label>
                <Select value={destinatarios} onValueChange={setDestinatarios}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Associados</SelectItem>
                    <SelectItem value="ativos">Apenas Ativos</SelectItem>
                    <SelectItem value="inadimplentes">Inadimplentes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Título</Label>
              <Input
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Título da notificação"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Mensagem</Label>
              <Textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                placeholder="Escreva sua mensagem aqui..."
                className="mt-1"
                rows={5}
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={sendMutation.isPending}
              className="bg-[#1e3a5f]"
            >
              {sendMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              {sendMutation.isPending ? 'Enviando...' : 'Salvar Notificação'}
            </Button>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Histórico de Notificações</span>
              <span className="text-sm font-normal text-gray-500">
                {notificacoesFiltradas.length} de {notificacoes?.length || 0}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por título ou mensagem..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="lidas">Lidas</SelectItem>
                  <SelectItem value="nao-lidas">Não Lidas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabela */}
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificacoesFiltradas.map((notif) => (
                    <TableRow key={notif.id}>
                      <TableCell className="capitalize">{notif.tipo?.replace(/_/g, ' ')}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="font-medium">{notif.titulo}</div>
                        <div className="text-sm text-gray-500 truncate">{notif.mensagem}</div>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                          notif.canal === 'email' ? 'bg-blue-100 text-blue-700' :
                          notif.canal === 'whatsapp' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {notif.canal === 'email' && <Mail className="w-3 h-3" />}
                          {notif.canal === 'whatsapp' && <MessageCircle className="w-3 h-3" />}
                          {notif.canal === 'notificacao' && <Bell className="w-3 h-3" />}
                          {notif.canal === 'email' ? 'E-mail' : 
                           notif.canal === 'whatsapp' ? 'WhatsApp' : 'Notificação'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {notif.created_at && format(new Date(notif.created_at), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(notif.lida)}
                          <span className="capitalize">{notif.lida ? 'lida' : 'não lida'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!notif.lida && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => markAsReadMutation.mutate(notif.id)}
                              disabled={markAsReadMutation.isPending}
                              title="Marcar como lida"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm('Tem certeza que deseja excluir esta notificação?')) {
                                deleteMutation.mutate(notif.id);
                              }
                            }}
                            disabled={deleteMutation.isPending}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            title="Excluir"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {notificacoesFiltradas.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {notificacoes?.length === 0 
                          ? 'Nenhuma notificação enviada'
                          : 'Nenhuma notificação encontrada com os filtros aplicados'
                        }
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}