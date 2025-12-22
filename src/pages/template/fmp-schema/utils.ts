import * as React from 'react';
import { Modal, notification } from 'antd';

// 将联动组件的对象数组打平
  const tieLinkage = (schema: any, version?: any) => {
    let tmp: any = [];

    // 如果是apollo组件，则直接将schema返回
    if (version !== 'apollo') {
      (schema || [])?.map((it: any) => {
        if (!!it?.canLinkage) {
          for (const value in it?.linkage) {
            tmp = [
              ...tmp,
              // ...it?.linkage?.[value],
              ...tieLinkage(it?.linkage?.[value], version)
            ]
          }
        }

        tmp = [
          ...tmp,
          it
        ]
      });

      return tmp;
    } else {
      return schema
    }
  }

const map: any = {
  'Number': 0,
  'String': '',
  'Boolean': true,
  'DatePicker': '',
  'Text': '',
  'Image': '',
};

const defaultValue = (defaultData: any) => {
  return {
    'Number': Number(defaultData),
    'String': defaultData
  } as any
}

export function getSchemaField(schema: any, object: any) {
  let arr: any = tieLinkage(schema);

  arr?.forEach(({ name, type, subType, items, config, defaultData }: any) => {
    if (type === 'Object') {
      const o = getSchemaField(items, {});
      if (subType === 'Array') {
        object[name] = [o];
      }
      if (subType === 'Object') {
        object[name] = o;
      }
    } else if (['NormalArray', 'MultilSelect'].includes(subType)) {
      object[name] = [map[type]];
    } else {
      object[name] = defaultValue(!config ? defaultData : config?.defaultValue)[type] || map[type];
    }
  });
  return object;
}

export function useDebounce(fn: any, delay: any) {
  const ref = React.useRef({ fn, timer: null } as any);

  React.useEffect(function () {
    ref.current.fn = fn;
  }, [fn]);

  return React.useCallback(function (...args: any) {
    // @ts-ignore
    const self = this;
    if (ref.current.timer) {
      clearTimeout(ref.current.timer);
    }
    ref.current.timer = setTimeout(function () {
      ref.current.fn.apply(self, args);
    }, delay);
  }, []);
}

// 递归检查嵌套字段
export const mapMoListArr = (arr: any, res: any, islinkage?: any, parrent?: any, automatic?: any) => {
  for (const key in arr) {
    const { canLinkage, linkage, items, name, parrentKey, automaticKey } = arr[key];

    // 校验联动组件的name是否为空并且打开了自动拼接key的开关
    if (!!islinkage && !!automatic) {
      if (!(name || '')?.slice(0)?.replace(`${parrent}_`, '') ) {
        res.title = '请注意填写组件或嵌套组件的必填项'
        res.flag = false;
        break;
      }
    }

    if (Object.keys(arr[key]).some(v => {
      if (['name', 'label', 'label_en'].includes(v) && arr[key][v] === '') {
        res.title = '请注意填写组件或嵌套组件的必填项'
        return true
      }

      if ('dataSource' === v && arr[key][v]?.enum) {
        if (arr[key][v]?.enum?.filter((it: any) => {
          return (!it.value && it.value !== 0) || !it.label?.trim() || !it.label
        })?.length > 0) {
          res.title = '请将相关组件的数据源信息填写完整'
          return true
        }
      }
    })) {
      res.flag = false;
      break;
    } else {
      // 将联动组件的对象数组数据打平
      let linkageAll: any = [];

      if (!!canLinkage) {
        for (const link in linkage) {
          linkageAll = [
            ...linkageAll,
            ...(linkage?.[link] || [])
          ]
        }

        !!linkageAll?.length && mapMoListArr(linkageAll, res, canLinkage, parrentKey, automaticKey);
      }

      !!items?.length && mapMoListArr(items, res);
    }
  }
}

// 检查模版的字段
export const CheckMapMoListArr = (arr: any, noModal?: any) => {
  let res = {
    flag: true,
    title: ''
  }

  mapMoListArr(arr, res);

  if (!res.flag && !noModal) {
    Modal.info({
      className: 'uni-modal',
      key: new Date().getTime(),
      content: res.title,
      onOk: () => {
      }
    } as any);
    throw new Error();
  }

  return res.flag;
}

// 多details固定结构
export const InitMultipleDetails = (screen: any) => {
  const COMMON = {
    "config": {},
    "dataSource": {
      "enum": []
    } as any,
    "icon": "",
    "label": "Json Field",
    "label_en": "",
    "required": false,
    "noDelete": true,
  }

  const details = (screen || [])?.map((it: any, ind: any) => ({
    ...COMMON,
    "active": ind === 0 ? true : false,
    "items": [] as any,
    "id": new Date().getTime() + ind + 1,
    "name": it,
    "subType": "Input",
    "type": "String"
  }))

  return [
    {
      ...COMMON,
      "active": true,
      "id": new Date().getTime(),
      "items": details,
      "name": "__details",
      "subType": "Array",
      "type": "Object"
    }
  ]
}

// 提示
const openNotification = (title: any, noNotificate: any) => {
  if (!noNotificate) {
    notification.error({
      key: 'updatable',
      message: '模板结构不符合要求',
      description: title,
      placement: 'topLeft',
      duration: 3
    });
  }

  throw Object.assign(new Error(title), {
    errorType: 'details'
  });
};

// 多details不可删除
export const NoDeleteMultipleDetails = (screen: any, current: any) => {
  if (current[0]?.name === '__details' && screen?.length) {
    current[0].noDelete = true;
  } else {
    current[0].noDelete = false;
  }

  const res = (current[0]?.items || [])?.map((it: any) => {
    if ((screen || []).includes(it?.name)) {
      it.noDelete = true;
    } else {
      it.noDelete = false;
    }

    return it;
  })

  current[0].items = res;

  return current;
}

// 格式化模版数据
export const FormatTemplateData = (multi_detail_params: any, properties: any) => {
  let res = [];

  // 需要区分是不是多details模版，再进行赋值和初始化
  if (multi_detail_params?.length) {
    res = !properties?.length ? InitMultipleDetails(multi_detail_params) : NoDeleteMultipleDetails(multi_detail_params, properties);
  } else if (properties && properties[0]?.name === '__details') {
    res = NoDeleteMultipleDetails(multi_detail_params, properties);
  } else {
    res = properties;
  }

  return res
}