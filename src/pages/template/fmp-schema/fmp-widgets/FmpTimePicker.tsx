import { TimePicker } from 'antd';
import * as React from 'react';
import moment from 'moment';

export function FmpTimePicker(props: any) {
  const { value, onChange } = props;
  return (
    <TimePicker
      {...(props as any)}
      value={value ? moment(value, 'HH:mm:ss') : undefined}
      onChange={(date, dateString) => {
        onChange(dateString);
      }} />
  );
}