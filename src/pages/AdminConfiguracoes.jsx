import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Wallet, 
  MessageCircle, 
  Mail, 
  Palette, 
  FileText,
  Save,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const defaultConfigs = {
  // ASAAS
  asaas_token: '',
  asaas_webhook_url: '',
  asaas_sandbox: 'false',
  
  // WhatsApp
  whatsapp_api_url: '',
  whatsapp_api_token: '',
  
  // Email
  smtp_host: '',
  smtp_port: '',
  smtp_user: '',
  smtp_password: '',
  smtp_from_email: '',
  smtp_from_name: '',
  
  // Appearance
  logo_url: '',
  primary_color: '#1e3a5f',
  secondary_color: '#d4af37',
  
  // Institutional
  about_text: 'A ANALC — Associação Nacional de Apoio Legal e Comunitário — existe para garantir apoio, assistência e benefícios sociais acessíveis para famílias de todo o Brasil. Nosso compromisso é oferecer soluções práticas, seguras e acessíveis para melhorar a qualidade de vida dos nossos associados.',
  terms_text: '',
  privacy_text: '',
};

export default function AdminConfiguracoes() {
  const [configs, setConfigs] = useState(defaultConfigs);
  const [showTokens, setShowTokens] = useState({});
  const [user, setUser] = useState(null);
  const [userRepresentante, setUserRepresentante] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const queryClient = useQueryClient();

  // Carrega usuário logado e verifica se é representante
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await base44.auth.me();
        setUser(userData);
        
        const allReps = await base44.entities.Representante.list();
        const foundRep = allReps.find(rep => rep.email === userData.email);
        setUserRepresentante(foundRep || null);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  const { data: savedConfigs, isLoading } = useQuery({
    queryKey: ['admin-configuracoes'],
    queryFn: () => base44.entities.Configuracao.list(),
  });

  useEffect(() => {
    if (savedConfigs) {
      const configMap = {};
      savedConfigs.forEach(c => {
        configMap[c.chave] = c.valor;
      });
      setConfigs({ ...defaultConfigs, ...configMap });
    }
  }, [savedConfigs]);

  const saveMutation = useMutation({
    mutationFn: async (newConfigs) => {
      // Update or create each config
      for (const [chave, valor] of Object.entries(newConfigs)) {
        const existing = savedConfigs?.find(c => c.chave === chave);
        if (existing) {
          await base44.entities.Configuracao.update(existing.id, { valor });
        } else {
          await base44.entities.Configuracao.create({ 
            chave, 
            valor,
            tipo: chave.includes('color') ? 'cor' : 
                  chave.includes('url') ? 'url' :
                  chave.includes('token') || chave.includes('password') ? 'token' : 'texto',
            categoria: chave.startsWith('asaas') ? 'asaas' :
                       chave.startsWith('whatsapp') ? 'whatsapp' :
                       chave.startsWith('smtp') ? 'email' :
                       chave.includes('color') || chave.includes('logo') ? 'aparencia' : 'institucional'
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-configuracoes']);
      toast.success('Configurações salvas com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao salvar configurações');
    },
  });

  const handleSave = () => {
    saveMutation.mutate(configs);
  };

  const toggleShowToken = (key) => {
    setShowTokens(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const InputWithToggle = ({ label, configKey, placeholder }) => (
    <div>
      <Label>{label}</Label>
      <div className="relative mt-1">
        <Input
          type={showTokens[configKey] ? 'text' : 'password'}
          value={configs[configKey] || ''}
          onChange={(e) => setConfigs({ ...configs, [configKey]: e.target.value })}
          placeholder={placeholder}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => toggleShowToken(configKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showTokens[configKey] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  // Verifica se é admin puro (sem ser representante)
  const isAdminPuro = user?.role === 'admin' && !userRepresentante;
  const bloqueiaAparenciaInstitucional = !isAdminPuro;

  if (isLoading || loadingUser) {
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
            <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
            <p className="text-gray-500">Gerencie as configurações do sistema</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="bg-[#1e3a5f]"
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar Configurações
          </Button>
        </div>

        <Tabs defaultValue="asaas">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="asaas" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              ASAAS
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              E-mail
            </TabsTrigger>
            <TabsTrigger value="aparencia" className="flex items-center gap-2" disabled={bloqueiaAparenciaInstitucional}>
              <Palette className="w-4 h-4" />
              Aparência
            </TabsTrigger>
            <TabsTrigger value="institucional" className="flex items-center gap-2" disabled={bloqueiaAparenciaInstitucional}>
              <FileText className="w-4 h-4" />
              Institucional
            </TabsTrigger>
          </TabsList>

          {/* ASAAS */}
          <TabsContent value="asaas">
            <Card>
              <CardHeader>
                <CardTitle>Configurações ASAAS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <InputWithToggle
                  label="Token API ASAAS"
                  configKey="asaas_token"
                  placeholder="$aact_..."
                />
                <div>
                  <Label>Webhook URL</Label>
                  <Input
                    value={configs.asaas_webhook_url || ''}
                    onChange={(e) => setConfigs({ ...configs, asaas_webhook_url: e.target.value })}
                    placeholder="https://seu-dominio.com/webhook/asaas"
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Configure este URL no painel ASAAS para receber notificações de pagamento
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* WhatsApp */}
          <TabsContent value="whatsapp">
            <Card>
              <CardHeader>
                <CardTitle>Configurações WhatsApp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>URL da API</Label>
                  <Input
                    value={configs.whatsapp_api_url || ''}
                    onChange={(e) => setConfigs({ ...configs, whatsapp_api_url: e.target.value })}
                    placeholder="https://api.whatsapp.com/..."
                    className="mt-1"
                  />
                </div>
                <InputWithToggle
                  label="Token da API"
                  configKey="whatsapp_api_token"
                  placeholder="Token de autenticação"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Email */}
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Configurações SMTP</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Host SMTP</Label>
                    <Input
                      value={configs.smtp_host || ''}
                      onChange={(e) => setConfigs({ ...configs, smtp_host: e.target.value })}
                      placeholder="smtp.gmail.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Porta</Label>
                    <Input
                      value={configs.smtp_port || ''}
                      onChange={(e) => setConfigs({ ...configs, smtp_port: e.target.value })}
                      placeholder="587"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label>Usuário</Label>
                  <Input
                    value={configs.smtp_user || ''}
                    onChange={(e) => setConfigs({ ...configs, smtp_user: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="mt-1"
                  />
                </div>
                <InputWithToggle
                  label="Senha"
                  configKey="smtp_password"
                  placeholder="Senha do SMTP"
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>E-mail de Envio</Label>
                    <Input
                      value={configs.smtp_from_email || ''}
                      onChange={(e) => setConfigs({ ...configs, smtp_from_email: e.target.value })}
                      placeholder="noreply@analc.org.br"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Nome do Remetente</Label>
                    <Input
                      value={configs.smtp_from_name || ''}
                      onChange={(e) => setConfigs({ ...configs, smtp_from_name: e.target.value })}
                      placeholder="ANALC"
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="aparencia">
            <Card>
              <CardHeader>
                <CardTitle>Aparência do App</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bloqueiaAparenciaInstitucional && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-amber-800 text-sm">
                      🔒 Apenas a Matriz Nacional pode editar configurações de aparência.
                    </p>
                  </div>
                )}
                <div>
                  <Label>URL do Logo</Label>
                  <Input
                    value={configs.logo_url || ''}
                    onChange={(e) => setConfigs({ ...configs, logo_url: e.target.value })}
                    placeholder="https://..."
                    className="mt-1"
                    disabled={bloqueiaAparenciaInstitucional}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cor Primária</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={configs.primary_color || '#1e3a5f'}
                        onChange={(e) => setConfigs({ ...configs, primary_color: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                        disabled={bloqueiaAparenciaInstitucional}
                      />
                      <Input
                        value={configs.primary_color || ''}
                        onChange={(e) => setConfigs({ ...configs, primary_color: e.target.value })}
                        placeholder="#1e3a5f"
                        disabled={bloqueiaAparenciaInstitucional}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Cor Secundária (Dourado)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        type="color"
                        value={configs.secondary_color || '#d4af37'}
                        onChange={(e) => setConfigs({ ...configs, secondary_color: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                        disabled={bloqueiaAparenciaInstitucional}
                      />
                      <Input
                        value={configs.secondary_color || ''}
                        onChange={(e) => setConfigs({ ...configs, secondary_color: e.target.value })}
                        placeholder="#d4af37"
                        disabled={bloqueiaAparenciaInstitucional}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Institutional */}
          <TabsContent value="institucional">
            <Card>
              <CardHeader>
                <CardTitle>Textos Institucionais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {bloqueiaAparenciaInstitucional && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <p className="text-amber-800 text-sm">
                      🔒 Apenas a Matriz Nacional pode editar textos institucionais.
                    </p>
                  </div>
                )}
                <div>
                  <Label>Sobre a ANALC</Label>
                  <Textarea
                    value={configs.about_text || ''}
                    onChange={(e) => setConfigs({ ...configs, about_text: e.target.value })}
                    className="mt-1"
                    rows={4}
                    disabled={bloqueiaAparenciaInstitucional}
                  />
                </div>
                <div>
                  <Label>Termos de Uso</Label>
                  <Textarea
                    value={configs.terms_text || ''}
                    onChange={(e) => setConfigs({ ...configs, terms_text: e.target.value })}
                    className="mt-1"
                    rows={4}
                    disabled={bloqueiaAparenciaInstitucional}
                  />
                </div>
                <div>
                  <Label>Política de Privacidade</Label>
                  <Textarea
                    value={configs.privacy_text || ''}
                    onChange={(e) => setConfigs({ ...configs, privacy_text: e.target.value })}
                    className="mt-1"
                    rows={4}
                    disabled={bloqueiaAparenciaInstitucional}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}