import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { supabase } from '@/api/supabaseApi';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowRight, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function Cadastro() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: checkingAuth } = useAuth();
  const [checkingCadastro, setCheckingCadastro] = useState(true);

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    email: '',
    cidade: '',
    estado: '',
    endereco: {
      cep: '',
      rua: '',
      numero: '',
      complemento: '',
      bairro: '',
    },
  });

  const [formErrors, setFormErrors] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    endereco: '',
    geral: '',
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, email: user.email }));
      // Verificar se já existe cadastro
      checkExistingCadastro();
    } else if (!checkingAuth) {
      // Se não está logado, redireciona para criar conta primeiro
      setCheckingCadastro(false);
    }
  }, [user, checkingAuth]);

  const checkExistingCadastro = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from('representantes')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (data) {
        toast.info('Você já possui um cadastro!');
        setTimeout(() => navigate('/Dashboard'), 2000);
      }
    } catch (e) {
      // Não existe cadastro, pode continuar
    } finally {
      setCheckingCadastro(false);
    }
  };

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

  const formatCEP = (value) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2').slice(0, 9);
  };

  const searchCEP = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            cidade: data.localidade || '',
            estado: data.uf || '',
            endereco: {
              ...prev.endereco,
              rua: data.logradouro || '',
              bairro: data.bairro || '',
            },
          }));
        }
      } catch (error) {
        console.log('Erro ao buscar CEP');
      }
    }
  };

  const createMutation = useMutation({
    mutationFn: async (data) => {
      // Check if user already has a Representante
      const { data: existingUser, error: err1 } = await supabase
        .from('representantes')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (existingUser) {
        throw new Error('Você já possui um cadastro como representante');
      }

      // Check if CPF already exists
      const { data: existing, error: err2 } = await supabase
        .from('representantes')
        .select('id')
        .eq('cpf', data.cpf.replace(/\D/g, ''))
        .single();
      if (existing) {
        throw new Error('CPF já cadastrado');
      }

      // Monta o endereço completo como string
      console.log('📋 Dados do endereço recebidos:', data.endereco);
      const enderecoCompleto = `${data.endereco.rua}, ${data.endereco.numero}${data.endereco.complemento ? ', ' + data.endereco.complemento : ''} - ${data.endereco.bairro} - CEP: ${data.endereco.cep}`;
      console.log('🏠 Endereço completo montado:', enderecoCompleto);

      const { data: novoRepresentante, error } = await supabase
        .from('representantes')
        .insert({
          nome: data.nome,
          cpf: data.cpf.replace(/\D/g, ''),
          data_nascimento: data.data_nascimento,
          telefone: data.telefone.replace(/\D/g, ''),
          email: data.email,
          cidade: data.cidade,
          estado: data.estado,
          endereco: enderecoCompleto,
          cep: data.endereco.cep.replace(/\D/g, ''),
          ativo: false,
          status_aprovacao: 'pendente',
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return novoRepresentante;
    },
    onSuccess: (data) => {
      console.log('✅ Cadastro sucesso:', data);
      toast.success('Cadastro realizado com sucesso!');
      // Redirecionar imediatamente para Dashboard
      navigate('/Dashboard');
    },
    onError: (error) => {
      console.error('❌ Erro no cadastro:', error);
      toast.error(error.message || 'Erro ao realizar cadastro');
    },
  });

  const clearErrors = () => {
    setFormErrors({
      nome: '',
      cpf: '',
      data_nascimento: '',
      telefone: '',
      endereco: '',
      geral: '',
    });
  };

  const handleSubmit = () => {
    console.log('🚀 handleSubmit chamado');
    clearErrors();
    
    if (!user) {
      setFormErrors(prev => ({ ...prev, geral: 'Você precisa fazer login primeiro para se cadastrar' }));
      toast.error('Você precisa fazer login primeiro para se cadastrar');
      setTimeout(() => {
        navigate('/Login');
      }, 2000);
      return;
    }
    
    const errors = {};
    
    if (!formData.nome) errors.nome = 'Nome é obrigatório';
    if (!formData.cpf) errors.cpf = 'CPF é obrigatório';
    if (!formData.data_nascimento) errors.data_nascimento = 'Data de nascimento é obrigatória';
    if (!formData.telefone) errors.telefone = 'Telefone é obrigatório';
    
    if (formData.cpf && !validateCPF(formData.cpf)) {
      errors.cpf = 'CPF inválido. Digite um CPF válido';
    }
    
    if (!formData.endereco?.cep || !formData.endereco?.rua || !formData.endereco?.numero || 
        !formData.cidade || !formData.estado) {
      errors.endereco = 'Preencha todos os campos de endereço (CEP, Rua, Número, Cidade, Estado)';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(prev => ({ ...prev, ...errors }));
      toast.error('Corrija os erros no formulário');
      return;
    }
    
    createMutation.mutate(formData);
  };

  if (checkingAuth || checkingCadastro) {
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
        <h1 className="text-white text-2xl font-bold">COBRELIC</h1>
        <p className="text-white/60 text-sm mt-1">Associação de Líder Comunitário</p>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg">Complete sua Associação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1e3a5f] border-b pb-2">Dados Pessoais</h3>

              <div>
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Seu nome completo"
                  className={`mt-1 ${formErrors.nome ? 'border-red-500' : ''}`}
                />
                {formErrors.nome && (
                  <p className="text-red-500 text-sm mt-1">{formErrors.nome}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>CPF *</Label>
                  <Input
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: formatCPF(e.target.value) })}
                    placeholder="000.000.000-00"
                    className={`mt-1 ${formErrors.cpf ? 'border-red-500' : ''}`}
                    maxLength={14}
                  />
                  {formErrors.cpf && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.cpf}</p>
                  )}
                </div>

                <div>
                  <Label>Data de Nascimento *</Label>
                  <Input
                    type="date"
                    value={formData.data_nascimento}
                    onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                    className={`mt-1 ${formErrors.data_nascimento ? 'border-red-500' : ''}`}
                  />
                  {formErrors.data_nascimento && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.data_nascimento}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Telefone/WhatsApp *</Label>
                  <Input
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: formatPhone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    className={`mt-1 ${formErrors.telefone ? 'border-red-500' : ''}`}
                    maxLength={15}
                  />
                  {formErrors.telefone && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.telefone}</p>
                  )}
                </div>

                <div>
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="mt-1 bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">E-mail vinculado à sua conta</p>
                </div>
              </div>
            </div>

            {/* Endereço */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1e3a5f] border-b pb-2">Endereço</h3>
              
              {formErrors.endereco && (
                <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{formErrors.endereco}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>CEP *</Label>
                  <Input
                    value={formData.endereco.cep}
                    onChange={(e) => {
                      const value = formatCEP(e.target.value);
                      setFormData({ 
                        ...formData, 
                        endereco: { ...formData.endereco, cep: value }
                      });
                      searchCEP(value);
                    }}
                    placeholder="00000-000"
                    className={`mt-1 ${formErrors.endereco ? 'border-red-500' : ''}`}
                    maxLength={9}
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Rua *</Label>
                  <Input
                    value={formData.endereco.rua}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      endereco: { ...formData.endereco, rua: e.target.value }
                    })}
                    placeholder="Nome da rua"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label>Número *</Label>
                  <Input
                    value={formData.endereco.numero}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      endereco: { ...formData.endereco, numero: e.target.value }
                    })}
                    placeholder="Nº"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label>Complemento</Label>
                  <Input
                    value={formData.endereco.complemento}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      endereco: { ...formData.endereco, complemento: e.target.value }
                    })}
                    placeholder="Apto, bloco..."
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Bairro</Label>
                <Input
                  value={formData.endereco.bairro}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    endereco: { ...formData.endereco, bairro: e.target.value }
                  })}
                  placeholder="Bairro"
                  className="mt-1"
                />
              </div>

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

            {formErrors.geral && (
              <p className="text-red-500 text-sm bg-red-50 p-3 rounded border border-red-200">{formErrors.geral}</p>
            )}

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
                    Finalizar Associação
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