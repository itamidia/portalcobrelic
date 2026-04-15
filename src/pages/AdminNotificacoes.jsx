import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
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
import { Bell, Send, Mail, MessageCircle, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminNotificacoes() {
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [canal, setCanal] = useState('email');
  const [destinatarios, setDestinatarios] = useState('todos');
  const queryClient = useQueryClient();

  const { data: notificacoes, isLoading } = useQuery({
    queryKey: ['admin-notificacoes'],
    queryFn: () => base44.entities.Notificacao.list('-created_date', 50),
  });

  const { data: associados } = useQuery({
    queryKey: ['admin-associados-notif'],
    queryFn: () => base44.entities.Associado.list(),
  });

  const sendMutation = useMutation({
    mutationFn: async (data) => {
      // For each target, create a notification record
      let targets = [];
      
      if (data.destinatarios === 'todos') {
        targets = associados || [];
      } else if (data.destinatarios === 'ativos') {
        targets = associados?.filter(a => a.status_assinatura === 'ativo') || [];
      } else if (data.destinatarios === 'inadimplentes') {
        targets = associados?.filter(a => 
          a.status_assinatura === 'atrasado' || a.status_assinatura === 'aguardando_pagamento'
        ) || [];
      }

      // Create notification records
      const notifications = targets.map(a => ({
        associado_id: a.id,
        tipo: 'em_massa',
        canal: data.canal,
        titulo: data.titulo,
        mensagem: data.mensagem,
        status: 'pendente',
      }));

      if (notifications.length > 0) {
        await base44.entities.Notificacao.bulkCreate(notifications);
      }

      return { count: notifications.length };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries(['admin-notificacoes']);
      toast.success(`${result.count} notificações enviadas!`);
      setTitulo('');
      setMensagem('');
    },
    onError: () => {
      toast.error('Erro ao enviar notificações');
    },
  });

  const handleSend = () => {
    if (!titulo || !mensagem) {
      toast.error('Preencha o título e a mensagem');
      return;
    }
    sendMutation.mutate({ titulo, mensagem, canal, destinatarios });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'enviado':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'erro':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
    }
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
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notificações em Massa</h1>
          <p className="text-gray-500">Envie mensagens para seus associados</p>
        </div>

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
                    <SelectItem value="email">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        E-mail
                      </div>
                    </SelectItem>
                    <SelectItem value="whatsapp">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </div>
                    </SelectItem>
                    <SelectItem value="ambos">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Ambos
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
              Enviar Notificação
            </Button>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Notificações</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notificacoes?.map((notif) => (
                  <TableRow key={notif.id}>
                    <TableCell className="capitalize">{notif.tipo?.replace(/_/g, ' ')}</TableCell>
                    <TableCell className="capitalize">{notif.canal}</TableCell>
                    <TableCell>{notif.titulo || notif.mensagem?.slice(0, 30)}...</TableCell>
                    <TableCell>
                      {notif.created_date && format(new Date(notif.created_date), 'dd/MM/yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(notif.status)}
                        <span className="capitalize">{notif.status}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!notificacoes || notificacoes.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhuma notificação enviada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}