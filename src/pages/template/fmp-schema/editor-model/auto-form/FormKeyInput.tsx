import { Input, Modal } from 'antd';
import * as React from 'react';

export default function (props: any) {
  const { value, onChange, cards, disabled, parrentKey, automaticKey } = props;

  // 是否自动增加父组件key前缀
  const automatic = !!parrentKey && !!automaticKey;

  const [curValue, setCurValue]: any = React.useState(undefined); // 当前input框显示的值

  React.useEffect(() => {
    // 如果自动增加父组件前缀，那么判空的时候将父组件剔除掉
    if (!!automatic) {
      setCurValue((value || '')?.slice(0)?.replace(`${parrentKey}_`, ''))
    } else {
      setCurValue(value)
    }
  }, [value])

  // 失去焦点的时候，对组件key进行重复判断
  const onBlur = () => {
    if (!curValue) {
      return;
    }

    if (cards?.filter((item: any) => item?.name === value)?.length >= 2) {
      Modal.info({
        className: 'uni-modal',
        content: '当前key与同层级其他组件key相同，请重新输入',
        onOk: () => {
          onChange(!!automatic ? `${parrentKey}_` : '');
        }
      });
    }
  }

  // key变化时，将父组件key自动拼接上
  const onValChange = ({ target }: any) => {
    const val =
      !!automatic ?
        `${parrentKey}_${target.value}` :
        target.value;

    setCurValue(val);
    onChange(val);
  }

  return (
    <>
      <Input
        addonBefore={
          !!automatic ?
            `${parrentKey}_` :
            false
        }
        value={curValue}
        onBlur={onBlur}
        disabled={disabled}
        onChange={onValChange}
      />
    </>
  );
}