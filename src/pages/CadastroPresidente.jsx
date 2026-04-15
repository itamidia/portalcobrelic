import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Check, Loader2, Upload, User } from 'lucide-react';
import { toast } from 'sonner';

CadastroPresidente.public = true;

export default function CadastroPresidente() {
  const { user, isAuthenticated, loading: checkingAuth } = useAuth();
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
    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

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
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `presidentes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('fotos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, foto_url: publicUrl });
      toast.success('Foto enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar foto: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Check if user already has a Representante
      const { data: existingUser, error: errorExisting } = await supabase
        .from('representantes')
        .select('*')
        .eq('user_id', user.id);
      if (errorExisting) throw errorExisting;
      if (existingUser && existingUser.length > 0) {
        throw new Error('Você já possui um cadastro como representante');
      }

      // Verifica se CPF já existe
      const { data: existing, error: errorCPF } = await supabase
        .from('representantes')
        .select('*')
        .eq('cpf', data.cpf.replace(/\D/g, ''));
      if (errorCPF) throw errorCPF;
      if (existing && existing.length > 0) {
        throw new Error('CPF já cadastrado');
      }

      const { error } = await supabase.from('representantes').insert([{
        nome: data.nome,
        cpf: data.cpf.replace(/\D/g, ''),
        telefone: data.telefone.replace(/\D/g, ''),
        email: data.email,
        cidade: data.cidade,
        estado: data.estado,
        cargo: data.cargo,
        foto_url: data.foto_url || '',
        ativo: false,
        user_id: user.id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Cadastro enviado para aprovação!');
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
      window.location.href = '/login';
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
        <p className="text-white/60 text-sm mt-1">Cadastro de Presidente</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Solicitação de Cadastro</CardTitle>
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
                  <SelectItem value="Presidente Estadual">Presidente Estadual</SelectItem>
                  <SelectItem value="Presidente Municipal">Presidente Municipal</SelectItem>
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
                <strong>Importante:</strong> Seu cadastro será enviado para aprovação. 
                {formData.cargo === 'Presidente Estadual' && ' O Presidente Nacional aprovará sua solicitação.'}
                {formData.cargo === 'Presidente Municipal' && ' O Presidente Estadual do seu estado aprovará sua solicitação.'}
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
                    Enviar Cadastro
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