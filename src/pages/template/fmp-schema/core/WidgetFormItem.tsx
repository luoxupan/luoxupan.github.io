import * as React from 'react';
import { ConnectDropTarget, ConnectDragSource, DropTargetMonitor, DragSourceMonitor } from 'react-dnd'
import { DragSource, DropTarget, DropTargetConnector, DragSourceConnector } from 'react-dnd'
import { ItemTypes } from './ItemTypes'
import { XYCoord } from 'dnd-core';
import './WidgetFormItem.less';
import { Delete } from '../../icons/Delete';
import { Copy } from '../../icons/Copy';
import { getSubType } from '../type';
import { Tooltip } from 'antd';
import { cloneDeep } from 'lodash';


export interface WidgetFormItemProps {
  id: any
  text: string
  index: number
  moveCard: (dragIndex: number, hoverIndex: number) => void
  isDragging: boolean
  connectDragSource: ConnectDragSource
  connectDropTarget: ConnectDropTarget
}

interface CardInstance {
  getNode(): HTMLDivElement | null
}

const WidgetFormItem = React.forwardRef((props: any, ref: any) => {
  const { formData, isDragging, connectDragSource, connectDropTarget, index, cards, setCards, path, setPath, flag } = props;
  const { id, type, name, label, label_en, active, dataSource, subType, icon, defaultData, config, noDelete } = formData;
  const elementRef = React.useRef(null);
  connectDragSource(elementRef);
  connectDropTarget(elementRef);

  // if (id === -1) {
  //   return null;
  // }

  const opacity = isDragging ? 0 : 1
  React.useImperativeHandle<any, CardInstance>(ref, () => {
    return {
      getNode: () => elementRef.current,
    };
  });

  const [hover, setHover] = React.useState(false);

  let _style = {};
  if (id === -1) {
    _style = { padding: '40px 0', border: 'unset' };
  }

  if (flag === false) {
    _style = {
      backgroundColor: '#fff1f0',
    } as any;
  }

  if (active === true) {
    _style = {
      backgroundColor: '#ebf8fb',
      borderLeft: '4px solid #0098f0',
    } as any;
  }

  const TypeForm = getSubType(type, subType);
  // 组件配置里的默认值只用来给中间预览区展示，不能挂到共享的 editorProps 上
  // （否则同类型的其它卡片会一起被改掉）
  const editorProps = TypeForm?.editorProps;
  const editorValue = !config ? defaultData : config?.defaultValue;

  const setCardActive = (cards: any, index: any) => {
    const _cards = [...cards];
    _cards.forEach((item) => item.active = false);
    _cards[index].active = true;
    setCards(_cards);
  }

  return (
    <div
      ref={elementRef}
      className='widget-form-item'
      style={{ ..._style, opacity }}
      onClick={() => {
        setCardActive(cards, index);
      }}
      onMouseOver={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}>
      {id === -1
        ? ''
        : <div className='form-info'>
          <div className='form-label'>{label}：</div>
          <div className='form-field'>
            {!name && <span className='none-key'>
              <svg viewBox="64 64 896 896" focusable="false" data-icon="warning" width="1em" height="1em" fill="currentColor" aria-hidden="true"><path d="M464 720a48 48 0 1 0 96 0 48 48 0 1 0-96 0zm16-304v184c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8V416c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8zm475.7 440l-416-720c-6.2-10.7-16.9-16-27.7-16s-21.6 5.3-27.7 16l-416 720C56 877.4 71.4 904 96 904h832c24.6 0 40-26.6 27.7-48zm-783.5-27.9L512 239.9l339.8 588.2H172.2z"></path></svg>
                  未设置 key
                </span>}
            {name && (active || hover) && <span >{name}</span>}
            {icon && (active || hover) && <Tooltip title={icon} placement="topLeft">
              {/* <Icon style={{ color: 'gray', marginLeft: 10 }} type="exclamation-circle" /> */}
            </Tooltip>}
          </div>
          {
            TypeForm?.EditorComponent &&
            <TypeForm.EditorComponent
              {...editorProps}
              {...config}
              {...formData}
              value={editorProps ? editorValue : true}
              index={index}
              path={path}
              setPath={setPath}
              cards={cards}
              setCards={setCards}
            />
          }
        </div>}
      {(id !== -1 && (active || hover)) && <div
        className='copy'
        onClick={(event) => {
          const _cards = [...cards];
          const cloneNode = {
            ...cloneDeep(cards[index]),
            name: '',
            // id: Math.max(..._cards.map(({id}) => id), 0) + 1,
            id: new Date().getTime(),
            label: (cards[index].label || '') + ' copy',
            label_en: (cards[index].label_en || '') + ' copy',
            noDelete: false,
          };
          _cards.splice(index + 1, 0, cloneNode);
          setCardActive(_cards, index + 1);
          event.stopPropagation();
        }}>
        <Copy />
      </div>}
      {(id !== -1 && (active || hover)) && <div
        className={noDelete ? 'no-delete delete' : 'delete'}
        onClick={(event) => {
          const _cards = [...cards];
          _cards.splice(index, 1);
          setCards(_cards);
          event.stopPropagation();
        }}>
        <Delete />
      </div>}
      {!flag && <Tooltip className='must' title={"请注意填写该组件或该组件的嵌套组件的必填项或相关数据源"}>
        {/* <Icon type="alert" /> */}
      </Tooltip>}
    </div>
  )
})

export default DropTarget(
  ItemTypes.WidgetFormItem,
  {
    hover(props: WidgetFormItemProps, monitor: DropTargetMonitor, component: CardInstance) {
      if (!component) {
        return null
      }
      // node = HTML Div element from imperative API
      const node = component.getNode()
      if (!node) {
        return null
      }

      const dragIndex = monitor.getItem<any>().index
      const hoverIndex = props.index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = node.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      // Time to actually perform the action
      props.moveCard(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      monitor.getItem<any>().index = hoverIndex
    },
  },
  (connect: DropTargetConnector, monitor: DropTargetMonitor) => {
    return {
      connectDropTarget: connect.dropTarget(),
    };
  },
)(DragSource(
  ItemTypes.WidgetFormItem,
  {
    beginDrag: (props: WidgetFormItemProps) => {
      return {
        id: props.id,
        index: props.index,
      };
    },
  },
  (connect: DragSourceConnector, monitor: DragSourceMonitor) => {
    return {
      connectDragSource: connect.dragSource(),
      isDragging: monitor.isDragging(),
    };
  },
)(WidgetFormItem))

