import { Radio } from 'antd';
import * as React from 'react';

export function FmpRadio(props: any) {

  const { dataSource, name, label } = props;
  const { type, dictUrl } = dataSource;
  const data = type === 'enum' ? dataSource.enum : [];
  return (
    <Radio.Group {...(props as any)}>
      {(data || []).map((option: any, idx: any) => {
        const { key, value } = option;
        return (
          <Radio value={value} key={idx}>{key}</Radio>
        );
      })}
    </Radio.Group>
  );
}