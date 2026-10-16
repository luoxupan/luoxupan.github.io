import { TimePicker } from 'antd';
import * as React from 'react';
import { toMoment } from '../utils';

/**
 * 组件编辑区里的时间选择器（只做预览，不承载数据）
 * 说明同 EditorDatePicker：值统一转成 moment，避免 `date.clone is not a function`
 */
export default function EditorTimePicker(props: any) {
  const { value, style, format, placeholder, disabled, allowClear, className } = props;

  return (
    <TimePicker
      className={className}
      style={style}
      format={format}
      placeholder={placeholder}
      disabled={disabled}
      allowClear={allowClear}
      value={toMoment(value, ['HH:mm:ss', 'HH:mm', 'HH:mm:ss.SSS'])}
    />
  );
}
