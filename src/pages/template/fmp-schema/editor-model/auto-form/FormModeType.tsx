import { Radio } from 'antd';
import * as React from 'react';

export default function (props: any) {

  const { value, onChange, label, type, subType } = props;

  return (
    <>
      <Radio.Group
        value={value}
        onChange={({ target }) => {
          onChange(
            target.value,
            {
              linkage: {},
              canLinkage: false,
              automaticKey: false
            }
          );
        }}>
        <Radio value={'radio'}>{'单选框'}</Radio>
        <Radio value={'select'}>{'下拉框'}</Radio>
      </Radio.Group>
    </>
  );
}