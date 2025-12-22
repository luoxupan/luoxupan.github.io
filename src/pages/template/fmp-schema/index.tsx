import * as React from 'react';
import { Radio, message } from 'antd';
import './index.less';
import WidgetFormItem from './core/WidgetFormItem';
import WidgetEditorForm from './core/WidgetEditorForm';
import ComponentCard from './core/ComponentCard';
import WidgetsFormConfig from './ComponentBar';
import { JsonEdit } from '../components/JsonEdit';
import { FmpForm } from './fmp-form/index';
import { CheckMapMoListArr } from './utils'

const ComponentCardConfig = [
  ...WidgetsFormConfig
];

let timer: any = undefined;

export const Template = React.forwardRef((props: any, ref: any) => {
  const eleRef = React.useRef(null as any);
  const [type, setType]: any = React.useState(1);
  const [path, setPath]: any = React.useState([]);
  const [cards, setCards]: any = React.useState([]);
  const { disabled = false } = props

  const ruleRef = React.useRef(null as any);
  const [visible, setVisible]: any = React.useState(false);

  React.useImperativeHandle(ref, () => ({
    getFormData: () => {
      return cards;
    },
    setFormData: (data: any) => {
      setCards(data);
    },
    getRulesData: () => {
      return {};
      // return ruleRef.current.getRulesData()
    },
    //form表单校验
    getRulesValidate: {},

    setRuleData: (data: any) => {
      // ruleRef.current.setRuleData(data)
    }
  }));

  const _getCurCards = React.useCallback((path: any, cards: any) => {
    return path.reduce((_: any, val: any) => {
      // 联动组件从item字段里获取到模版值
      if (_[val]?.canLinkage === true) {
        return _[val]?.linkage?.[_[val]?.selectValue] || []
      } else {
        return _[val]?.items || [];
      }
    }, cards) || [];
  }, []);

  const curCards = _getCurCards(path, cards);
  const len = path.length - 1;
  const _path = path.slice(path, len);
  const parrentCard = _getCurCards(_path, cards);
  const { label, selectValue, parrentKey, automaticKey, canLinkage } = parrentCard[path[path.length - 1]] || {};

  const _setPath = (_path: any) => {
    setPath(_path);
  };

  const _setCards = (data: any) => {
    if (path.length === 0) {
      setCards(data);
    } else {
      const currentCard = parrentCard[path[len]];
      // 如果是联动组件
      if (currentCard?.canLinkage === true) {
        // 兼容json导入历史模版，此时json没有linkage字段
        if (!currentCard.linkage) {
          currentCard.linkage = {};
        }

        // 更新联动组件的字典
        currentCard.linkage[currentCard.selectValue] = data
      } else {
        currentCard.items = data;
      }
      setCards([...cards]);
    }
  };

  const moveCard = (dragIndex: number, hoverIndex: number) => {
    // const dragCard = curCards[dragIndex];
    if (dragIndex === undefined) {
      dragIndex = 0;
    }

    const _cards = [...curCards];
    const temp = _cards[dragIndex];
    _cards[dragIndex] = _cards[hoverIndex];
    _cards[hoverIndex] = temp;
    _setCards(_cards);
  };

  const main = (
    <div className='editor-main' style={{ display: type === 2 ? 'none' : '' }}>
      <div className='editor-left-center' >
        <div className='top' >
          <div className='editor-left'>
            {ComponentCardConfig.map((item, idx) => {
              return (
                <ComponentCard key={idx} config={item} cards={curCards} setCards={_setCards} />
              );
            })}
          </div>
          <div className='editor-center'>
            {path.map((_: any, idx: any) => {
              return (
                <div className='widget-form-item-panel' key={idx} style={{ left: idx * 20 }}>
                  <div className='ant-ribbon' style={{ top: `${idx * 30}px` }}>
                    <span>{idx + 1}</span>
                  </div>
                </div>
              );
            })}
            <div
              className='widget-form-item-panel'
              style={{ left: path.reduce((sum: any) => sum + 20, 0) }}>
              {path.length > 0 && <>
                <div style={{ borderTop: 'unset' }} className="ant-divider ant-divider-horizontal      ant-divider-with-text-left" role="separator">
                  <span className="ant-divider-inner-text">
                    {
                      selectValue !== undefined ?
                        `${label} / ${selectValue}` :
                        label
                    }
                  </span>
                </div>
                <i
                  aria-label="icon: close"
                  className="anticon anticon-close widget-form-item-panel-close"
                  onClick={() => {
                    const _path = [...path];
                    _path.pop();
                    _setPath(_path);
                  }}>
                  <svg viewBox="64 64 896 896" focusable="false" data-icon="close" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                    <path d="M563.8 512l262.5-312.9c4.4-5.2.7-13.1-6.1-13.1h-79.8c-4.7 0-9.2 2.1-12.3 5.7L511.6 449.8 295.1 191.7c-3-3.6-7.5-5.7-12.3-5.7H203c-6.8 0-10.5 7.9-6.1 13.1L459.4 512 196.9 824.9A7.95 7.95 0 0 0 203 838h79.8c4.7 0 9.2-2.1 12.3-5.7l216.5-258.1 216.5 258.1c3 3.6 7.5 5.7 12.3 5.7h79.8c6.8 0 10.5-7.9 6.1-13.1L563.8 512z"></path>
                  </svg>
                </i>
              </>
              }
              {curCards.map((card: any, idx: any) => {
                return <WidgetFormItem
                  index={idx}
                  id={card.id}
                  // key={card.id}
                  key={idx}
                  cards={curCards}
                  formData={card}
                  path={path}
                  setPath={_setPath}
                  flag={(() => CheckMapMoListArr([card], true))()}
                  setCards={_setCards}
                  moveCard={moveCard}
                />
              })}
            </div>
          </div>
        </div>
      </div>
      <div className='editor-right'>
        {
          curCards.length > 0 &&
          <WidgetEditorForm
            cards={curCards}
            setCards={_setCards}
            canLinkage={canLinkage}
            parrentKey={parrentKey}
            automaticKey={automaticKey}
          />
        }
      </div>
    </div>
  );

  return (
    <div className='editor-contain'>
      <Radio.Group
        value={type}
        style={{
          flexDirection: 'column',
          display: 'flex',
          flexShrink: 0,
          marginRight: 5
        }}
        onChange={({ target }) => {
          setType(target.value);
          if (target.value === 2) {
            eleRef.current.setValue(cards);
          }
        }}>
        <Radio.Button value={1}>View Edit</Radio.Button>
        <Radio.Button value={2}>Source Edit</Radio.Button>
      </Radio.Group>
      {main}
      <div className='edit-source' style={{ display: type === 1 ? 'none' : '' }}>
        <div className='edit-source-top'></div>
        <div className='edit-source-bottom'>
          <JsonEdit
            ref={eleRef}
            readOnly={false}
            style={{ height: '100%', width: '50%' }}
            onChange={function (data: any) {
              try {
                if (timer) {
                  clearTimeout(timer);
                }
                timer = setTimeout(() => {
                  const value = eleRef.current.getValue();
                  if (Array.isArray(value)) {
                    setCards(value);
                  } else {
                    message.error('最外层应该是Array！');
                  }
                }, 1000);
              } catch (error) {
                console.log(error);
              }
            }} />
          <div className='edit-view'>
            <FmpForm schema={cards} />
          </div>
        </div>
      </div>
    </div>
  );
});
