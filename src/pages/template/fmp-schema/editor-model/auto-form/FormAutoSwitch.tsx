import { Switch } from 'antd';
import * as React from 'react';

export default function (props: any) {
  const { value, onChange } = props;

  return (
    <>
      <Switch
        checked={value}
        onChange={(val) => {
          onChange(
            val,
            {
              linkage: {}
            }
          );
        }}
      />
    </>
  );
}