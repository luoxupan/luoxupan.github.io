import { Input, InputNumber, Switch } from 'antd';
import { FmpRadio } from './fmp-widgets/FmpRadio';
import { FmpDatePicker } from './fmp-widgets/FmpDatePicker';
import { FmpTimePicker } from './fmp-widgets/FmpTimePicker';
import { FmpInputNumber } from './fmp-widgets/FmpInputNumber';
import { FmpInput } from './fmp-widgets/FmpInput';
import { FmpText } from './fmp-widgets/FmpText';
import { FmpImage } from './fmp-widgets/FmpImage';
import { FmpSwitch } from './fmp-widgets/FmpSwitch';
import { FmpObject } from './fmp-widgets/FmpObject';
import { FmpArray } from './fmp-widgets/FmpArray';
import { FmpNormalArray } from './fmp-widgets/FmpNormalArray';
import { FmpSelect } from './fmp-widgets/FmpSelect';
import { FmpMultilSelect } from './fmp-widgets/FmpMultilSelect';
import { FmpUniID } from './fmp-widgets/FmpUniID';
import EditorObject from './editor-widgets/EditorObject';
import EditorArray from './editor-widgets/EditorArray';
import EditorNormalArray from './editor-widgets/EditorNormalArray';
import EditorSelect from './editor-widgets/EditorSelect';
import EditorSwitch from './editor-widgets/EditorSwitch';
import EditorMultilSelect from './editor-widgets/EditorMultilSelect';
import EditorRadio from './editor-widgets/EditorRadio';
import EditorImage from './editor-widgets/EditorImage';
import EditorText from './editor-widgets/EditorText';
import EditorUniID from './editor-widgets/EditorUniID';
import EditorDatePicker from './editor-widgets/EditorDatePicker';
import EditorTimePicker from './editor-widgets/EditorTimePicker';
import BaseFieldModel from './editor-model/base-field';
import BaseModel from './editor-model/base';

/** 基础类型 =====开始===== */
const base: any = {
  Input: {
    EditorComponent: Input,
    SchemaComponent: FmpInput,
    editorProps: {
      autoComplete: 'off',
      style: {
        width: '50%',
        marginTop: 15
      }
    },
    model: [
      BaseFieldModel
    ],
    // 将首尾空格拦截下掉
    // validator: () => {
    //   return async (r, v) => {
    //     if (v?.length > 0) {
    //       if (/(^\s+)|(\s+$)/.test(v)) {
    //         throw '首/尾有空格';
    //       }
    //     }
    //   }
    // }
  },
  InputNumber: {
    EditorComponent: InputNumber,
    SchemaComponent: FmpInputNumber,
    editorProps: {
      style: {
        width: '50%',
        marginTop: 15
      }
    },
    model: [
      BaseFieldModel,
    ],
    validator: (config: any) => {
      return async (r: any, v: any) => {
        if (v || v === 0) {
          if ((v > config?.max && (config?.max || config?.max === 0)) || (v < config?.min && (config?.min || config?.min === 0) )) {
            throw `输入范围：${config?.min}-${config?.max}`;
          }
        }
      }
    },
    props: {
      label: (config: any) => {
        if((config?.precision)){
          return `至多保留${config?.precision}位小数`
        } else if (config?.precision === 0) {
          return `保留整数`
        }
      }
    }
  },
  NormalArray: {
    EditorComponent: EditorNormalArray,
    SchemaComponent: FmpNormalArray,
    model: [
      BaseFieldModel,
    ]
  },
  Array: {
    EditorComponent: EditorArray,
    SchemaComponent: FmpArray,
    model: [
      BaseFieldModel,
    ]
  },
  Object: {
    EditorComponent: EditorObject,
    SchemaComponent: FmpObject,
    model: [
      BaseFieldModel,
    ]
  },
  Select: {
    EditorComponent: EditorSelect,
    SchemaComponent: FmpSelect,
    editorProps: {
      style: {
        width: '50%',
        marginTop: 15
      }
    },
    model: [
      BaseFieldModel,
    ],
  },
  MultilSelect: {
    EditorComponent: EditorMultilSelect,
    SchemaComponent: FmpMultilSelect,
    editorProps: {
      style: {
        width: '50%',
        marginTop: 15
      }
    },
    model: [
      BaseFieldModel,
    ],
  },
  Radio: {
    EditorComponent: EditorRadio,
    SchemaComponent: FmpRadio,
    editorProps: {
      marginTop: 15
    }
  },
  Switch: {
    EditorComponent: EditorSwitch,
    SchemaComponent: FmpSwitch,
    editorProps: {
      marginTop: 15
    },
    model: [
      BaseFieldModel,
    ]
  },
  DatePicker: {
    EditorComponent: EditorDatePicker,
    SchemaComponent: FmpDatePicker,
    editorProps: {
      style: {
        width: '50%',
        marginTop: 15
      },
    },
    model: [
      BaseFieldModel,
    ]
  },
  DatePickerShowTime: {
    EditorComponent: EditorDatePicker,
    SchemaComponent: FmpDatePicker,
    editorProps: {
      style: {
        width: '50%',
        marginTop: 15
      },
      showTime: true
    },
    props: {
      showTime: true
    },
    model: [
      BaseFieldModel,
    ]
  },
  TimePicker: {
    EditorComponent: EditorTimePicker,
    SchemaComponent: FmpTimePicker,
    editorProps: {
      style: {
        width: '50%',
        marginTop: 15
      },
    },
    model: [
      BaseFieldModel,
    ]
  },
};
/** 基础类型 =====结束===== */


/** 业务类型 =====开始===== */
const business: any = {
  Text: {
    EditorComponent: EditorText,
    SchemaComponent: FmpText,
    model: [
      BaseModel,
    ],
    props: {
      label: () => {
        return '点击这里可查看I18n对应的文案'
      }
    }
  },
  Image: {
    EditorComponent: EditorImage,
    SchemaComponent: FmpImage,
    model: [
      BaseModel,
    ],
    props: {
      label: () => {
        return '点击查看图片'
      }
    }
  },
  UniId: {
    EditorComponent: EditorUniID,
    SchemaComponent: FmpUniID,
    model: [
      BaseModel,
    ],
  },
};
/** 业务类型 =====结束===== */

function subTypes(array: any) {
  const arr = array.map((key: any) => ({ [key]: base[key] }));
  return arr.reduce((acc: any, cur: any) => ({ ...acc, ...cur }), {});
}

const _Types: any = {
  Number: {
    name: 'Number',
    label: '数字',
    defaultSubType: 'InputNumber',
    styleType: [
      { name: '默认', value: 'InputNumber' },
      { name: '单选', value: 'Select' },
      { name: '多选', value: 'MultilSelect' },
      { name: '数组', value: 'NormalArray' },
    ],
    subTypes: subTypes([
      'InputNumber', 'Select', 'MultilSelect', 'NormalArray'
    ]),
  },
  String: {
    name: 'String',
    label: '字符串',
    defaultSubType: 'Input',
    styleType: [
      { name: '默认', value: 'Input' },
      { name: '单选', value: 'Select' },
      { name: '多选', value: 'MultilSelect' },
      { name: '数组', value: 'NormalArray' },
    ],
    subTypes: subTypes([
      'Input', 'Select', 'MultilSelect', 'NormalArray'
    ]),
  },
  Boolean: {
    name: 'Boolean',
    label: 'Boolean',
    defaultSubType: 'Switch',
    styleType: [
      { name: '默认', value: 'Switch' },
    ],
    subTypes: subTypes([
      'Switch'
    ]),
  },
  Object: {
    name: 'Object',
    label: '对象',
    defaultSubType: 'Object',
    styleType: [
      { name: '默认', value: 'Object' },
      { name: '数组', value: 'Array' },
    ],
    subTypes: subTypes([
      'Object', 'Array'
    ]),
  },
  DatePicker: {
    name: 'DatePicker',
    label: '日期',
    defaultSubType: 'DatePicker',
    styleType: [
      { name: '默认', value: 'DatePicker' },
      { name: '年月日时分秒', value: 'DatePickerShowTime' },
      { name: '时分秒', value: 'TimePicker' },
    ],
    subTypes: subTypes([
      'DatePicker',
      'DatePickerShowTime',
      'TimePicker',
    ]),
  }
};

export const Types = (() => {
  const keys = Object.keys(_Types);
  const types = keys.map((key) => ({
    name: _Types[key]?.name,
    label: _Types[key]?.label
  }));
  return types;
})();

export const getStyleType = (type: any) => {
  return _Types[type]?.styleType;
}

export const getDefaultSubType = (type: any) => {
  return _Types[type]?.defaultSubType;
}

export const getSubType = (type: any, subType: any) => {
  if (subType) {
    return _Types[type]?.subTypes[subType];
  }
  return business[type];
}

export const isBaseField = (type: any, subType: any) => {
  // 判断是否为基础字段
  if (type === 'Object' && subType === 'Object') {
    return false;
  }
  if (type === 'Object' && subType === 'Array') {
    return false;
  }
  if (subType === 'NormalArray') {
    return false;
  }
  return true;
}
