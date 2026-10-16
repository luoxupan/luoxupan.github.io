import { DatePicker } from 'antd';
import * as React from 'react';
import { toMoment } from '../utils';

/**
 * 组件编辑区里的日期选择器（只做预览，不承载数据）
 *
 * 之前这里直接用的 antd DatePicker，卡片上的组件配置（config.defaultValue）会被整体透传下去，
 * 值是字符串或者切换类型时残留的 true 时，Picker 内部就会报 `date.clone is not a function`。
 * 这里只透传 Picker 需要的属性，并把值统一转成 moment。
 */
export default function EditorDatePicker(props: any) {
  const { value, showTime, style, format, placeholder, disabled, allowClear, className } = props;

  return (
    <DatePicker
      className={className}
      style={style}
      showTime={showTime}
      format={format}
      placeholder={placeholder}
      disabled={disabled}
      allowClear={allowClear}
      value={toMoment(value)}
    />
  );
}
