import { Input, Button, InputNumber } from 'antd';
import { ArrowDown } from '../../icons/ArrowDown';
import { ArrowUp } from '../../icons/ArrowUp';
import { RemoveBtn } from '../../icons/RemoveBtn';
import * as React from 'react';
import { isArray } from 'lodash';

export function FmpNormalArray(props: any) {

  const { name, label, value, onChange, type, disabled } = props;
  const [data, setData] = React.useState(isArray(value) ? value : []);
  const [mouseOverIdx, setMouseOverIdx] = React.useState(-1);

  React.useEffect(() => {
    const v = value ?? [];
    if (Array.isArray(v)) {
      setData(v);
    } else {
      console.error(value, '不是array; props:', props);
    }
  }, [value]);

  const _onChange = (idx: any, v: any) => {
    const _data = [...data];
    _data[idx] = v;
    setData(_data);
    onChange(_data);
  };

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
    <div className='schema-normal-array'>
      {data.map((item, idx) => {
        const _props = disabled ? {} : {
          onMouseOver: () => {
            setMouseOverIdx(idx);
          },
          onMouseOut: () => {
            setMouseOverIdx(-1);
          }
        };
        return (
          <div
            key={idx}
            {..._props}
            style={{ position: 'relative', marginBottom: 16 }}>
            {type === 'Number'
              ? <InputNumber
                  {...props}
                  value={item}
                  style={{ display: 'block', width: '100%' }}
                  onChange={(value) => {
                    _onChange(idx, value);
                  }} />
              : <Input
                  {...props}
                  value={item}
                  autoComplete='off'
                  onChange={({ target }) => {
                    _onChange(idx, target.value);
                  }} />}
            <div
              style={{
                position: 'absolute',
                top: -10, right: -10,
                display: mouseOverIdx === idx ? 'block' : 'none'
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
      {disabled !== true && <Button
        type="dashed"
        style={{ marginTop: 15 }}
        onClick={() => {
          const _data = [...data, ''];
          setData(_data);
          onChange(_data);
        }}>
          {'添加'}
        </Button>}
    </div>
  );
}