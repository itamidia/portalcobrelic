import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Check, X, Pencil, Trash2, Upload, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminDiretoria() {
  const queryClient = useQueryClient();
  const [editingMember, setEditingMember] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { user: authUser, representante: currentRep, loading: loadingUser } = useAuth();

  // Only Presidente Municipal can access
  const isPresidenteMunicipal = currentRep?.cargo === 'Presidente Municipal' || currentRep?.cargo === 'admin';

  // Fetch all diretoria members from the same city
  const { data: diretoriaMembers = [], isLoading } = useQuery({
    queryKey: ['diretoriaMembers', currentRep?.cidade, currentRep?.estado],
    queryFn: async () => {
      const { data: members, error } = await supabase
        .from('representantes')
        .select('*')
        .eq('cidade', currentRep.cidade)
        .eq('estado', currentRep.estado);
      if (error) throw error;
      // Filter only diretoria positions
      const cargos = ['Vice Presidente', 'Secretário', 'Diretor Financeiro', 'Diretor de Articulação', 'Diretor Social'];
      return (members || []).filter(m => cargos.includes(m.cargo));
    },
    enabled: !!currentRep && isPresidenteMunicipal,
  });

  // Mutations
  const activateMutation = useMutation({
    mutationFn: async ({ id, ativo }) => {
      const { error } = await supabase
        .from('representantes')
        .update({ ativo })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diretoriaMembers'] });
      toast.success('Status atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar status: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const { error } = await supabase
        .from('representantes')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diretoriaMembers'] });
      setShowDialog(false);
      setEditingMember(null);
      toast.success('Membro atualizado com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao atualizar: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('representantes')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diretoriaMembers'] });
      toast.success('Membro excluído com sucesso');
    },
    onError: (error) => {
      toast.error('Erro ao excluir: ' + error.message);
    },
  });

  const handleEdit = (member) => {
    setEditingMember({
      ...member,
      cpf: formatCPF(member.cpf),
      telefone: formatPhone(member.telefone),
    });
    setShowDialog(true);
  };

  const handleSave = () => {
    if (!editingMember.nome || !editingMember.cpf || !editingMember.telefone || !editingMember.email) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    updateMutation.mutate({
      id: editingMember.id,
      data: {
        nome: editingMember.nome,
        cpf: editingMember.cpf.replace(/\D/g, ''),
        telefone: editingMember.telefone.replace(/\D/g, ''),
        email: editingMember.email,
        cargo: editingMember.cargo,
        foto_url: editingMember.foto_url || '',
        descricao: editingMember.descricao || '',
      },
    });
  };

  const handleDelete = (id) => {
    if (confirm('Tem certeza que deseja excluir este membro?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `diretoria/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('fotos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('fotos')
        .getPublicUrl(filePath);

      setEditingMember({ ...editingMember, foto_url: publicUrl });
      toast.success('Foto enviada com sucesso!');
    } catch (error) {
      toast.error('Erro ao enviar foto: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const formatCPF = (value) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4').slice(0, 14);
  };

  const formatPhone = (value) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3').slice(0, 15);
  };

  if (!isPresidenteMunicipal) {
    return (
      <AdminLayout>
        <div className="p-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">Acesso restrito a Presidentes Municipais</p>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1e3a5f]">Gerenciar Diretoria</h1>
          <p className="text-gray-600 mt-1">
            Membros da diretoria de {currentRep?.cidade}/{currentRep?.estado}
          </p>
        </div>

        {diretoriaMembers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-600">Nenhum cadastro de diretoria pendente</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {diretoriaMembers.map((member) => (
              <Card key={member.id} className="border-l-4 border-l-[#1e3a5f]">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      {member.foto_url ? (
                        <img
                          src={member.foto_url}
                          alt={member.nome}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{member.nome}</h3>
                          <Badge className={member.ativo ? 'bg-green-500' : 'bg-yellow-500'}>
                            {member.ativo ? 'Ativo' : 'Pendente'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Cargo:</strong> {member.cargo}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>CPF:</strong> {formatCPF(member.cpf)}
                        </p>
                        <p className="text-sm text-gray-600 mb-1">
                          <strong>Telefone:</strong> {formatPhone(member.telefone)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>E-mail:</strong> {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {!member.ativo ? (
                        <Button
                          size="sm"
                          onClick={() => activateMutation.mutate({ id: member.id, ativo: true })}
                          className="bg-green-600 hover:bg-green-700"
                          disabled={activateMutation.isPending}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Ativar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => activateMutation.mutate({ id: member.id, ativo: false })}
                          disabled={activateMutation.isPending}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Desativar
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(member)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(member.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Membro da Diretoria</DialogTitle>
            </DialogHeader>
            {editingMember && (
              <div className="space-y-4">
                <div>
                  <Label>Foto</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                      {editingMember.foto_url ? (
                        <img src={editingMember.foto_url} alt="Foto" className="w-full h-full object-cover" />
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
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Nome Completo *</Label>
                  <Input
                    value={editingMember.nome}
                    onChange={(e) => setEditingMember({ ...editingMember, nome: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Cargo *</Label>
                  <Select
                    value={editingMember.cargo}
                    onValueChange={(value) => setEditingMember({ ...editingMember, cargo: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vice Presidente">Vice Presidente</SelectItem>
                      <SelectItem value="Secretário">Secretário</SelectItem>
                      <SelectItem value="Diretor Financeiro">Diretor Financeiro</SelectItem>
                      <SelectItem value="Diretor de Articulação">Diretor de Articulação</SelectItem>
                      <SelectItem value="Diretor Social">Diretor Social</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>CPF *</Label>
                    <Input
                      value={editingMember.cpf}
                      onChange={(e) => setEditingMember({ ...editingMember, cpf: formatCPF(e.target.value) })}
                      maxLength={14}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Telefone *</Label>
                    <Input
                      value={editingMember.telefone}
                      onChange={(e) => setEditingMember({ ...editingMember, telefone: formatPhone(e.target.value) })}
                      maxLength={15}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    value={editingMember.email}
                    onChange={(e) => setEditingMember({ ...editingMember, email: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Descrição / Mini Bio</Label>
                  <Input
                    value={editingMember.descricao || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, descricao: e.target.value })}
                    placeholder="Breve descrição sobre o membro"
                    className="mt-1"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setShowDialog(false)}>
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                    className="bg-[#1e3a5f] hover:bg-[#152a45]"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Salvar'
                    )}
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