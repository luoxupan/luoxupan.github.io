import { Select } from 'antd';
import * as React from 'react';

export default function (props: any) {

  const { dataSource, name, label, style } = props;
  const data = dataSource.enum || [];
  return (
    <Select
      style={{...style}}
      mode='tags'
      tokenSeparators={[',' ,'，']}>
      {(data || []).map((option: any, idx: any) => {
        const { label, value } = option;
        return (
          <Select.Option value={value} key={idx}>{label}</Select.Option>
        );
      })}
    </Select>
  );
}