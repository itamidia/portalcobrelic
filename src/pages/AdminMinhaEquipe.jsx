import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '../components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Shield,
  Users,
  Search
} from 'lucide-react';

export default function AdminMinhaEquipe() {
  const [searchMunicipal, setSearchMunicipal] = useState('');
  const [searchLider, setSearchLider] = useState('');
  const { representante: representanteAtual } = useAuth();

  const isPresidenteEstadual = representanteAtual?.cargo === 'Presidente Estadual' && representanteAtual?.ativo;

  // Buscar Presidentes Municipais do estado
  const { data: municipais = [], isLoading: loadingMunicipais } = useQuery({
    queryKey: ['presidentes-municipais', representanteAtual?.estado],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('representantes')
        .select('*')
        .eq('cargo', 'Presidente Municipal')
        .eq('estado', representanteAtual.estado)
        .eq('ativo', true)
        .order('cidade', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: isPresidenteEstadual && !!representanteAtual?.estado,
  });

  // Buscar Líderes Comunitários do estado
  const { data: lideres = [], isLoading: loadingLideres } = useQuery({
    queryKey: ['lideres-comunitarios', representanteAtual?.estado],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('representantes')
        .select('*')
        .eq('cargo', 'Líder Comunitário')
        .eq('estado', representanteAtual.estado)
        .eq('ativo', true)
        .order('cidade', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: isPresidenteEstadual && !!representanteAtual?.estado,
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

  const municipaisFiltrados = municipais.filter(m => 
    !searchMunicipal || 
    m.nome?.toLowerCase().includes(searchMunicipal.toLowerCase()) ||
    m.cidade?.toLowerCase().includes(searchMunicipal.toLowerCase())
  );

  const lideresFiltrados = lideres.filter(l => 
    !searchLider || 
    l.nome?.toLowerCase().includes(searchLider.toLowerCase()) ||
    l.cidade?.toLowerCase().includes(searchLider.toLowerCase())
  );

  const renderRepresentanteCard = (rep) => (
    <Card key={rep.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
            <Shield className="w-6 h-6 text-[#1e3a5f]" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 mb-1">{rep.nome}</h3>
            <Badge className={
              rep.cargo === 'Presidente Municipal' 
                ? 'bg-[#1e3a5f] text-white' 
                : 'bg-emerald-600 text-white'
            }>
              {rep.cargo}
            </Badge>
            
            <div className="grid grid-cols-1 gap-2 text-sm mt-3">
              {rep.cpf && (
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">CPF: {formatCPF(rep.cpf)}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{formatPhone(rep.telefone)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{rep.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{rep.cidade} - {rep.estado}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (!isPresidenteEstadual) {
    return (
      <AdminLayout currentPage="AdminMinhaEquipe">
        <div className="p-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="py-16 text-center">
              <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                Acesso Restrito
              </h3>
              <p className="text-gray-500">
                Esta página é acessível apenas para Presidentes Estaduais.
              </p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout currentPage="AdminMinhaEquipe">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Minha Equipe</h1>
          <p className="text-gray-500">Representantes do Estado de {representanteAtual?.estado}</p>
        </div>

        <Tabs defaultValue="municipais" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="municipais">
              Presidentes Municipais ({municipais.length})
            </TabsTrigger>
            <TabsTrigger value="lideres">
              Líderes Comunitários ({lideres.length})
            </TabsTrigger>
          </TabsList>

          {/* Presidentes Municipais */}
          <TabsContent value="municipais" className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou cidade..."
                value={searchMunicipal}
                onChange={(e) => setSearchMunicipal(e.target.value)}
                className="pl-10"
              />
            </div>

            {loadingMunicipais ? (
              <div className="grid gap-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : municipaisFiltrados.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchMunicipal 
                      ? 'Nenhum resultado encontrado' 
                      : 'Nenhum Presidente Municipal no seu estado'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {municipaisFiltrados.map(renderRepresentanteCard)}
              </div>
            )}
          </TabsContent>

          {/* Líderes Comunitários */}
          <TabsContent value="lideres" className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou cidade..."
                value={searchLider}
                onChange={(e) => setSearchLider(e.target.value)}
                className="pl-10"
              />
            </div>

            {loadingLideres ? (
              <div className="grid gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <Skeleton key={i} className="h-40 rounded-xl" />
                ))}
              </div>
            ) : lideresFiltrados.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">
                    {searchLider 
                      ? 'Nenhum resultado encontrado' 
                      : 'Nenhum Líder Comunitário no seu estado'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lideresFiltrados.map(renderRepresentanteCard)}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}