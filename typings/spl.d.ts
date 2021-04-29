
interface SuggestionItem {
  label: string
  tag: '关键词' | '函数' | '字段' | '通用' | '符号' | '算子' | '逻辑' | '字段值'
  mapping: string
  code: string
  syntax?: string
  description?: string
  example?: string
}

