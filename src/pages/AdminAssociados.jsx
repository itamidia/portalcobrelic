import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Eye, Edit, Users, Loader2 } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminAssociados() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAssociado, setSelectedAssociado] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});
  const queryClient = useQueryClient();

  const { data: associados, isLoading } = useQuery({
    queryKey: ['admin-associados'],
    queryFn: () => base44.entities.Associado.list('-created_date'),
  });

  const { data: pagamentos } = useQuery({
    queryKey: ['admin-pagamentos', selectedAssociado?.id],
    queryFn: () => base44.entities.Pagamento.filter({ associado_id: selectedAssociado?.id }, '-created_date'),
    enabled: !!selectedAssociado,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Associado.update(selectedAssociado.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-associados']);
      toast.success('Líder comunitário atualizado com sucesso!');
      setEditMode(false);
    },
  });

  const filteredAssociados = associados?.filter(a => {
    const matchSearch = 
      a.nome_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.cpf?.includes(searchTerm) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status_assinatura === statusFilter;
    return matchSearch && matchStatus;
  });

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const handleEdit = (associado) => {
    setSelectedAssociado(associado);
    setEditData(associado);
    setEditMode(true);
  };

  const handleSave = () => {
    updateMutation.mutate(editData);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full rounded-xl" />
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
            <h1 className="text-2xl font-bold text-gray-800">Gestão de Líderes Comunitários</h1>
            <p className="text-gray-500">{associados?.length || 0} líderes cadastrados</p>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, CPF ou e-mail..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="aguardando_pagamento">Aguardando</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssociados?.map((associado) => (
                  <TableRow key={associado.id}>
                    <TableCell className="font-medium">{associado.nome_completo}</TableCell>
                    <TableCell>{formatCPF(associado.cpf)}</TableCell>
                    <TableCell>{associado.email}</TableCell>
                    <TableCell>{associado.telefone}</TableCell>
                    <TableCell>
                      <StatusBadge status={associado.status_assinatura} />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setSelectedAssociado(associado);
                            setEditMode(false);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEdit(associado)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* View/Edit Dialog */}
        <Dialog open={!!selectedAssociado} onOpenChange={() => {
          setSelectedAssociado(null);
          setEditMode(false);
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editMode ? 'Editar Líder Comunitário' : 'Detalhes do Líder Comunitário'}
              </DialogTitle>
            </DialogHeader>
            
            {selectedAssociado && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Nome Completo</Label>
                    {editMode ? (
                      <Input
                        value={editData.nome_completo || ''}
                        onChange={(e) => setEditData({ ...editData, nome_completo: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium mt-1">{selectedAssociado.nome_completo}</p>
                    )}
                  </div>
                  <div>
                    <Label>CPF</Label>
                    <p className="font-medium mt-1">{formatCPF(selectedAssociado.cpf)}</p>
                  </div>
                  <div>
                    <Label>E-mail</Label>
                    <p className="font-medium mt-1">{selectedAssociado.email}</p>
                  </div>
                  <div>
                    <Label>Telefone</Label>
                    {editMode ? (
                      <Input
                        value={editData.telefone || ''}
                        onChange={(e) => setEditData({ ...editData, telefone: e.target.value })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium mt-1">{selectedAssociado.telefone}</p>
                    )}
                  </div>
                  <div>
                    <Label>Status</Label>
                    {editMode ? (
                      <Select
                        value={editData.status_assinatura}
                        onValueChange={(value) => setEditData({ ...editData, status_assinatura: value })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="aguardando_pagamento">Aguardando</SelectItem>
                          <SelectItem value="atrasado">Atrasado</SelectItem>
                          <SelectItem value="cancelado">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1">
                        <StatusBadge status={selectedAssociado.status_assinatura} />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Código Carteirinha</Label>
                    <p className="font-mono font-medium mt-1 text-[#1e3a5f]">
                      {selectedAssociado.codigo_carteirinha || 'Não gerada'}
                    </p>
                  </div>
                </div>

                {/* Payment History */}
                {!editMode && pagamentos && pagamentos.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Histórico de Pagamentos</h3>
                    <div className="space-y-2">
                      {pagamentos.map((p) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">R$ {p.valor?.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">
                              {p.data_pagamento ? format(new Date(p.data_pagamento), 'dd/MM/yyyy') : 'Pendente'}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            p.status === 'confirmado' ? 'bg-emerald-100 text-emerald-700' :
                            p.status === 'atrasado' ? 'bg-red-100 text-red-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {editMode && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setEditMode(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="flex-1 bg-[#1e3a5f]"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : 'Salvar'}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}