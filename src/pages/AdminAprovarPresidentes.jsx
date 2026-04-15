import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '../components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Clock,
  UserCheck,
  Loader2,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function AdminAprovarPresidentes() {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [representanteAtual, setRepresentanteAtual] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Busca o representante atual
      const allReps = await base44.entities.Representante.list();
      const foundRep = allReps.find(rep => rep.email === userData.email);
      setRepresentanteAtual(foundRep);
    };
    loadUser();
  }, []);

  const isPresidenteNacional = user?.role === 'admin';
  const isPresidenteEstadual = representanteAtual?.cargo === 'Presidente Estadual' && representanteAtual?.ativo;

  // Buscar Presidentes Estaduais pendentes (para Presidente Nacional)
  const { data: estaduaisPendentes = [], isLoading: loadingEstaduais } = useQuery({
    queryKey: ['presidentes-estaduais-pendentes'],
    queryFn: async () => {
      const all = await base44.entities.Representante.filter({ 
        cargo: 'Presidente Estadual',
        ativo: false 
      }, '-created_date');
      return all;
    },
    enabled: isPresidenteNacional,
  });

  // Buscar Presidentes Municipais pendentes (para Presidente Estadual)
  const { data: municipaisPendentes = [], isLoading: loadingMunicipais } = useQuery({
    queryKey: ['presidentes-municipais-pendentes', representanteAtual?.estado],
    queryFn: async () => {
      const all = await base44.entities.Representante.filter({ 
        cargo: 'Presidente Municipal',
        estado: representanteAtual.estado,
        ativo: false 
      }, '-created_date');
      return all;
    },
    enabled: isPresidenteEstadual && !!representanteAtual?.estado,
  });

  // Mutation para aprovar
  const aprovarMutation = useMutation({
    mutationFn: (id) => base44.entities.Representante.update(id, { ativo: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presidentes-estaduais-pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['presidentes-municipais-pendentes'] });
      toast.success('Presidente aprovado com sucesso!');
    },
    onError: () => toast.error('Erro ao aprovar cadastro'),
  });

  // Mutation para rejeitar
  const rejeitarMutation = useMutation({
    mutationFn: (id) => base44.entities.Representante.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['presidentes-estaduais-pendentes'] });
      queryClient.invalidateQueries({ queryKey: ['presidentes-municipais-pendentes'] });
      toast.success('Cadastro rejeitado!');
    },
    onError: () => toast.error('Erro ao rejeitar cadastro'),
  });

  const formatCPF = (cpf) => {
    if (!cpf) return '';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatPhone = (phone) => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length === 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  };

  const renderPresidenteCard = (presidente) => (
    <Card key={presidente.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Informações */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#1e3a5f]" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{presidente.nome}</h3>
                <Badge className="bg-[#d4af37] text-[#1e3a5f]">{presidente.cargo}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-2">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4 text-gray-400" />
                <span>CPF: {formatCPF(presidente.cpf)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{formatPhone(presidente.telefone)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                <span>{presidente.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{presidente.cidade} - {presidente.estado}</span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Cadastrado em {presidente.created_date ? format(new Date(presidente.created_date), 'dd/MM/yyyy HH:mm') : 'N/A'}
            </p>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => aprovarMutation.mutate(presidente.id)}
              disabled={aprovarMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {aprovarMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Aprovar
            </Button>
            <Button
              onClick={() => rejeitarMutation.mutate(presidente.id)}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Rejeitar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!isPresidenteNacional && !isPresidenteEstadual) {
    return (
      <AdminLayout currentPage="AdminAprovarPresidentes">
        <div className="p-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Acesso Restrito
              </h3>
              <p className="text-gray-500">
                Esta página é acessível apenas para Presidentes Nacionais e Estaduais.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="AdminAprovarPresidentes">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Aprovação de Presidentes</h1>
            <p className="text-gray-500">Gerencie as solicitações de cadastro</p>
          </div>
        </div>

        {isPresidenteNacional && (
          <Tabs defaultValue="estaduais" className="space-y-4">
            <TabsList>
              <TabsTrigger value="estaduais">
                Presidentes Estaduais
                {estaduaisPendentes.length > 0 && (
                  <Badge className="ml-2 bg-yellow-100 text-yellow-800">
                    {estaduaisPendentes.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="estaduais" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Presidentes Estaduais Pendentes</h2>
                <Badge className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">
                  <Clock className="w-4 h-4 mr-2" />
                  {estaduaisPendentes.length} pendentes
                </Badge>
              </div>

              {loadingEstaduais ? (
                <div className="grid gap-4">
                  {[1, 2].map(i => (
                    <Skeleton key={i} className="h-40 rounded-xl" />
                  ))}
                </div>
              ) : estaduaisPendentes.length === 0 ? (
                <Card className="border-0 shadow-sm">
                  <CardContent className="py-12 text-center">
                    <UserCheck className="w-12 h-12 text-green-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum Presidente Estadual pendente de aprovação</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {estaduaisPendentes.map(renderPresidenteCard)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}

        {/* Presidente Estadual - Aprovar Municipais */}
        {isPresidenteEstadual && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Presidentes Municipais Pendentes ({representanteAtual.estado})</h2>
              <Badge className="bg-yellow-100 text-yellow-800 text-lg px-4 py-2">
                <Clock className="w-4 h-4 mr-2" />
                {municipaisPendentes.length} pendentes
              </Badge>
            </div>

            {loadingMunicipais ? (
              <div className="grid gap-4">
                {[1, 2].map(i => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : municipaisPendentes.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <UserCheck className="w-12 h-12 text-green-300 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum Presidente Municipal pendente de aprovação</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {municipaisPendentes.map(renderPresidenteCard)}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}