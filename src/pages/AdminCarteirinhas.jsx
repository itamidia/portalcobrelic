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
import { Search, CreditCard, ExternalLink } from 'lucide-react';
import StatusBadge from '../components/ui/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

export default function AdminCarteirinhas() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: representantes, isLoading } = useQuery({
    queryKey: ['admin-carteirinhas'],
    queryFn: async () => {
      // Filtra por representantes que possuem carteirinha (foto_url ou campo específico)
      const { data, error } = await supabase
        .from('representantes')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      // Retorna todos já que não temos campo carteirinha_ativa específico
      return data || [];
    },
  });

  const filteredAssociados = representantes?.filter(a => 
    a.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.cpf?.includes(searchTerm)
  );

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
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
            <h1 className="text-2xl font-bold text-gray-800">Carteirinhas Emitidas</h1>
            <p className="text-gray-500">{representantes?.length || 0} carteirinhas ativas</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Carteirinhas Regulares</p>
                <p className="text-2xl font-bold text-gray-800">
                  {representantes?.filter(a => a.status_aprovacao === 'aprovado').length || 0}
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
                <p className="text-sm text-gray-500">Carteirinhas Pendentes</p>
                <p className="text-2xl font-bold text-gray-800">
                  {representantes?.filter(a => a.status_aprovacao !== 'aprovado').length || 0}
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
                <p className="text-sm text-gray-500">Total Emitidas</p>
                <p className="text-2xl font-bold text-gray-800">{representantes?.length || 0}</p>
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
                  <TableHead>Código da Carteirinha</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verificar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssociados?.map((associado) => (
                  <TableRow key={associado.id}>
                    <TableCell className="font-medium">{associado.nome_completo}</TableCell>
                    <TableCell>{formatCPF(associado.cpf)}</TableCell>
                    <TableCell>
                      <span className="font-mono text-[#1e3a5f] font-semibold">
                        {associado.codigo_carteirinha}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={associado.status_assinatura} />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(
                          `/VerificarCarteirinha?codigo=${associado.codigo_carteirinha}`,
                          '_blank'
                        )}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
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
      </div>
    </AdminLayout>
  );
}