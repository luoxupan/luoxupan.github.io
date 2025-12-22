import { Radio } from 'antd';
import * as React from 'react';
import { getStyleType } from '../../type';

export default function (props: any) {

  const { value, onChange, label, type } = props;
  const options = getStyleType(type) || [];

  return (
    <>
      <Radio.Group
       value={value}
       onChange={({ target }) => {
        onChange(target.value, {
          items: [],
          linkage: {},
          canLinkage: false,
          automaticKey: false
        });
      }}>
        {options.map(({ name, value }: any) => {
          return (
            <Radio value={value}>{name}</Radio>
          );
        })}
      </Radio.Group>
    </>
  );
}