import { DatePicker } from 'antd';
import * as React from 'react';
import { toMoment } from '../utils';

export function FmpDatePicker(props: any) {
  // 模版里存的是字符串，而 Picker 只接受 moment 对象，这里统一转一次
  const { value, onChange, showTime, defaultValue, ...rest } = props;
  return (
    <DatePicker
      {...(rest as any)}
      showTime={showTime}
      value={toMoment(value)}
      onChange={(date, dateString) => {
        onChange(dateString);
      }} />
  );
}
