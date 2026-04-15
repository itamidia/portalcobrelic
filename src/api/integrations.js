import { Functions, storage, supabase } from './supabaseApi';

// Core functions - usando Edge Functions do Supabase
export const Core = {
  // Funções de pagamento Asaas
  InvokeLLM: null, // Não implementado - usar API direta se necessário
  SendEmail: null, // Não implementado - usar serviço externo (Resend, SendGrid)
  SendSMS: null,   // Não implementado - usar Twilio ou similar
  UploadFile: storage.upload,
  GenerateImage: null, // Não implementado - usar API externa
  ExtractDataFromUploadedFile: null, // Não implementado
};

// Re-exportar Functions
export { Functions };

// Upload usando Supabase Storage
export const UploadFile = async (file, bucket = 'uploads', path) => {
  const fileName = path || `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(data.path);
    
  return { url: publicUrl, path: data.path };
};






