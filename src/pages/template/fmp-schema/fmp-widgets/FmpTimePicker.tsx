import { TimePicker } from 'antd';
import * as React from 'react';
import { toMoment } from '../utils';

export function FmpTimePicker(props: any) {
  // 模版里存的是字符串，而 Picker 只接受 moment 对象，这里统一转一次
  const { value, onChange, defaultValue, ...rest } = props;
  return (
    <TimePicker
      {...(rest as any)}
      value={toMoment(value, ['HH:mm:ss', 'HH:mm', 'HH:mm:ss.SSS'])}
      onChange={(date, dateString) => {
        onChange(dateString);
      }} />
  );
}
