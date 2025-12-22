import { Switch, Button } from 'antd';
import * as React from 'react';
import { EditOutlined } from '@ant-design/icons';

export default function (props: any) {
  const {
    setPath,
    index,
    path,
    canLinkage,
    name,
    setCards,
    cards,
    id,
  } = props;

  // 因为boolean只有两个值（true/false），所以这里写死
  const data = [
    {
      label: "true",
      key: true,
      value: true
    },
    {
      label: "false",
      key: false,
      value: false
    },
  ]

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

  return (
    <>
      {!!canLinkage ?
        data.map(it => {
          return <>
            <Switch checked={it?.value} />
            {!!canLinkage &&
              <Button
                type='text'
                shape='round'
                disabled={!name}
                style={{ margin: '0 12px' }}
                onClick={(e) => onEditLinkage(e, it?.value)}
              >
                <EditOutlined />
                Edit
              </Button>
            }
          </>
        }) :
        <Switch />
      }
    </>
  );
}