export const tempjson = [
  {
    "type": "Boolean",
    "subType": "Switch",
    "name": "open",
    "label": "Open",
    "label_en": "开关",
    "items": [],
    "required": true,
    "linkage": {},
    "canLinkage": false,
    "automaticKey": false,
    "dataSource": {
      "enum": []
    },
    "config": {
      "defaultValue": true
    },
    "icon": "",
    "id": 1766385861700,
    "active": true
  },
  {
    "type": "Object",
    "subType": "Object",
    "name": "Insurance",
    "label": "保险",
    "label_en": "Insurance",
    "items": [
      {
        "type": "Number",
        "subType": "InputNumber",
        "name": "number",
        "label": "保险计算周期",
        "label_en": "obj01item",
        "items": [],
        "required": true,
        "linkage": {},
        "canLinkage": false,
        "automaticKey": false,
        "dataSource": {
          "enum": []
        },
        "config": {},
        "icon": "",
        "id": 1765159255161,
        "active": true
      }
    ],
    "required": false,
    "linkage": {},
    "canLinkage": false,
    "automaticKey": false,
    "dataSource": {
      "enum": []
    },
    "config": {},
    "icon": "",
    "id": 1765159054720,
    "active": false
  },
  {
    "type": "Text",
    "subType": "",
    "name": "title_str",
    "label": "弹窗标题",
    "label_en": "title str",
    "required": false,
    "icon": "",
    "id": 1766385927372,
    "active": false
  },
  {
    "type": "String",
    "subType": "Input",
    "name": "href_01",
    "label": "跳转链接",
    "label_en": "href 01",
    "items": [],
    "required": true,
    "linkage": {},
    "canLinkage": false,
    "automaticKey": false,
    "dataSource": {
      "enum": []
    },
    "config": {},
    "icon": "",
    "id": 1765159057524,
    "active": false,
    "noDelete": false
  },
  {
    "type": "Number",
    "subType": "NormalArray",
    "name": "array_01",
    "label": "财务标签",
    "label_en": "array 01",
    "items": [],
    "required": false,
    "linkage": {},
    "canLinkage": false,
    "automaticKey": false,
    "dataSource": {
      "enum": []
    },
    "config": {},
    "icon": "",
    "id": 1765159166562,
    "active": false
  },
  {
    "type": "Object",
    "subType": "Array",
    "name": "arr_obj",
    "label": "社保代扣配置",
    "label_en": "Arr Obj",
    "items": [
      {
        "type": "Text",
        "subType": "",
        "name": "i18n",
        "label": "扣款时使用的的文案",
        "label_en": "i18n",
        "required": false,
        "icon": "",
        "id": 1765159583988,
        "active": false
      },
      {
        "type": "String",
        "subType": "Input",
        "name": "string_01",
        "label": "产品线ID",
        "label_en": "string 01",
        "items": [],
        "required": true,
        "linkage": {},
        "canLinkage": false,
        "automaticKey": false,
        "dataSource": {
          "enum": []
        },
        "config": {},
        "icon": "",
        "id": 1765176519446,
        "active": true
      }
    ],
    "required": false,
    "linkage": {},
    "canLinkage": false,
    "automaticKey": false,
    "dataSource": {
      "enum": []
    },
    "config": {},
    "icon": "",
    "id": 1765159394863,
    "active": false
  },
  {
    "type": "Object",
    "subType": "Object",
    "name": "obj_02",
    "label": "出车拦截配置",
    "label_en": "obj 02",
    "items": [
      {
        "type": "Object",
        "subType": "Object",
        "name": "obj_02",
        "label": "需拦截出车阈值",
        "label_en": "obj 02",
        "items": [
          {
            "type": "Boolean",
            "subType": "Switch",
            "name": "field_03",
            "label": "需签名提醒",
            "label_en": "boolean_03",
            "items": [],
            "required": false,
            "linkage": {},
            "canLinkage": false,
            "automaticKey": false,
            "dataSource": {
              "enum": []
            },
            "config": {},
            "icon": "",
            "id": 1766381679413,
            "active": true
          }
        ],
        "required": false,
        "linkage": {},
        "canLinkage": false,
        "automaticKey": false,
        "dataSource": {
          "enum": []
        },
        "config": {},
        "icon": "",
        "id": 1766381612863,
        "active": true
      },
      {
        "type": "DatePicker",
        "subType": "DatePicker",
        "name": "field_01",
        "label": "日期",
        "label_en": "date",
        "items": [],
        "required": true,
        "linkage": {},
        "canLinkage": false,
        "automaticKey": false,
        "dataSource": {
          "enum": []
        },
        "config": {},
        "icon": "",
        "id": 1766381650598,
        "active": false
      }
    ],
    "required": false,
    "linkage": {},
    "canLinkage": false,
    "automaticKey": false,
    "dataSource": {
      "enum": []
    },
    "config": {},
    "icon": "",
    "id": 1766381461524,
    "active": false
  }
];