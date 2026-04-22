import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
import { Search, CreditCard, ExternalLink, Eye, Printer, X } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import CarteirinhaDigital from '../components/associado/CarteirinhaDigital';

export default function AdminCarteirinhas() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssociado, setSelectedAssociado] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: associados, isLoading, error: queryError } = useQuery({
    queryKey: ['admin-carteirinhas'],
    queryFn: async () => {
      console.log('Buscando representantes...');
      const { data, error } = await supabase
        .from('representantes')
        .select(`*`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Erro ao buscar representantes:', error);
        throw error;
      }
      
      console.log('Representantes encontrados:', data?.length || 0, data);
      return data || [];
    },
  });

  const filteredAssociados = associados?.filter(a => 
    a.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.cpf?.includes(searchTerm) ||
    a.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCarteirinha = (associado) => {
    setSelectedAssociado(associado);
    setDialogOpen(true);
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ativo': return 'bg-emerald-100 text-emerald-700';
      case 'inativo': return 'bg-gray-100 text-gray-700';
      case 'aguardando_pagamento': return 'bg-amber-100 text-amber-700';
      case 'atrasado': return 'bg-red-100 text-red-700';
      case 'cancelado': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
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

  if (queryError) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-red-800 font-semibold mb-2">Erro ao carregar dados</h2>
            <p className="text-red-600">{queryError.message}</p>
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
            <h1 className="text-2xl font-bold text-gray-800">Carteirinhas Emitidas</h1>
            <p className="text-gray-500">{associados?.filter(a => a.ativo === true).length || 0} carteirinhas ativas de {associados?.length || 0} total</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Ativas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {associados?.filter(a => a.ativo === true).length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Aguardando Pagamento</p>
                <p className="text-2xl font-bold text-gray-800">
                  {associados?.filter(a => a.status_aprovacao === 'pendente').length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Inativas/Atrasadas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {associados?.filter(a => ['inativo', 'atrasado', 'cancelado'].includes(a.status_assinatura)).length || 0}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-[#1e3a5f]/10 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-[#1e3a5f]" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold text-gray-800">{associados?.length || 0}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, código ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Associado</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Status Pagamento</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssociados?.map((associado) => (
                  <TableRow key={associado.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{associado.nome}</span>
                        {associado.cargo && (
                          <span className="text-xs text-gray-500">
                            {associado.cargo}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{formatCPF(associado.cpf)}</TableCell>
                    <TableCell>
                      <span className="font-mono text-[#1e3a5f] font-semibold text-sm">
                        {associado.id?.substring(0, 8).toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        associado.ativo 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {associado.ativo ? 'ATIVO' : 'INATIVO'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewCarteirinha(associado)}
                          title="Visualizar Carteirinha"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(
                            `/VerificarCarteirinha?codigo=${associado.id}`,
                            '_blank'
                          )}
                          title="Verificar Carteirinha"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!filteredAssociados || filteredAssociados.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhuma carteirinha encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog - Visualização da Carteirinha */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Carteirinha Digital</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDialogOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            
            {selectedAssociado && (
              <div className="space-y-6">
                {/* Carteirinha Digital Component */}
                <CarteirinhaDigital associado={selectedAssociado} showFull={true} />

                {/* Informações Adicionais */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Código da Carteirinha</span>
                    <span className="font-mono font-semibold text-[#1e3a5f]">
                      {selectedAssociado.id?.substring(0, 8).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-sm">Status Aprovação</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      selectedAssociado.status_aprovacao === 'aprovado'
                        ? 'bg-emerald-100 text-emerald-700'
                        : selectedAssociado.status_aprovacao === 'rejeitado'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedAssociado.status_aprovacao?.toUpperCase() || 'PENDENTE'}
                    </span>
                  </div>
                  {selectedAssociado.cargo && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 text-sm">Cargo</span>
                      <span className="text-right text-sm">
                        {selectedAssociado.cargo}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`/VerificarCarteirinha?codigo=${selectedAssociado.id}`, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Verificar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}