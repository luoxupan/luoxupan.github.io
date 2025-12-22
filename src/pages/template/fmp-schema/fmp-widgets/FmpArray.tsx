import * as React from 'react';
import { Button, message } from 'antd';
import { FmpObject } from './FmpObject';
import { ArrowDown } from '../../icons/ArrowDown';
import { ArrowUp } from '../../icons/ArrowUp';
import { RemoveBtn } from '../../icons/RemoveBtn';

export function FmpArray(props: any) {

  const { name, label, schema, value, onChange, renderItems, disabled, defaultData } = props;

  const [data, setData]: any = React.useState([]);

  React.useEffect(() => {
    if (Array.isArray(value)) {
      setData(value);
    } else if (value) {
      message.error('模板结构已更改，请删除重建配置');
    }
  }, [value]);

  const _swap = (lIdx: any, rIdx: any) => {
    if (lIdx >= 0 && rIdx < data.length) {
      const _data = [...data];
      const temp = _data[lIdx];
      _data[lIdx] = _data[rIdx];
      _data[rIdx] = temp;
      setData(_data);
      onChange(_data);
    }
  };

  return (
    <div className='schema-object-array'>
      {data.map((item: any, idx: any) => {
        return (
          <div
            key={idx}
            className='schema-object-array-item'
            style={{ position: 'relative' }}>
            <FmpObject
              {...props}
              value={item}
              schema={schema}
              renderItems={renderItems}
              style={{ marginBottom: 14 }}
              onChange={(v: any) => {
                const _data = [...data];
                _data[idx] = v;
                setData(_data);
                onChange(_data);
              }} />
              <div
                style={{
                  position: 'absolute',
                  top: -10, right: -10,
                  display: disabled ? 'none' : 'block'
                }}>
                  <ArrowUp
                    onClick={() => {
                      _swap(idx - 1, idx);
                    }} />
                  <ArrowDown
                    style={{ margin: '0 8px' }}
                    onClick={() => {
                      _swap(idx, idx + 1);
                    }} />
                  <RemoveBtn
                    onClick={() => {
                      const _data = [...data];
                      _data.splice(idx, 1);
                      setData(_data);
                      onChange(_data);
                    }} />
              </div>
          </div>
        );
      })}
      {!disabled && <Button
        type="dashed"
        style={{ marginTop: 15 }}
        onClick={() => {
          const obj = {};
          const _data = [...data, obj];
          setData(_data);
          onChange(_data);
        }}>
          {'添加'}
        </Button>}
    </div>
  );
}