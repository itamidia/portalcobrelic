-- Adicionar colunas destaque e ordem à tabela video_clube existente
ALTER TABLE video_clube 
ADD COLUMN IF NOT EXISTS destaque BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- Criar índice para buscar vídeos em destaque rapidamente
CREATE INDEX IF NOT EXISTS idx_video_clube_destaque 
ON video_clube(destaque) 
WHERE destaque = TRUE;

-- Criar índice para ordenação
CREATE INDEX IF NOT EXISTS idx_video_clube_ordem 
ON video_clube(ordem);

-- Atualizar o vídeo existente para ter ordem 0
UPDATE video_clube SET ordem = 0 WHERE ordem IS NULL;
