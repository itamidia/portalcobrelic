import React from 'react';
import { supabase } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Wallet, 
  Shield, 
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function Admin() {
  const { data: representantes, isLoading: loadingRepresentantes } = useQuery({
    queryKey: ['admin-representantes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('representantes')
        .select('*');
      if (error) throw error;
      return data || [];
    },
  });

  const stats = {
    totalRepresentantes: representantes?.length || 0,
    ativos: representantes?.filter(r => r.status_aprovacao === 'aprovado' && r.ativo).length || 0,
    pendentes: representantes?.filter(r => r.status_aprovacao === 'pendente').length || 0,
    inativos: representantes?.filter(r => !r.ativo && r.status_aprovacao !== 'pendente').length || 0,
    admins: representantes?.filter(r => r.role === 'admin').length || 0,
  };

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          </div>
          <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center`}>
            <Icon className={`w-7 h-7 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loadingRepresentantes) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500">Visão geral do sistema</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total de Representantes"
            value={stats.totalRepresentantes}
            icon={Users}
            color="text-[#1e3a5f]"
            bgColor="bg-[#1e3a5f]/10"
          />
          <StatCard
            title="Ativos/Aprovados"
            value={stats.ativos}
            icon={CheckCircle}
            color="text-emerald-600"
            bgColor="bg-emerald-100"
          />
          <StatCard
            title="Pendentes"
            value={stats.pendentes}
            icon={Clock}
            color="text-amber-600"
            bgColor="bg-amber-100"
          />
          <StatCard
            title="Inativos"
            value={stats.inativos}
            icon={AlertTriangle}
            color="text-red-600"
            bgColor="bg-red-100"
          />
        </div>

        {/* Admins Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#d4af37]" />
                Administradores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-800">
                {stats.admins}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Usuários com permissão de admin
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                Taxa de Aprovação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-gray-800">
                {stats.totalRepresentantes > 0 
                  ? ((stats.ativos / stats.totalRepresentantes) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {stats.ativos} de {stats.totalRepresentantes} aprovados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Resumo por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-700">{stats.ativos}</p>
                  <p className="text-sm text-emerald-600">Ativos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
                <Clock className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-700">{stats.pendentes}</p>
                  <p className="text-sm text-amber-600">Pendentes</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700">{stats.inativos}</p>
                  <p className="text-sm text-red-600">Inativos</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-100 rounded-xl">
                <Shield className="w-8 h-8 text-gray-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-700">{stats.admins}</p>
                  <p className="text-sm text-gray-600">Admins</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}