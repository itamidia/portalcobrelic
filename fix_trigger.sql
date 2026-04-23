-- Diagnóstico e correção da trigger
-- Execute no SQL Editor do Supabase

-- 1. Verificar se a trigger existe
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'trg_criar_associado_pagamento';

-- 2. Verificar a função
SELECT * FROM pg_proc WHERE proname = 'criar_associado_e_pagamento';

-- 3. Remover trigger antiga se existir com problemas
DROP TRIGGER IF EXISTS trg_criar_associado_pagamento ON representantes;

-- 4. Remover função antiga
DROP FUNCTION IF EXISTS criar_associado_e_pagamento();

-- 5. Recriar função com logs e tratamento de erro
CREATE OR REPLACE FUNCTION criar_associado_e_pagamento()
RETURNS TRIGGER AS $$
DECLARE
  v_plano_id UUID;
  v_plano_valor DECIMAL(10,2);
  v_associado_id UUID;
  v_data_vencimento DATE;
BEGIN
  -- Log para debug
  RAISE NOTICE 'Trigger chamada - OLD.status: %, NEW.status: %', OLD.status_aprovacao, NEW.status_aprovacao;
  
  -- Só executa quando mudar de 'pendente' para 'aprovado'
  IF NEW.status_aprovacao = 'aprovado' AND (OLD.status_aprovacao IS NULL OR OLD.status_aprovacao = 'pendente') THEN
    
    RAISE NOTICE 'Condição satisfeita - criando associado';
    
    -- Buscar o plano padrão (primeiro ativo)
    SELECT id, valor INTO v_plano_id, v_plano_valor
    FROM planos 
    WHERE ativo = true 
    ORDER BY ordem 
    LIMIT 1;
    
    RAISE NOTICE 'Plano encontrado: %, valor: %', v_plano_id, v_plano_valor;
    
    -- Se não encontrar plano, usar valores padrão
    IF v_plano_id IS NULL THEN
      v_plano_valor := 30.00;
      RAISE NOTICE 'Usando valor padrão: 30.00';
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
    
    RAISE NOTICE 'Associado criado com ID: %', v_associado_id;
    
    -- Calcular data de vencimento (dia 5 do próximo mês)
    v_data_vencimento := DATE_TRUNC('month', CURRENT_DATE + INTERVAL '1 month') + INTERVAL '4 days';
    
    RAISE NOTICE 'Data vencimento: %', v_data_vencimento;
    
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
    
    RAISE NOTICE 'Pagamento criado com sucesso';
    
  ELSE
    RAISE NOTICE 'Condição NÃO satisfeita - OLD: %, NEW: %', OLD.status_aprovacao, NEW.status_aprovacao;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'ERRO na trigger: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger novamente
CREATE TRIGGER trg_criar_associado_pagamento
  AFTER UPDATE OF status_aprovacao ON representantes
  FOR EACH ROW
  EXECUTE FUNCTION criar_associado_e_pagamento();

-- 7. Verificar se foi criada
SELECT trigger_name, event_manipulation, action_timing 
FROM information_schema.triggers 
WHERE trigger_name = 'trg_criar_associado_pagamento';
