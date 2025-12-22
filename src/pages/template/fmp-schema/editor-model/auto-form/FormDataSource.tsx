import { Row, Col, Input, Button, message } from 'antd';
import * as React from 'react';
import { Delete } from '../../../icons/Delete';

export default function (props: any) {

  const { dataSource, name, label, onChange, type, subType } = props;

  const { enum: _enum } = dataSource;

  return (
    <div key={name}>
      {_enum.map(({ value, label }: any, idx: any) => {
        return (
          <Row
            style={{
              border: ((!value && value !== 0) || !label?.trim() || !label)? '1px dashed red' : '1px dashed rgb(232, 232, 232)', 
              padding: 4,
              borderRadius: 4, 
              marginBottom: 20, 
              justifyContent: 'space-between'
          }}>
            <div
              className='WidgetEditorForm-delete'
              onClick={() => {
                _enum.splice(idx, 1);
                onChange({ ...dataSource, enum: [..._enum] });
              }}>
                <Delete />
            </div>
            <Col span={11}>
              <div className='ant-col ant-form-item-label'>
                {'值'}
                {(type === 'Number' && isNaN(value))
                  && <span style={{ fontSize: 10, color: 'red', marginLeft: 5 }}>
                      {'请输入数字'}
                     </span>}
              </div>
              <Input
                value={value}
                onBlur={({ target }) => {
                  let value: any = target?.value?.trim();
                  if (value && type === 'Number') {
                    if (!isNaN(Number(value))) {
                      value = Number(value);
                    }
                  }
                  const __enum = [..._enum];
                  if ((_enum || [])?.filter((item: any) => item?.value === value)?.length >=2){
                    __enum[idx].value = undefined;
                    message?.error('数据源的key值要唯一')
                  } else {
                    __enum[idx].value = value;
                  }
                  onChange({ ...dataSource, enum: __enum });
                }}
                onChange={({ target }) => {
                  let value: any = target?.value;
                  if (value && type === 'Number') {
                    if (!isNaN(Number(value))) {
                      value = Number(value);
                    }
                  }
                  const __enum = [..._enum];
                  __enum[idx].value = value;
                  onChange({ ...dataSource, enum: __enum });
                }} />
            </Col>
            <Col span={11}>
              <div className='ant-col ant-form-item-label'>{'显示文本'}</div>
              <Input
                value={label}
                onChange={({ target }) => {
                  const __enum = [..._enum];
                  __enum[idx].label = target.value
                  onChange({ ...dataSource, enum: __enum });
                }} />
            </Col>
          </Row>
        );
      })}
      <Button
        type="dashed"
        onClick={() => {
          const __enum = [..._enum, { key: '', value: '' }];
          onChange({ ...dataSource, enum: __enum });
        }}>
          {'添加'}
        </Button>
    </div>
  );
}