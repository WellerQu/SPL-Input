import React, { useCallback, useEffect, useMemo } from 'react';
import styled from 'styled-components';

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

/**
 * 语法面板的样式
 */
const ProviderMenuStyle = styled(Menu)`
  border-radius: 2px; /* ${(props) => props.theme['border-radius-base']}; */
  border-color: #d9d9d9; /* ${(props) => props.theme['border-color-base']}; */
  border-width: 1px;
  border-style: solid;
  box-shadow:  0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 9px 28px 8px rgba(0, 0, 0, 0.05); /* ${(
    props
  ) => props.theme['box-shadow-base']}; */
`;

const DescStyle = styled.span`
  color: rgba(0, 0, 0, 0.45); /* ${(props) =>
    props.theme['text-color-secondary']}; */
`;

const OptionStyle = styled.div`
  width: 240px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
`;

interface ProviderMenuProps {
  dataSource: CompletionItem[];
  selectedKey?: string;
  className?: string;
  onSelect?: (item: CompletionItem) => void;
}

const Colors: {
  [key in Required<CompletionItem>['tagName']]: string;
} = {
  关键词: 'red',
  函数: 'orange',
  字段: 'gold',
  数字: 'cyan',
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

  return (
    <>
      {dataSource.length > 0 && (
        <ProviderMenuStyle className={className} selectedKeys={selectedKeys}>
          {dataSource.map((opt) => (
            <Menu.Item key={opt.id} onClick={() => onSelect && onSelect(opt)}>
              <Space>
                <Tag color={Colors[opt.tagName]}>{opt.tagName}</Tag>
                <OptionStyle>{opt.label.replace(' ', '_')}</OptionStyle>
                <DescStyle>{opt.desc}</DescStyle>
              </Space>
            </Menu.Item>
          ))}
        </ProviderMenuStyle>
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
   * 可能的语法提示项
   */
  dataSource: CompletionItem[];
  /**
   * 加载状态
   */
  loading?: boolean;
  /**
   * 候选项是否可见
   */
  visible?: boolean;
  /**
   * 按Tab或鼠标点击时, 提供所选则的提示项
   */
  onCompletionSelect?: (item: CompletionItem) => void;

  onQueryInputFocus?: () => void;
  onQueryInputBlur?: () => void;
}

type CompletionProviderType = InputProps & CompletionProviderProps;

/**
 * 提供智能感知的 Input 输入框
 */
export const QueryCompletionProvider = React.forwardRef<
  Input,
  CompletionProviderType
>((props, ref) => {
  const {
    dataSource,
    loading,
    visible = false,
    onQueryInputFocus,
    onQueryInputBlur,
    onCompletionSelect,
    ...rest
  } = props;
  const [selectedItem, onKeyEvent] = useCompletionFocus<CompletionItem>(
    dataSource,
    onCompletionSelect
  );
  const className = useMemo(() => `special-tag-${uuidv4()}`, []);

  const getContainer = useCallback(
    () => document.querySelector(`.${className}`) as HTMLElement,
    [className]
  );

  // 通过鼠标选择备选项
  const handleProviderSelect = useCallback(
    (item: CompletionItem) => {
      onCompletionSelect && onCompletionSelect(item);
    },
    [onCompletionSelect]
  );

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
  }, [className, onQueryInputBlur, onQueryInputFocus]);

  const composedProps = useMemo<InputProps>(
    () => ({
      ...rest,
      ref: ref,
      addonAfter: loading ? <LoadingOutlined /> : null,
      onKeyDown: compose(rest.onKeyDown ?? identity, onKeyEvent),
    }),
    [loading, onKeyEvent, ref, rest]
  );

  return (
    <div
      className={className}
      onFocus={onQueryInputFocus}
      style={{ width: '100%' }}
    >
      <Dropdown
        getPopupContainer={getContainer}
        overlay={
          <ProviderMenu
            dataSource={dataSource}
            selectedKey={selectedItem?.id}
            onSelect={handleProviderSelect}
          />
        }
        visible={visible}
      >
        <Input {...composedProps} />
      </Dropdown>
    </div>
  );
});

QueryCompletionProvider.displayName = 'QueryCompletionProvider';
