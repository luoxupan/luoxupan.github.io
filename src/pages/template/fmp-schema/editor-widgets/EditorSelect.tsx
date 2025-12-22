import { Select, Radio, Divider, Space, Input, Button } from 'antd';
import * as React from 'react';
import { PlusOutlined } from '@ant-design/icons';

export default function (props: any) {

  const {
    dataSource,
    name,
    style,
    mode,
    customSelectData,
    setPath,
    index,
    path,
    canLinkage,
    setCards,
    cards,
    id
  } = props;

  const [data, setData] = React.useState(dataSource.enum || []);
  const [newData, setNewData] = React.useState('');
  const [defaultVal, setDefaultVal]: any = React.useState(undefined);

  React.useEffect(() => {
    setData([...dataSource.enum || []])
  }, [dataSource])

  const onNameChange = (event: any) => {
    setNewData(event.target.value);
  };

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
    setNewData('');
  };

  // 编辑联动组件
  const onEditLinkage = (e: any, value: any) => {
    const _cards = [...cards];
    const curIndex = _cards.findIndex((item) => item.id === id);
    const temp = { ..._cards[curIndex] };
    _cards[curIndex] = temp;

    // 绑定选择的单选值并将当前name标识为父组件name，供关联的子组件使用
    temp.selectValue = value;
    temp.parrentKey = name;

    setCards([..._cards]);
    setPath([...path, index]);
    e.stopPropagation();
  }

  // 展示radio组件的情况：
  // 1.没有选择模式并且单选的数组长度小于四时
  // 2. 选择radio模式
  if ((!mode && (data.length >= 0 && data.length <= 4)) || mode === 'radio') {
    return (
      <>
        <Radio.Group key={name} {...(props as any)}>
          {(data || []).map((option: any, idx: any) => {
            const { value, label } = option;
            return (
              <div style={{ display: 'inline-block' }}>
                <Radio value={value} key={idx}>{label}</Radio>
                {!!canLinkage &&
                  <Button
                    disabled={(!value && value !== 0) || !name}
                    type='text'
                    shape='round'
                    style={{ margin: "12px 12px 0 0" }}
                    onClick={(e) => onEditLinkage(e, value)}
                  >
                    {/* <Icon type="edit" /> */}
                    Edit
                  </Button>
                }
              </div>
            );
          })}
        </Radio.Group>
      </>
    );
  }

  return (
    <Select
      value={defaultVal}
      onChange={(target) => {
        setDefaultVal(target)
      }}
      key={name}
      style={{...style}}
      allowClear
      dropdownRender={menu => (
        <>
          {menu}
          {(customSelectData === undefined || customSelectData) && <>
            <Divider style={{ margin: '8px 0' }} />
            <Space
              align="center"
              style={{ padding: '0 8px 4px' }}>
              <Input
                placeholder="Please enter item"
                value={newData}
                onChange={onNameChange} />
              <Button
                type='link'
                disabled={newData?.length === 0 || !newData}
                onClick={addItem}
                style={{ whiteSpace: 'nowrap' }}>
                <PlusOutlined />
                Add
              </Button>
            </Space>
          </>}
        </>
      )}
    >
      {(data || []).map((option: any, idx: any) => {
        const { label, value } = option;
        return (
          <Select.Option value={value} key={idx}>{label}</Select.Option>
        );
      })}
    </Select>
  );
}