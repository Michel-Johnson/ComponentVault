-- 添加 specifications 字段到 components 表
-- 这个字段用于存储不同类别元件的特定参数（如电容的容值、耐压等）

ALTER TABLE components 
ADD COLUMN IF NOT EXISTS specifications JSONB;

-- 添加注释
COMMENT ON COLUMN components.specifications IS '元件特定参数（JSON格式）：电容-封装/容值/误差/耐压，电阻-封装/阻值/误差/功率等';

-- 创建索引以提高查询性能（可选）
CREATE INDEX IF NOT EXISTS idx_components_specifications ON components USING GIN (specifications);
