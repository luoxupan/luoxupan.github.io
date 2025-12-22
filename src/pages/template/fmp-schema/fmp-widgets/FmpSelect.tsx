import { Select, Radio, Divider, Space, Input, Button, InputNumber } from 'antd';
import * as React from 'react';

export function FmpSelect(props: any) {

  const { dataSource, name, onChange, mode, type, value, customSelectData } = props;

  const [data, setData] = React.useState(dataSource.enum || []);
  const [newData, setNewData]: any = React.useState(undefined);
  const [defaultVal, setDefaultVal]: any = React.useState(undefined);

  React.useEffect(() => {
    setData([...dataSource.enum || []])
  }, [dataSource])

  React.useEffect(() => {
    setDefaultVal(value)
  }, [value])

  const addItem = (e: any) => {
    e.preventDefault();
    setData([
      ...data,
      {
        value: newData,
        label: newData
      }
    ]);
    setDefaultVal(newData)
    onChange(newData);
    setNewData('');
  };

  if ((!mode && (data.length >= 0 && data.length <= 4)) || mode === 'radio') {
    return (
      <Radio.Group key={name} {...(props as any)}>
        {(data || []).map((option: any, idx: any) => {
          const { value, label } = option;
          return (
            <Radio value={value} key={idx}>{label}</Radio>
          );
        })}
      </Radio.Group>
    );
  }

  return (
    <Select
      {...(props as any)}
      value={defaultVal}
      allowClear
      key={name}
      onChange={(target) => {
        setDefaultVal(target)
        onChange(target);
      }}
      dropdownRender={menu => (
        <>
          {menu}
          {(customSelectData === undefined || customSelectData)&& <>
            <Divider style={{ margin: '8px 0' }} />
            <Space
              align="center"
              style={{ padding: '0 8px 4px' }}>
              {
                type === 'Number' && <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Please enter item"
                  value={newData}
                  onChange={value => {
                    setNewData(value);
                  }}
                />
              }
              {
                type !== 'Number' && <Input
                  style={{ width: '100%' }}
                  placeholder="Please enter item"
                  value={newData}
                  onChange={event => {
                    setNewData(event?.target?.value);
                  }}
                  onBlur={event => {
                    setNewData(event?.target?.value?.trim());
                  }} />
              }
              <Button
                type='link'
                onClick={addItem}
                style={{ whiteSpace: 'nowrap' }}
                disabled={newData?.length === 0 || !newData}>
                {/* <Icon type="plus" />  */}
                Add
              </Button>
            </Space>
          </>}
        </>
      )}
    >
      {(data || []).map((option: any, idx: any) => {
        const { value, label } = option;
        return (
          <Select.Option value={value} key={idx}>{label}</Select.Option>
        );
      })}
    </Select>
  );
}