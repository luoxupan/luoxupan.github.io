import * as React from 'react';
import { Collapse, Form, message, Input, Modal, Button } from 'antd';
import './WidgetEditorForm.less';
import { throttle } from 'lodash';
import { getSubType } from '../type';

const { Panel } = Collapse;

export default function WidgetEditorForm(props: any) {
  const { cards, parrentKey, automaticKey } = props;
  const curCard = cards.find(({ active }: any) => active === true);
  
  const { id, type, subType, mode, canLinkage, noDelete } = curCard || {};

  if (curCard === undefined) {
    return null;
  }

  //现在只有基础信息，所以将form定义在循环外
  const [form] = Form.useForm();

  React.useEffect(() => {
    (async () => {
      form?.resetFields();
      form?.setFieldsValue(curCard)
      await form?.validateFields()
    })()
  }, [id, type, subType, mode, canLinkage, curCard?.automaticKey])

  const onChange = React.useCallback(throttle((props, options) => {
    const { cards, setCards } = props;
    const _cards = [...cards];
    const curIndex = _cards.findIndex((item) => item.active === true);
    const temp = { ..._cards[curIndex] };
    _cards[curIndex] = temp;

    // const temp = _cards.find((item) => item.active === true);
    Object.keys(options).forEach((key) => {
      temp[key] = options[key];
    });
    setCards([..._cards]);
  }, 1000), []);

  return (
    <div className='widget-editor-form'>
      <Collapse defaultActiveKey={['0']} accordion>
        {
          (getSubType(type, subType)?.model || []).map((item: any, idx: any) => {
            const { label, formItems } = item;
            return (
              <Panel header={label} key={idx}>
                <Form labelCol={{ span: 24 }} form={form}>
                  {formItems.map((formItem: any, index: any) => {
                    const { label, modelKey, validator, rules, hidden, disabled } = formItem;

                    // 如果组件有自定义的validator，则拼接上
                    const curRules = [
                      ...(rules || []),
                      ...(
                        !!validator ?
                          [
                            {
                              validator: validator(parrentKey, automaticKey)
                            }
                          ] :
                          []
                      )
                    ]

                    return (
                      <div key={index} style={{ marginBottom: 20 }}>
                        <Form.Item
                          key={index}
                          name={modelKey}
                          rules={curRules}
                          label={<span style={{ color: '#999', padding: '10px 0', fontWeight: 700 }}>{label}</span>}
                          shouldUpdate
                          hidden={hidden && hidden(curCard, canLinkage)}
                        >
                          <formItem.component
                            {...curCard}
                            parrentKey={parrentKey}
                            automaticKey={automaticKey}
                            label={label}
                            disabled={disabled && disabled(label, noDelete)}
                            cards={cards}
                            onChange={(value: any, extra = {}) => {
                              if (extra.hasOwnProperty('nativeEvent')) {
                                // 判断为react的合成事件参数
                                onChange(props, { [modelKey]: value });
                              } else {
                                onChange(props, { ...extra, [modelKey]: value });
                              }
                            }} />
                        </Form.Item>
                      </div>
                    );
                  })}
                </Form>
              </Panel>
            );
          })
        }
      </Collapse>
    </div>
  )
}
