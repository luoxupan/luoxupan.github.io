import { Radio } from 'antd';
import * as React from 'react';

export default function (props: any) {

  const { dataSource, name, label, style } = props;
  const { type, dictUrl } = dataSource;
  const data = type === 'enum' ? dataSource.enum : [];
  return (
    <Radio.Group style={{...style}}>
      {(data || []).map((option: any, idx: any) => {
        const { key, value } = option;
        return (
          <Radio value={value} key={idx}>{key}</Radio>
        );
      })}
    </Radio.Group>
  );
}