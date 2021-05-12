import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';

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
  字段值: 'purple',
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
            (curItem?.syntax || curItem?.example) && <div className="spl-desc">
              <p>{curItem.syntax ? <span>语法：</span> : ''}{curItem.syntax}</p>
              <p>{curItem.example ? <span>example：</span> : ''}{curItem.example}</p>
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
const combinationSpl = (value: string, item: SuggestionItem | null) => {
  const regex = /\s+[a-zA-Z][\s\S]*$/
  if (item && ['关键词', '算子'].includes(item?.tag) && regex.test(value)) {
    return value.replace(regex, ` ${item?.code}`)
  }
  return `${value}${item?.code ?? ''}`
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
   * 错误
   */
  error?: string;
  /**
  * 错误提示信息
  */
  errorMessage?: string;
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
    onQueryChange,
    onQueryEnter,
    suggestionItems,
    value = '',
    error,
    errorMessage,
    ...rest
  } = props;

  const [showIntelliSense, setShowIntelliSense] = useState(false);
  const inputEl = useRef<Input>(null);
  const filteredItems = useMemo(() => suggestionItems.filter(item => !error || item.code.includes(error)), [error, suggestionItems])

  const [
    current,
    selectedIndex,
    reset,
    onKeyEvent,
  ] = useCompletionFocus<SuggestionItem>(filteredItems);

  const handleQueryFocus = useCallback(() => {
    setShowIntelliSense(true);
  }, []);

  const onQueryInputBlur = useCallback(() => {
    setShowIntelliSense(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        const val = combinationSpl(value, current)
        onQueryChange && onQueryChange(val)
        onQueryEnter && onQueryEnter(val)
      } else {
        setShowIntelliSense(true);
      }
    },
    [value, current?.code, onQueryChange, onQueryEnter]
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
      const val = combinationSpl(value, item);
      onQueryChange && onQueryChange(val);
      inputEl.current?.focus()
    },
    [onQueryChange, value]
  );

  useEffect(() => {
    visible && setShowIntelliSense(visible)
  }, [visible])

  useEffect(() => {
    !showIntelliSense && reset()
  }, [reset, showIntelliSense])

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
      ref,
      onInput: (e: React.FormEvent<HTMLInputElement>) => {
        onQueryChange && onQueryChange(e.currentTarget.value)
      },
      addonAfter: loading ? <LoadingOutlined /> : null,
      onKeyDown: compose(handleKeyDown ?? identity, onKeyEvent),
    }),
    [rest, ref, loading, handleKeyDown, onKeyEvent, onQueryChange]
  );


  let menu
  if (error && filteredItems.length === 0) {
    menu = <div className="spl-sourceList spl-syntax-error">{errorMessage}</div>
  } else {
    menu = <ProviderMenu
      dataSource={filteredItems}
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
          ref={inputEl}
          value={value}
        />
      </Dropdown>
    </div>
  );
});

QueryInput.displayName = 'QueryInput';
