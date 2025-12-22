import { BaseField } from '../icons/BaseField';
import { String } from '../icons/String';
import { Image } from '../icons/Image';
import { ID } from '../icons/ID';

export default [
  {
    type: 'String',
    subType: 'Input',
    name: '',
    label: 'Json Field',
    label_en: '',
    items: [],
    required: false,
    Icon: BaseField,
    linkage: {}, // 组件联动配置
    canLinkage: false, // 组件联动开关
    automaticKey: false, // 自动拼接父组件key开关
    dataSource: {
      enum: [
        // { key: '选项A', value: 'A' },
      ],
    },
    config: {} //组件配置
  },
  {
    type: 'Text',
    subType: '',
    name: '',
    label: 'I18n 文案',
    label_en: '',
    required: false,
    Icon: String,
  },
  {
    type: 'Image',
    subType: '',
    name: '',
    label: 'Image',
    label_en: '',
    required: false,
    Icon: Image,
  },
  {
    type: 'UniId',
    subType: '',
    name: '',
    label: '唯一 ID',
    label_en: '',
    required: false,
    Icon: ID,
  },
]
