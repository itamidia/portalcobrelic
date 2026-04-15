import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Check, Loader2, Upload, User } from 'lucide-react';
import { toast } from 'sonner';

CadastroDiretoria.public = true;

export default function CadastroDiretoria() {
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    telefone: '',
    email: '',
    estado: '',
    cidade: '',
    cargo: '',
    foto_url: '',
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
          setFormData(prev => ({ ...prev, email: userData.email }));
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const validateCPF = (cpf) => {
    cpf = cpf.replace(/[^\d]/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1+$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf.charAt(i)) * (10 - i);
    }
    let rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf.charAt(i)) * (11 - i);
    }
    rev = 11 - (sum % 11);
    if (rev === 10 || rev === 11) rev = 0;
    if (rev !== parseInt(cpf.charAt(10))) return false;

    return true;
  };

  const formatCPF = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14);
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, foto_url: file_url });
      toast.success('Foto enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar foto');
    } finally {
      setUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Check if user already has a Representante
      const existingUser = await base44.entities.Representante.filter({ user_id: user.id });
      if (existingUser.length > 0) {
        throw new Error('Você já possui um cadastro como membro da diretoria');
      }

      // Verifica se CPF já existe
      const existing = await base44.entities.Representante.filter({ cpf: data.cpf.replace(/\D/g, '') });
      if (existing.length > 0) {
        throw new Error('CPF já cadastrado');
      }

      return base44.entities.Representante.create({
        nome: data.nome,
        cpf: data.cpf.replace(/\D/g, ''),
        telefone: data.telefone.replace(/\D/g, ''),
        email: data.email,
        cidade: data.cidade,
        estado: data.estado,
        cargo: data.cargo,
        foto_url: data.foto_url || '',
        ativo: true,
        user_id: user.id,
      });
    },
    onSuccess: () => {
      toast.success('Cadastro realizado com sucesso!');
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    },
    onError: (error) => {
      toast.error(error.message || 'Erro ao realizar cadastro');
    },
  });

  const handleSubmit = () => {
    if (!user) {
      toast.error('Você precisa estar logado para se cadastrar');
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    if (!formData.nome || !formData.cpf || !formData.telefone || !formData.email || !formData.cargo) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (!validateCPF(formData.cpf)) {
      toast.error('CPF inválido');
      return;
    }
    if (!formData.estado || !formData.cidade) {
      toast.error('Selecione o estado e a cidade');
      return;
    }
    createMutation.mutate(formData);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#152a45] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1e3a5f] to-[#152a45]">
      {/* Header */}
      <div className="pt-8 pb-6 px-4 text-center">
        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Shield className="w-9 h-9 text-[#d4af37]" />
        </div>
        <h1 className="text-white text-2xl font-bold">COBRENC</h1>
        <p className="text-white/60 text-sm mt-1">Cadastro de Diretoria</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Cadastro de Membro da Diretoria</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Cargo */}
            <div>
              <Label>Cargo *</Label>
              <Select value={formData.cargo} onValueChange={(value) => setFormData({ ...formData, cargo: value })}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione o cargo" />
                </SelectTrigger>
                <SelectContent position="popper" side="bottom" align="start" sideOffset={4}>
                  <SelectItem value="Vice Presidente">Vice Presidente</SelectItem>
                  <SelectItem value="Secretário">Secretário</SelectItem>
                  <SelectItem value="Diretor Financeiro">Diretor Financeiro</SelectItem>
                  <SelectItem value="Diretor de Articulação">Diretor de Articulação</SelectItem>
                  <SelectItem value="Diretor Social">Diretor Social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1e3a5f] border-b pb-2">Dados Pessoais</h3>

              {/* Foto */}
              <div>
                <Label>Foto (opcional)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                    {formData.foto_url ? (
                      <img src={formData.foto_url} alt="Foto" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="foto" className="cursor-pointer">
                      <div className="flex items-center gap-2 text-[#1e3a5f] hover:underline">
                        <Upload className="w-4 h-4" />
                        {uploading ? 'Enviando...' : 'Carregar foto'}
                      </div>
                    </Label>
                    <Input
                      id="foto"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={uploading}
                    />
                    <p className="text-xs text-gray-500 mt-1">Recomendado: foto profissional</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Seu nome completo"
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>CPF *</Label>
                  <Input
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    className="mt-1"
                    maxLength={14}
                  />
                </div>

                <div>
                  <Label>Telefone/WhatsApp *</Label>
                  <Input
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    className="mt-1"
                    maxLength={15}
                  />
                </div>
              </div>

              <div>
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="mt-1"
                  readOnly={!!user}
                />
                {user && <p className="text-xs text-gray-500 mt-1">E-mail vinculado à sua conta</p>}
              </div>
            </div>

            {/* Localização */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1e3a5f] border-b pb-2">Localização</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label>Cidade *</Label>
                  <Input
                    value={formData.cidade}
                    onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                    placeholder="Cidade"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Estado *</Label>
                  <Input
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value.toUpperCase() })}
                    placeholder="UF"
                    className="mt-1"
                    maxLength={2}
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Importante:</strong> Você será cadastrado como membro da diretoria municipal de {formData.cidade || 'sua cidade'}. 
                Seu perfil aparecerá na página da cidade no portal ANALC.
              </p>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending}
                className="w-full bg-[#1e3a5f] hover:bg-[#152a45] h-12"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Finalizar Cadastro
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}