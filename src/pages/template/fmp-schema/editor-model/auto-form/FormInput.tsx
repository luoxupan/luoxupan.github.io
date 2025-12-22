import { Input } from 'antd';
import * as React from 'react';

export default function (props: any) {

  const { value, onChange, label, onBlur = () => { }, disabled } = props;

  return (
    <>
      <Input
        value={value}
        onBlur={onBlur}
        disabled={disabled}
        onChange={({ target }) => {
          onChange(target.value);
        }} />
    </>
  );
}