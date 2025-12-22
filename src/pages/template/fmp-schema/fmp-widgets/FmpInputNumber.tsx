import { InputNumber } from 'antd';
import { isNull } from 'lodash';
import * as React from 'react';

export function FmpInputNumber(props: any) {
  return (
    <InputNumber
      {...(props as any)}
      type={undefined}
      style={{ width: '100%' }}
      onChange={(target) => {
        if (isNull(target)) {
          props.onChange(undefined);
        } else {
          props.onChange(target);
        }
      }}
    />
  );
}