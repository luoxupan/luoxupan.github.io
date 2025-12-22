import * as React from 'react';
import { Form } from 'antd';
import { useDebounce } from '../utils';

export const FmpFieldsForms: any = []; // 收集form表单实例

export function FmpObject(props: any) {

  const [form] = Form.useForm();

  const { name, label, onChange, renderItems, schema, value, disabled, count } = props;

  const formRef = React.useRef({ isMounted: false, updateData: false }); // 组件加载完成

  React.useEffect(() => {
    if (formRef.current.updateData) {
      formRef.current.updateData = false;
    } else {
      form.setFieldsValue(value);
    }
  }, [value]);

  React.useEffect(() => {
    // 这个useEffect主要是收集form表单实例  提交时校验表单需要用到
    if (!FmpFieldsForms.includes(form)) {
      FmpFieldsForms.push(form);
    }
    onChange(form.getFieldsValue())
    formRef.current.isMounted = true;
    return () => {
      const idx = FmpFieldsForms.indexOf(form);
      if (idx !== -1) {
        FmpFieldsForms.splice(idx, 1);
      }
    };
  }, []);

  const _onChange = useDebounce((allValues: any) => {
    formRef.current.updateData = true;
    onChange(allValues);
  }, 200);

  const color = 256 - count * 5;
  return (
    <Form
      form={form}
      layout='horizontal'
      style={{
        backgroundColor: `rgba(${color},${color},${color},.2)`
      }}
      className='schema-object'
      onValuesChange={function (changedValues, allValues) {
        if (formRef.current.isMounted) {
          _onChange(allValues);
        }
      }}>
        {renderItems(schema, disabled, count)}
    </Form>
  );
}