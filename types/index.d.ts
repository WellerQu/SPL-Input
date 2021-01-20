
type ProxyEventHandler<T> = (e: T) => T

interface CompletionItem {
  id: string;
  label: string;
  tagName: '关键词' | '符号' | '数字' | '字段' | '函数' | '逻辑' | '算子';
  desc?: string;
  filterable?: boolean;
}
