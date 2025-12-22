import { DatePicker } from 'antd';
import * as React from 'react';
import moment from 'moment';

export function FmpDatePicker(props: any) {
  const { value, onChange, showTime } = props;
  return (
    <DatePicker
      showTime={showTime}
      {...(props as any)}
      value={value ? moment(value) : undefined}
      onChange={(date, dateString) => {
        onChange(dateString);
      }} />
  );
}