import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import Input from 'antd/lib/input';

import { QueryCompletionProvider } from './QueryCompletionProvider';

import {
  useSyntaxSuggestions,
  DistinctField,
} from './hooks/useSyntaxSuggestions';

export interface QueryInputProps {
  fieldOptionItems: DistinctField[];
  value?: string;
  loading?: boolean;
  onQueryChange?: (query: string) => void;
  onQueryEnter?: () => void;
}

export const QueryInput: React.FC<QueryInputProps> = (props) => {
  const ref = useRef<Input>(null);
  const value = useMemo(() => props.value ?? '', [props.value]);

  const onQueryChange = useMemo(() => props.onQueryChange, [
    props.onQueryChange,
  ]);
  const onQueryEnter = useMemo(() => props.onQueryEnter, [props.onQueryEnter]);

  const [showIntelliSense, setShowIntelliSense] = useState(false);
  const [completionItems, refactorUserInput] = useSyntaxSuggestions(
    value,
    props.fieldOptionItems
  );
  const [autoFocus, setAutoFocus] = useState(false);

  const handleQueryChange = useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      onQueryChange && onQueryChange(refactorUserInput(e.currentTarget.value));
    },
    [onQueryChange, refactorUserInput]
  );

  const handleQueryTab = useCallback(
    (item: CompletionItem | undefined) => {
      item &&
        onQueryChange &&
        onQueryChange(refactorUserInput(item.label, true));
      ref.current?.focus();
    },
    [onQueryChange, refactorUserInput]
  );

  const handleQueryFocus = useCallback(() => {
    setAutoFocus(true);
    setShowIntelliSense(true);
  }, []);

  const handleQueryCancel = useCallback(() => {
    setShowIntelliSense(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setShowIntelliSense(false);
        onQueryEnter && onQueryEnter();
      } else {
        setShowIntelliSense(true);
      }
    },
    [onQueryEnter]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowIntelliSense(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <QueryCompletionProvider
      ref={ref}
      size="large"
      autoFocus={autoFocus}
      value={value}
      loading={props.loading}
      visible={showIntelliSense}
      dataSource={completionItems}
      placeholder="按Tab键获得查询语法提示, 按Enter键开始查询"
      onQueryInputFocus={handleQueryFocus}
      onQueryInputBlur={handleQueryCancel}
      onInput={handleQueryChange}
      onCompletionSelect={handleQueryTab}
      onKeyDown={handleKeyDown}
    />
  );
};
