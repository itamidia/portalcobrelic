import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  Phone, 
  MapPin, 
  Lock, 
  Save, 
  LogOut,
  ChevronRight,
  Shield,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';
import StatusBadge from '@/components/ui/StatusBadge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Perfil() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
    };
    loadUser();
  }, []);

  const { data: associado, isLoading } = useQuery({
    queryKey: ['associado', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const result = await base44.entities.Associado.filter({ email: user.email });
      return result[0] || null;
    },
    enabled: !!user?.email,
  });

  useEffect(() => {
    if (associado) {
      setFormData({
        nome_completo: associado.nome_completo || '',
        telefone: associado.telefone || '',
        endereco: associado.endereco || {},
      });
    }
  }, [associado]);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Associado.update(associado.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['associado']);
      toast.success('Perfil atualizado com sucesso!');
      setEditMode(false);
    },
    onError: (error) => {
      console.error('Erro ao atualizar perfil:', error);
      const mensagem = error?.message?.includes('null') 
        ? 'Dados do perfil não carregados corretamente' 
        : 'Erro ao atualizar perfil';
      toast.error(mensagem);
    },
  });

  const handleSave = () => {
    if (!associado?.id) {
      toast.error('Dados do associado não encontrados');
      return;
    }
    updateMutation.mutate(formData);
  };

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="max-w-lg mx-auto space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1e3a5f] to-[#152a45] pt-8 pb-16 px-4">
        <div className="max-w-lg mx-auto">
          <h1 className="text-white text-2xl font-bold mb-1">Meu Perfil</h1>
          <p className="text-white/60 text-sm">Gerencie suas informações</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-10 space-y-4">
        {/* Profile Card */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#1e3a5f] to-[#2a4a6f] rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-800">
                  {associado?.nome_completo || user?.full_name || 'Nome não informado'}
                </h2>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            </div>
            <StatusBadge status={associado?.status_assinatura || 'aguardando_pagamento'} />
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="border-0 shadow">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold text-gray-700">
                Informações Pessoais
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setEditMode(!editMode)}
              >
                {editMode ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-gray-600">Nome Completo</Label>
              <Input
                value={formData.nome_completo || ''}
                onChange={(e) => setFormData({ ...formData, nome_completo: e.target.value })}
                disabled={!editMode}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-gray-600">Telefone</Label>
              <Input
                value={formData.telefone || ''}
                onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                disabled={!editMode}
                className="mt-1"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-gray-600">CEP</Label>
                <Input
                  value={formData.endereco?.cep || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    endereco: { ...formData.endereco, cep: e.target.value }
                  })}
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-600">Estado</Label>
                <Input
                  value={formData.endereco?.estado || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    endereco: { ...formData.endereco, estado: e.target.value }
                  })}
                  disabled={!editMode}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-600">Cidade</Label>
              <Input
                value={formData.endereco?.cidade || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  endereco: { ...formData.endereco, cidade: e.target.value }
                })}
                disabled={!editMode}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-gray-600">Rua</Label>
              <Input
                value={formData.endereco?.rua || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  endereco: { ...formData.endereco, rua: e.target.value }
                })}
                disabled={!editMode}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-gray-600">Número</Label>
              <Input
                value={formData.endereco?.numero || ''}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  endereco: { ...formData.endereco, numero: e.target.value }
                })}
                disabled={!editMode}
                className="mt-1"
              />
            </div>

            {editMode && (
              <Button 
                onClick={handleSave}
                className="w-full bg-[#1e3a5f] hover:bg-[#152a45] h-12"
                disabled={updateMutation.isPending}
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="border-0 shadow">
          <CardContent className="p-0">
            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b">
                  <Shield className="w-5 h-5 text-gray-500" />
                  <span className="flex-1 text-left text-gray-700">Sobre a ANALC</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Sobre a ANALC</DialogTitle>
                </DialogHeader>
                <p className="text-gray-600 text-sm leading-relaxed">
                  A ANALC — Associação Nacional de Apoio Legal e Comunitário — existe para garantir apoio, 
                  assistência e benefícios sociais acessíveis para famílias de todo o Brasil. 
                  Nosso compromisso é oferecer soluções práticas, seguras e acessíveis para melhorar 
                  a qualidade de vida dos nossos associados.
                </p>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <button className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b">
                  <FileText className="w-5 h-5 text-gray-500" />
                  <span className="flex-1 text-left text-gray-700">Termos de Uso</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Termos de Uso e Privacidade</DialogTitle>
                </DialogHeader>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Ao utilizar os serviços da ANALC, você concorda com nossos termos de uso e política de privacidade.
                  Seus dados pessoais são tratados com segurança e utilizados exclusivamente para prestação dos serviços contratados.
                </p>
              </DialogContent>
            </Dialog>

            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-4 p-4 hover:bg-red-50 transition-colors text-red-600"
            >
              <LogOut className="w-5 h-5" />
              <span className="flex-1 text-left font-medium">Sair da Conta</span>
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}