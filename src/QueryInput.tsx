import React, { useCallback, useEffect, useMemo, useState } from 'react';

import LoadingOutlined from '@ant-design/icons/LoadingOutlined';

import Dropdown from 'antd/lib/dropdown';
import Input, { InputProps } from 'antd/lib/input';
import Menu from 'antd/lib/menu';
import Space from 'antd/lib/space';
import Tag from 'antd/lib/tag';
import Card from 'antd/lib/card';
import Empty from 'antd/lib/empty';

import { compose } from './utils/compose';
import { identity } from './utils/identity';

import { useCompletionFocus } from './hooks/useCompletionFocus';
import { uuidv4 } from './utils/UUID';

interface ProviderMenuProps {
  dataSource: SuggestionItem[];
  selectedKey?: string;
  className?: string;
  onSelect?: (item: SuggestionItem) => void;
}

const Colors: {
  [key in Required<SuggestionItem>['tag']]: string;
} = {
  关键词: 'red',
  函数: 'orange',
  字段: 'gold',
  通用: 'cyan',
  符号: 'magenta',
  算子: 'green',
  逻辑: 'volcano',
};

/**
 * 语法提示面板组件
 */
const ProviderMenu = ({
  dataSource,
  selectedKey,
  className,
  onSelect,
}: ProviderMenuProps) => {
  const selectedKeys = useMemo(() => (selectedKey ? [selectedKey] : []), [
    selectedKey,
  ]);

  const index = Number(selectedKey);
  const curItem = dataSource[index];

  return (
    <>
      {dataSource.length > 0 && (
        <div className="spl-sourceList">
          <Menu className={['provider-menu-style'].concat([className ?? '']).join(' ')} selectedKeys={selectedKeys}>
            {dataSource.map((opt, index) => (
              <Menu.Item key={index} onClick={() => onSelect && onSelect(opt)}>
                <Space>
                  <Tag color={Colors[opt.tag]}>{opt.tag}</Tag>
                  <span className='option-style'>{opt.label}</span>
                  <span>{opt.description}</span>
                </Space>
              </Menu.Item>
            ))}
          </Menu>
          {
            curItem && <div className="spl-desc">
              {curItem.syntax ? `语法：${curItem.syntax}` : curItem.syntax}
              <br />
              <br />
              {curItem.example ? `example: ${curItem.example}` : curItem.example}
            </div>
          }
        </div>
      )}
      {dataSource.length === 0 && (
        <Card size="small">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="无提示项, 请检查语法是否正确"
          />
        </Card>
      )}
    </>
  );
};

/**
* 选中语法替换规则
*/
const combinationSpl = (value: string, code: string) => {

  const regex = /\s+[a-zA-Z]+$/
  if (regex.test(value) && /^[A-Za-z]+$/.test(code)) {
    return value.replace(/[a-zA-Z]+$/, code)
  }
  return `${value}${code}`
}

export interface CompletionProviderProps {
  /**
   * 语法提示列表
   */
  suggestionItems: SuggestionItem[];
  /**
   * 值
   */
  value: string;
  /**
   * 加载状态
   */
  loading?: boolean;
  /**
   * 候选项是否可见
   */
  visible?: boolean;
  /**
   * 错误提示
   */
  error?: string;
  /**
   * 鼠标选择
   */
  onCompletionSelect?: (item: SuggestionItem) => void;
  /**
   * 回车查询事件
   */
  onQueryEnter?: (spl: string) => void;
  /**
   * 输入改变事件
   */
  onQueryChange: (value: string) => void;
}

type CompletionProviderType = InputProps & CompletionProviderProps;

/**
 * 提供智能感知的 Input 输入框
 */
export const QueryInput = React.forwardRef<
  Input,
  CompletionProviderType
>((props, ref) => {
  const {
    loading,
    visible = false,
    onCompletionSelect,
    onQueryChange,
    onQueryEnter,
    suggestionItems,
    value = '',
    error,
    ...rest
  } = props;

  const [showIntelliSense, setShowIntelliSense] = useState(false);

  const [
    current,
    selectedIndex,
    reset,
    onKeyEvent,
  ] = useCompletionFocus<SuggestionItem>(
    suggestionItems,
    onCompletionSelect
  );

  const handleQueryFocus = useCallback(() => {
    setShowIntelliSense(true);
  }, []);

  const onQueryInputBlur = useCallback(() => {
    setShowIntelliSense(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const val = combinationSpl(value, current?.code ?? '')
        onQueryChange && onQueryChange(val)
        onQueryEnter && onQueryEnter(val)
      } else {
        setShowIntelliSense(true);
      }
    },
    [showIntelliSense, value, current, onQueryEnter]
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

  const className = useMemo(() => `special-tag-${uuidv4()}`, []);
  const getContainer = useCallback(
    () => document.querySelector(`.${className}`) as HTMLElement,
    [className]
  );

  // 通过鼠标选择备选项
  const handleProviderSelect = useCallback(
    (item: SuggestionItem) => {
      const val = combinationSpl(value, item?.code ?? '');
      onQueryChange && onQueryChange(val);
    },
    [onQueryChange, value]
  );

  useEffect(() => {
    visible && setShowIntelliSense(visible)
  }, [visible])

  useEffect(() => {
    reset()
  }, [suggestionItems])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      let isUserSelecting = false;
      let srcElement = e.target as HTMLElement | null;

      // 若引起失去焦点事件的元素不在本组件内, 则触发onQueryInputBlur事件
      while (srcElement) {
        if (srcElement.classList.contains(className)) {
          isUserSelecting = true;
          break;
        }
        srcElement = srcElement.parentElement;
      }

      if (!isUserSelecting) {
        onQueryInputBlur && onQueryInputBlur();
      }
    };

    document.documentElement.addEventListener('click', handler);
    return () => {
      document.documentElement.removeEventListener('click', handler);
    };
  }, [className, onQueryInputBlur, handleQueryFocus]);

  const composedProps = useMemo<InputProps>(
    () => ({
      ...rest,
      ref: ref,
      onInput: (e: React.FormEvent<HTMLInputElement>) => {
        onQueryChange && onQueryChange(e.currentTarget.value)
      },
      addonAfter: loading ? <LoadingOutlined /> : null,
      onKeyDown: compose(handleKeyDown ?? identity, onKeyEvent),
    }),
    [handleKeyDown, loading, onQueryChange, onKeyEvent, ref, rest]
  );

  let menu
  if (error) {
    menu = <div className="spl-sourceList spl-syntax-error">{error}</div>
  } else {
    menu = <ProviderMenu
      dataSource={suggestionItems}
      selectedKey={`${selectedIndex}`}
      onSelect={handleProviderSelect}
    />;
  }

  return (
    <div
      className={`spl-input ${className}`}
      onFocus={handleQueryFocus}
      style={{ width: '100%' }}
    >
      <Dropdown
        getPopupContainer={getContainer}
        overlay={menu}
        visible={showIntelliSense}
      >
        <Input
          {...composedProps}
          value={value}
        />
      </Dropdown>
    </div>
  );
});

QueryInput.displayName = 'QueryInput';
