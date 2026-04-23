-- Trigger: Ao aprovar representante, criar associado e primeiro pagamento automaticamente
-- Execute no SQL Editor do Supabase

-- ============================================
-- FUNÇÃO: Criar associado e pagamento ao aprovar
-- ============================================
CREATE OR REPLACE FUNCTION criar_associado_e_pagamento()
RETURNS TRIGGER AS $$
DECLARE
  v_plano_id UUID;
  v_plano_valor DECIMAL(10,2);
  v_associado_id UUID;
  v_data_vencimento DATE;
BEGIN
  -- Só executa quando mudar de 'pendente' para 'aprovado'
  IF NEW.status_aprovacao = 'aprovado' AND OLD.status_aprovacao = 'pendente' THEN
    
    -- Buscar o plano padrão (primeiro ativo)
    SELECT id, valor INTO v_plano_id, v_plano_valor
    FROM planos 
    WHERE ativo = true 
    ORDER BY ordem 
    LIMIT 1;
    
    -- Se não encontrar plano, usar valores padrão
    IF v_plano_id IS NULL THEN
      v_plano_valor := 30.00;
    END IF;
    
    -- Criar associado vinculado ao representante
    INSERT INTO associados (
      nome_completo,
      email,
      telefone,
      cpf,
      representante_id,
      status_aprovacao,
      status_assinatura,
      created_at,
      updated_at
    ) VALUES (
      NEW.nome,
      NEW.email,
      NEW.telefone,
      NEW.cpf,
      NEW.id,
      'aprovado',
      'ativo',
      NOW(),
      NOW()
    )
    RETURNING id INTO v_associado_id;
    
    -- Calcular data de vencimento (dia 5 do próximo mês)
    v_data_vencimento := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month') + INTERVAL '4 days';
    
    -- Criar primeiro pagamento/mensalidade
    INSERT INTO pagamentos (
      associado_id,
      plano_id,
      valor,
      status,
      data_vencimento,
      data_referencia,
      created_at
    ) VALUES (
      v_associado_id,
      v_plano_id,
      COALESCE(v_plano_valor, 30.00),
      'pendente',
      v_data_vencimento,
      DATE_TRUNC('month', CURRENT_DATE),
      NOW()
    );
    
    -- Atualizar o representante com o associado criado (opcional)
    -- NEW.associado_id := v_associado_id;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Executar ao atualizar representante
-- ============================================
DROP TRIGGER IF EXISTS trg_criar_associado_pagamento ON representantes;
CREATE TRIGGER trg_criar_associado_pagamento
  AFTER UPDATE OF status_aprovacao ON representantes
  FOR EACH ROW
  EXECUTE FUNCTION criar_associado_e_pagamento();

-- ============================================
-- VERIFICAÇÃO
-- ============================================
-- Listar triggers criadas
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers 
WHERE trigger_name = 'trg_criar_associado_pagamento';
