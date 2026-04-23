import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import AdminLayout from '../components/admin/AdminLayout';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  DollarSign, 
  ExternalLink,
  Package,
  Check,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

export default function AdminPlanos() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPlano, setSelectedPlano] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor: '',
    link_pagamento: '',
    ativo: true,
    ordem: 0,
    cor_destaque: '#1e3a5f',
    beneficiosSelecionados: [],
  });

  // Fetch beneficios disponíveis (primeiro)
  const { data: beneficios, isLoading: loadingBeneficios } = useQuery({
    queryKey: ['admin-beneficios-disponiveis'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('beneficios')
        .select('*')
        .eq('ativo', true)
        .order('titulo', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Fetch planos
  const { data: planosData, isLoading: loadingPlanos } = useQuery({
    queryKey: ['admin-planos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .order('ordem', { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  // Combinar planos com beneficios
  const planos = planosData?.map(plano => {
    const beneficiosIds = plano.beneficios_ids || [];
    const beneficiosDoPlano = beneficios?.filter(b => beneficiosIds.includes(b.id)) || [];
    return {
      ...plano,
      beneficios: beneficiosDoPlano
    };
  }) || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Criar plano com array de beneficios_ids
      const { data: plano, error: planoError } = await supabase
        .from('planos')
        .insert({
          titulo: data.titulo,
          descricao: data.descricao,
          valor: parseFloat(data.valor) || 0,
          link_pagamento: data.link_pagamento,
          beneficios_ids: data.beneficiosSelecionados || [],
          ativo: data.ativo,
          ordem: parseInt(data.ordem) || 0,
          cor_destaque: data.cor_destaque,
        })
        .select()
        .single();
      
      if (planoError) throw planoError;
      return plano;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-planos'] });
      setDialogOpen(false);
      resetForm();
      toast.success('Plano criado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao criar plano: ' + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      // Atualizar plano com array de beneficios_ids
      const { data: plano, error: planoError } = await supabase
        .from('planos')
        .update({
          titulo: data.titulo,
          descricao: data.descricao,
          valor: parseFloat(data.valor) || 0,
          link_pagamento: data.link_pagamento,
          beneficios_ids: data.beneficiosSelecionados || [],
          ativo: data.ativo,
          ordem: parseInt(data.ordem) || 0,
          cor_destaque: data.cor_destaque,
        })
        .eq('id', data.id)
        .select()
        .single();
      
      if (planoError) throw planoError;
      return plano;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-planos'] });
      setDialogOpen(false);
      setSelectedPlano(null);
      resetForm();
      toast.success('Plano atualizado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar plano: ' + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('planos')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-planos'] });
      setDeleteDialogOpen(false);
      setSelectedPlano(null);
      toast.success('Plano excluído com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao excluir plano: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      titulo: '',
      descricao: '',
      valor: '',
      link_pagamento: '',
      ativo: true,
      ordem: 0,
      cor_destaque: '#1e3a5f',
      beneficiosSelecionados: [],
    });
  };

  const handleOpenCreate = () => {
    setSelectedPlano(null);
    resetForm();
    setDialogOpen(true);
  };

  const handleOpenEdit = (plano) => {
    setSelectedPlano(plano);
    setFormData({
      titulo: plano.titulo || '',
      descricao: plano.descricao || '',
      valor: plano.valor?.toString() || '',
      link_pagamento: plano.link_pagamento || '',
      ativo: plano.ativo ?? true,
      ordem: plano.ordem || 0,
      cor_destaque: plano.cor_destaque || '#1e3a5f',
      beneficiosSelecionados: plano.beneficios_ids || [],
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedPlano) {
      updateMutation.mutate({ ...formData, id: selectedPlano.id });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = () => {
    if (selectedPlano) {
      deleteMutation.mutate(selectedPlano.id);
    }
  };

  const toggleBeneficio = (beneficioId) => {
    setFormData(prev => ({
      ...prev,
      beneficiosSelecionados: prev.beneficiosSelecionados.includes(beneficioId)
        ? prev.beneficiosSelecionados.filter(id => id !== beneficioId)
        : [...prev.beneficiosSelecionados, beneficioId],
    }));
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value || 0);
  };

  const filteredPlanos = planos?.filter(plano =>
    plano.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plano.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isLoading = loadingPlanos || loadingBeneficios;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Planos de Associação</h1>
            <p className="text-gray-500">Gerencie os planos disponíveis para os associados</p>
          </div>
          <Button onClick={handleOpenCreate} className="bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f]">
            <Plus className="w-4 h-4 mr-2" />
            Novo Plano
          </Button>
        </div>

        {/* Search */}
        <div className="flex gap-4">
          <Input
            placeholder="Buscar planos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Planos Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlanos?.map((plano) => (
              <Card key={plano.id} className={`overflow-hidden ${!plano.ativo ? 'opacity-60' : ''}`}>
                <CardHeader 
                  className="pb-4"
                  style={{ 
                    background: `linear-gradient(135deg, ${plano.cor_destaque || '#1e3a5f'} 0%, ${plano.cor_destaque ? plano.cor_destaque + 'dd' : '#2a4a6f'} 100%)` 
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-white text-lg">{plano.titulo}</CardTitle>
                      <CardDescription className="text-white/70">
                        {plano.ativo ? 'Ativo' : 'Inativo'} • Ordem {plano.ordem}
                      </CardDescription>
                    </div>
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 space-y-4">
                  <p className="text-gray-600 text-sm line-clamp-2">{plano.descricao}</p>
                  
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    <span className="text-2xl font-bold text-gray-800">
                      {formatCurrency(plano.valor)}
                    </span>
                    <span className="text-gray-500 text-sm">/mês</span>
                  </div>

                  {/* Benefícios incluídos */}
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Benefícios incluídos:</p>
                    <div className="flex flex-wrap gap-2">
                      {plano.beneficios?.length > 0 ? (
                        plano.beneficios.slice(0, 3).map((beneficio, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center px-2 py-1 bg-gray-100 rounded text-xs text-gray-700"
                          >
                            <Check className="w-3 h-3 mr-1 text-emerald-600" />
                            {beneficio?.titulo || 'Benefício'}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-gray-400">Nenhum benefício associado</span>
                      )}
                      {plano.beneficios?.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{plano.beneficios.length - 3} mais
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Link de pagamento */}
                  {plano.link_pagamento && (
                    <div className="flex items-center gap-2 text-sm text-blue-600">
                      <ExternalLink className="w-4 h-4" />
                      <span className="truncate">Link de pagamento configurado</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenEdit(plano)}
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setSelectedPlano(plano);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {filteredPlanos?.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum plano encontrado</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={handleOpenCreate}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Criar primeiro plano
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedPlano ? 'Editar Plano' : 'Novo Plano'}
              </DialogTitle>
              <DialogDescription>
                Configure os detalhes do plano e associe os benefícios incluídos.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título *</Label>
                    <Input
                      id="titulo"
                      value={formData.titulo}
                      onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                      placeholder="Ex: Plano Premium"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="valor">Valor (R$) *</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.valor}
                      onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                      placeholder="30.00"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Input
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Descreva o que está incluído no plano..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link_pagamento">Link de Pagamento (Asaas ou outro)</Label>
                  <Input
                    id="link_pagamento"
                    value={formData.link_pagamento}
                    onChange={(e) => setFormData({ ...formData, link_pagamento: e.target.value })}
                    placeholder="https://asaas.com/p/..."
                  />
                  <p className="text-xs text-gray-500">
                    Link direto para pagamento. Pode ser do Asaas ou qualquer outro gateway.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ordem">Ordem de exibição</Label>
                    <Input
                      id="ordem"
                      type="number"
                      min="0"
                      value={formData.ordem}
                      onChange={(e) => setFormData({ ...formData, ordem: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cor_destaque">Cor de destaque</Label>
                    <div className="flex gap-2">
                      <Input
                        id="cor_destaque"
                        type="color"
                        value={formData.cor_destaque}
                        onChange={(e) => setFormData({ ...formData, cor_destaque: e.target.value })}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={formData.cor_destaque}
                        onChange={(e) => setFormData({ ...formData, cor_destaque: e.target.value })}
                        placeholder="#1e3a5f"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 flex items-end">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="ativo"
                        checked={formData.ativo}
                        onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })}
                      />
                      <Label htmlFor="ativo">Plano ativo</Label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefícios Selection */}
              <div className="space-y-3">
                <Label>Benefícios incluídos no plano</Label>
                <div className="border rounded-lg p-4 space-y-2 max-h-48 overflow-y-auto">
                  {beneficios?.length > 0 ? (
                    beneficios.map((beneficio) => (
                      <div 
                        key={beneficio.id} 
                        className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded"
                      >
                        <Checkbox
                          id={`beneficio-${beneficio.id}`}
                          checked={formData.beneficiosSelecionados.includes(beneficio.id)}
                          onCheckedChange={() => toggleBeneficio(beneficio.id)}
                        />
                        <label 
                          htmlFor={`beneficio-${beneficio.id}`}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <span className="text-sm font-medium">{beneficio.titulo}</span>
                          <span className="text-xs text-gray-500">{beneficio.descricao}</span>
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum benefício cadastrado. Cadastre benefícios primeiro.
                    </p>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.beneficiosSelecionados.length} benefício(s) selecionado(s)
                </p>
              </div>

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#d4af37] hover:bg-[#c4a030] text-[#1e3a5f]"
                  disabled={isSubmitting || !formData.titulo || !formData.valor}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#1e3a5f]/30 border-t-[#1e3a5f] rounded-full animate-spin mr-2" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {selectedPlano ? 'Atualizar' : 'Criar'} Plano
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja excluir o plano <strong>{selectedPlano?.titulo}</strong>?
                Esta ação não pode ser desfeita.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Excluindo...' : 'Excluir Plano'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
