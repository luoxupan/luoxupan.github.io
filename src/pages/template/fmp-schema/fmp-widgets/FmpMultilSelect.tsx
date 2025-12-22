import { Select } from 'antd';
import * as React from 'react';

export function FmpMultilSelect(props: any) {

  const { dataSource, name, label } = props;
  const data = dataSource.enum || [];
  return (
    <Select
      {...(props as any)}
      mode='tags'
      allowClear
      getPopupContainer={(e: any) => e.parentNode}
      tokenSeparators={[',', '，']}>
      {(data || []).map((option: any, idx: any) => {
        const { value, label } = option;
        return (
          <Select.Option value={value} key={idx}>{label}</Select.Option>
        );
      })}
    </Select>
  );
}