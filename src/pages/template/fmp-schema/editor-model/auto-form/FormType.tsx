import { Radio } from 'antd';
import * as React from 'react';
import { Types, getDefaultSubType } from '../../type';

export default function (props: any) {

  const { value, onChange, label } = props;

  return (
    <>
      <Radio.Group
       value={value}
       onChange={({ target }) => {
        onChange(target.value, {
          items: [],
          dataSource: { enum: [] },
          subType: getDefaultSubType(target.value),
          linkage: {},
          mode: undefined,
          canLinkage: false,
          automaticKey: false
        });
      }}>
        {Types.map(({ name, label }) => {
          return (
            <Radio value={name}>{label}</Radio>
          );
        })}
      </Radio.Group>
    </>
  );
}