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
        <div className="spl-soureList">
          <Menu className={['provider-menu-style'].concat([className ?? '']).join(' ')} selectedKeys={selectedKeys}>
            {dataSource.map((opt, index) => (
              <Menu.Item key={index} onClick={() => onSelect && onSelect(opt)}>
                <Space>
                  <Tag color={Colors[opt.tag]}>{opt.tag}</Tag>
                  <span className='option-style'>{opt.mapping.replace(' ', '_')}</span>
                </Space>
              </Menu.Item>
            ))}
          </Menu>
          {
            curItem && <div className="spl-desc">
              {curItem.description}
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

export interface CompletionProviderProps {
  /**
   * 默认值
   */
  defaultValue?: string;
  /**
   * 加载状态
   */
  loading?: boolean;
  /**
   * 候选项是否可见
   */
  visible?: boolean;
  /**
   * 提示列表
   */
  suggestionItems: SuggestionItem[];
  /**
   * 鼠标选择
   */
  onCompletionSelect?: (item: SuggestionItem) => void;
  /**
   * 输入改变
   */
  onInput: (event: React.FormEvent<HTMLInputElement>) => void;
  /**
   * 回车
   */
  onQueryEnter?: (spl: string) => void;
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
    onInput,
    onQueryEnter,
    suggestionItems,
    ...rest
  } = props;

  const defaultValue = useMemo(() => props.defaultValue ?? '', [props.defaultValue]);

  const [showIntelliSense, setShowIntelliSense] = useState(false);

  const [inputValue, setInputValue] = useState(String)

  const [
    ,
    selectedIndex,
    curDataSource,
    setSelectedIndex,
    onKeyEvent,
    setCurDataSource
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
        setShowIntelliSense(false);
        setInputValue(`${inputValue}${curDataSource ? curDataSource.code : ''}`)
        !showIntelliSense && onQueryEnter && onQueryEnter(inputValue)
      } else {
        setShowIntelliSense(true);
      }
    },
    [inputValue, curDataSource, showIntelliSense]
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
      onCompletionSelect && onCompletionSelect(item);
    },
    [onCompletionSelect]
  );

  useEffect(() => {
    setInputValue(defaultValue)
  }, [])

  useEffect(() => {
    if (!showIntelliSense) {
      setCurDataSource(null)
      setSelectedIndex(-1)
    }
  }, [showIntelliSense])

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
      onInput: (e: React.FormEvent<HTMLInputElement>) => {
        setInputValue(e.currentTarget?.value)
        onInput(e)
      },
      ref: ref,
      addonAfter: loading ? <LoadingOutlined /> : null,
      onKeyDown: compose(handleKeyDown ?? identity, onKeyEvent),
    }),
    [loading, onKeyEvent, ref, rest]
  );

  return (
    <div
      className={className}
      onFocus={handleQueryFocus}
      style={{ width: '100%' }}
    >
      <Dropdown
        getPopupContainer={getContainer}
        overlay={
          <ProviderMenu
            dataSource={suggestionItems}
            selectedKey={`${selectedIndex}`}
            onSelect={handleProviderSelect}
          />
        }
        visible={showIntelliSense}
      >
        <Input
          {...composedProps}
          value={inputValue}
        />
      </Dropdown>
    </div>
  );
});

QueryInput.displayName = 'QueryInput';
