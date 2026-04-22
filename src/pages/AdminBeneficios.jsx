import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Plus, Edit, Trash2, Gift, Loader2, X, Heart, Wallet, GraduationCap, 
  ShoppingBag, Stethoscope, Briefcase, Car, Home, Plane, Smartphone, 
  Zap, Coffee, BookOpen, Dumbbell, Music, Camera, Award, Shield, 
  Clock, MapPin, Star, TrendingUp, Users, Search
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const ICONS = [
  'Gift', 'Heart', 'Wallet', 'GraduationCap', 'ShoppingBag', 'Stethoscope',
  'Briefcase', 'Car', 'Home', 'Plane', 'Smartphone', 'Zap',
  'Coffee', 'BookOpen', 'Dumbbell', 'Music', 'Camera', 'Award',
  'Shield', 'Clock', 'MapPin', 'Star', 'TrendingUp', 'Users'
];

// Mapeamento de ícones para componentes Lucide
const iconComponents = {
  Gift, Heart, Wallet, GraduationCap, ShoppingBag, Stethoscope,
  Briefcase, Car, Home, Plane, Smartphone, Zap,
  Coffee, BookOpen, Dumbbell, Music, Camera, Award,
  Shield, Clock, MapPin, Star, TrendingUp, Users
};

// Componente para renderizar o ícone dinamicamente
function DynamicIcon({ iconName, className }) {
  const IconComponent = iconComponents[iconName] || Gift;
  return <IconComponent className={className} />;
}

export default function AdminBeneficios() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBeneficio, setEditingBeneficio] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    icone: 'Gift',
    link_externo: '',
    imagem_url: '',
    destaques: [],
    ativo: true,
    ordem: 0,
  });
  const [newDestaque, setNewDestaque] = useState('');
  const queryClient = useQueryClient();

  const { data: beneficios, isLoading } = useQuery({
    queryKey: ['admin-beneficios'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficios')
        .select('*')
        .order('ordem', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('beneficios').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-beneficios'] });
      toast.success('Benefício criado com sucesso!');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Erro ao criar: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase.from('beneficios').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-beneficios'] });
      toast.success('Benefício atualizado com sucesso!');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('beneficios').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-beneficios'] });
      toast.success('Benefício removido!');
    },
    onError: (error) => {
      toast.error('Erro ao remover: ' + error.message);
    },
  });

  const handleOpenDialog = (beneficio = null) => {
    if (beneficio) {
      setEditingBeneficio(beneficio);
      setFormData({
        titulo: beneficio.titulo || '',
        descricao: beneficio.descricao || '',
        icone: beneficio.icone || 'Gift',
        link_externo: beneficio.link_externo || '',
        imagem_url: beneficio.imagem_url || '',
        destaques: beneficio.destaques || [],
        ativo: beneficio.ativo ?? true,
        ordem: beneficio.ordem || 0,
      });
    } else {
      setEditingBeneficio(null);
      setFormData({
        titulo: '',
        descricao: '',
        icone: 'Gift',
        link_externo: '',
        imagem_url: '',
        destaques: [],
        ativo: true,
        ordem: beneficios?.length || 0,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingBeneficio(null);
    setNewDestaque('');
  };

  const handleAddDestaque = () => {
    if (newDestaque.trim()) {
      setFormData({
        ...formData,
        destaques: [...formData.destaques, newDestaque.trim()],
      });
      setNewDestaque('');
    }
  };

  const handleRemoveDestaque = (index) => {
    setFormData({
      ...formData,
      destaques: formData.destaques.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    if (!formData.titulo || !formData.descricao) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    if (editingBeneficio) {
      updateMutation.mutate({ id: editingBeneficio.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 gap-6">
            {[1, 2].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Gerenciar Benefícios</h1>
            <p className="text-gray-500">{beneficios?.length || 0} benefícios cadastrados</p>
          </div>
          <Button onClick={() => handleOpenDialog()} className="bg-[#1e3a5f]">
            <Plus className="w-4 h-4 mr-2" />
            Novo Benefício
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar benefício por título ou descrição..."
            className="pl-10"
          />
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {beneficios?.filter(b => 
            searchTerm === '' || 
            b.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            b.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((beneficio) => (
            <Card key={beneficio.id} className={!beneficio.ativo ? 'opacity-60' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                      <DynamicIcon iconName={beneficio.icone} className="w-6 h-6 text-[#1e3a5f]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{beneficio.titulo}</h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          #{beneficio.ordem || 0}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        beneficio.ativo 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {beneficio.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleOpenDialog(beneficio)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        if (confirm('Remover este benefício?')) {
                          deleteMutation.mutate(beneficio.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-3">{beneficio.descricao}</p>
                {beneficio.destaques?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {beneficio.destaques.slice(0, 3).map((d, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {d}
                      </span>
                    ))}
                    {beneficio.destaques.length > 3 && (
                      <span className="text-xs text-gray-500">
                        +{beneficio.destaques.length - 3} mais
                      </span>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBeneficio ? 'Editar Benefício' : 'Novo Benefício'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Título *</Label>
                <Input
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Descrição *</Label>
                <Textarea
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div>
                <Label>Ícone</Label>
                <Select
                  value={formData.icone}
                  onValueChange={(value) => setFormData({ ...formData, icone: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <DynamicIcon iconName={formData.icone} className="w-4 h-4" />
                        <span>{formData.icone}</span>
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        <div className="flex items-center gap-2">
                          <DynamicIcon iconName={icon} className="w-4 h-4" />
                          <span>{icon}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Link Externo</Label>
                <Input
                  value={formData.link_externo}
                  onChange={(e) => setFormData({ ...formData, link_externo: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>URL da Imagem</Label>
                <Input
                  value={formData.imagem_url}
                  onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Destaques/Vantagens</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newDestaque}
                    onChange={(e) => setNewDestaque(e.target.value)}
                    placeholder="Adicionar destaque..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddDestaque()}
                  />
                  <Button type="button" onClick={handleAddDestaque} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.destaques.map((d, i) => (
                    <span key={i} className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-sm">
                      {d}
                      <button onClick={() => handleRemoveDestaque(i)}>
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ordem (1-100)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.ordem}
                    onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                    className="mt-1"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center gap-3 pt-7">
                  <Switch
                    checked={formData.ativo}
                    onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                  />
                  <Label>Benefício ativo</Label>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={handleCloseDialog} className="flex-1">
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-[#1e3a5f]"
                >
                  {(createMutation.isPending || updateMutation.isPending) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingBeneficio ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}