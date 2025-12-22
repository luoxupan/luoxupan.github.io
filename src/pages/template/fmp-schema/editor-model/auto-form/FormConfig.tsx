import { Input, Switch, Collapse, Form, InputNumber, Modal } from 'antd';
import * as React from 'react';

const { Panel } = Collapse;

export default function (props: any) {

  const { onChange, subType, type, defaultData, id, value } = props;

  const [form] = Form.useForm();

  //存储改变前的数据
  function usePreCurCards(preType: any) {
    const ref = React.useRef(null as any);
    React.useEffect(() => {
      ref.current = preType
    }, [preType]);
    return ref.current
  }

  const preType = usePreCurCards(type); // 改变前的类型
  const preSubType = usePreCurCards(subType); // 改变前的子类型

  React.useEffect(() => {
    // 清空form表单数据
    form.resetFields()
    let obj: any = {}

    // 如果preType为null，说明是初始化的自定义组件，反之，则说明当前自定义组件改变了类型，则不会给组件配置赋值
    if (!preType || !preSubType) {
      if (!value) {
        obj = {
          defaultValue: defaultData,
        }
      } else {
        obj = {
          ...value
        }
      }
    }

    // 刷新组件配置的form表单
    form.setFieldsValue(obj)

    // 更改自定义组件的组件配置，使其中间演示栏的值发生变化
    onChange(obj)
  }, [id, type, subType])

  const info = (title: any) => {
    Modal.info({
      className: 'uni-modal',
      content: title,
      onOk: () => {
        form.setFieldsValue({ defaultValue: undefined })
        onChange({ ...value, defaultValue: undefined })
      }
    });
  }

  return (
    <Collapse
      className={'collapse-config'}
      defaultActiveKey={['1']}
      key={id}
    >
      <Panel
        header={undefined}
        key="1">
        <Form
          form={form}
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
          onValuesChange={(_, v) => {
            onChange({ ...value, ...v })
          }}
        >
          {(() => {
            if ('String' === type && 'Input' === subType) {
              return (
                <Form.Item shouldUpdate name='defaultValue' label={'默认值'}>
                  <Input />
                </Form.Item>
              );
            } else if ('Number' === type && 'InputNumber' === subType) {
              return (
                <>
                  <Form.Item
                    getValueFromEvent={(v) => {
                      return (v || v === 0) ? v : undefined
                    }}
                    shouldUpdate
                    name='min'
                    label={'最小值'}>
                    <InputNumber onBlur={async (v) => {
                      const defaultValue = await form?.getFieldValue('defaultValue')
                      if (v?.target?.value && (defaultValue < v?.target?.value)) {
                        info('默认值不可小于最小值')
                      }
                    }} />
                  </Form.Item>
                  <Form.Item
                    getValueFromEvent={(v) => {
                      return (v || v === 0) ? v : undefined
                    }}
                    shouldUpdate
                    name='max'
                    label={'最大值'}>
                    <InputNumber onBlur={async (v) => {
                      const defaultValue = await form?.getFieldValue('defaultValue')
                      if (v?.target?.value && (defaultValue > v?.target?.value)) {
                        info('默认值不可大于最大值')
                      }
                    }} />
                  </Form.Item>
                  <Form.Item
                    getValueFromEvent={(v) => {
                      return (v || v === 0) ? v : undefined
                    }}
                    shouldUpdate
                    name='precision'
                    label={'保留几位小数'}>
                    <InputNumber />
                  </Form.Item>
                  <Form.Item shouldUpdate noStyle>
                    {
                      ({ getFieldValue }) => {
                        const val = getFieldValue('precision')
                        return <Form.Item
                          getValueFromEvent={(v) => {
                            return (v || v === 0) ? v : undefined
                          }}
                          shouldUpdate
                          name='defaultValue'
                          label={'默认值'}>
                          <InputNumber precision={val} onBlur={async (v) => {
                            const { max, min } = await form?.getFieldsValue()
                            if (v?.target?.value) {
                              if (v?.target?.value > max && (max || max === 0)) {
                                info('默认值不可大于最大值')
                              }
                              if (v?.target?.value < min && (min || min === 0)) {
                                info('默认值不可小于最小值')
                              }
                            }
                          }} />
                        </Form.Item>
                      }
                    }
                  </Form.Item>
                </>
              );
            } else if ('Boolean' === type && 'Switch' === subType) {
              return (
                <Form.Item
                  shouldUpdate
                  name='defaultValue'
                  initialValue={false}
                  label={'默认值'}
                  valuePropName="checked">
                  <Switch />
                </Form.Item>
              );
            }
          })()}
        </Form>
      </Panel>
    </Collapse>
  );
}