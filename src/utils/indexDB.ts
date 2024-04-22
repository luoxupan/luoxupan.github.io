const conf = {
  db_name: 'help.didiglobal.com',
  version: 1,
  object_store: 'api-data',
};

export const isEqual = <TType>(x: TType, y: TType): boolean => {
  if (Object.is(x, y)) return true
  if (x instanceof Date && y instanceof Date) {
    return x.getTime() === y.getTime()
  }
  if (x instanceof RegExp && y instanceof RegExp) {
    return x.toString() === y.toString()
  }
  if (
    typeof x !== 'object' ||
    x === null ||
    typeof y !== 'object' ||
    y === null
  ) {
    return false
  }
  const keysX = Reflect.ownKeys(x as unknown as object) as (keyof typeof x)[]
  const keysY = Reflect.ownKeys(y as unknown as object)
  if (keysX.length !== keysY.length) return false
  for (let i = 0; i < keysX.length; i++) {
    if (!Reflect.has(y as unknown as object, keysX[i])) return false
    if (!isEqual(x[keysX[i]], y[keysX[i]])) return false
  }
  return true
}

export class IndexDB {
  static _db = undefined as any;
  static _init_promise = undefined as any;
  // 当前浏览器是否支持indexDB
  static _index_db_support = 'indexedDB' in window ? true : false;
  static init() {
    // @ts-ignore
    window.IndexDB = IndexDB;
    // 必须传入用户ticket作为用户唯一标识
    if (IndexDB._index_db_support) {
      // @ts-ignore
      IndexDB._init_promise = new Promise((resolve: Function, reject: Function) => {
        const request = window.indexedDB.open(conf.db_name, conf.version);
        request.onerror = (event) => {
          reject(event);
        };
        request.onupgradeneeded = (event: any) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(conf.object_store)) {
            db.createObjectStore(conf.object_store);
          }
        };
        request.onsuccess = (event: any) => {
          IndexDB._db = event.target.result;
          resolve(IndexDB._db);
        };
      });
      return IndexDB._init_promise;
    }
  }

  static getObjectStore() {
    return IndexDB._db.transaction([conf.object_store], "readwrite").objectStore(conf.object_store);
  }

  static setItem(key: string, data: { params: Object, response: any }) {
    if (IndexDB._index_db_support) {
      return new Promise((resolve: Function, reject: Function) => {
        IndexDB._init_promise.then(() => {
          const request = IndexDB.getObjectStore().put({
            ...data,
            isIndexDBCache: true,
            timestamp: Date.now(),
          }, key);
          request.onerror = (e: any) => {
            // reject(e);
            resolve(undefined);
          };
          request.onsuccess = (e: any) => {
            resolve(e);
          };
        });
      });
    }
    return Promise.resolve(undefined);
  }
  
  static getItem(key: string,) {
    if (IndexDB._index_db_support) {
      return new Promise((resolve: Function, reject: Function) => {
        IndexDB._init_promise.then(() => {
          const request = IndexDB.getObjectStore().get(key);
          request.onerror = (e: any) => {
            // reject(e);
            resolve(undefined);
          };
          request.onsuccess = (e: any) => {
            resolve(e.target.result);
          };
        });
      });
    }
    return Promise.resolve(undefined);
  }

  static deleteItem(key: string) {
    if (IndexDB._index_db_support) {
      return new Promise((resolve: Function, reject: Function) => {
        IndexDB._init_promise.then(() => {
          const request = IndexDB.getObjectStore().delete(key);
          request.onerror = (e: any) => {
            // reject(e);
            resolve(undefined);
          };
          request.onsuccess = (e: any) => {
            resolve(e);
          };
        });
      });
    }
    return Promise.resolve(undefined);
  }

  // 接口数据设置
  static setApiData(key: string, params: Object, func: Function) {
    return new Promise((resolve, reject) => {
      if (IndexDB._index_db_support) {
        func().then((res: any) => {
          IndexDB.setItem(key, {
            params,
            response: res
          }).finally(() => {
            resolve(res);
          });
        });
      } else {
        resolve(undefined);
      }
    });
  }

  // 接口数据获取
  static getApiData(key: string, params: Object) {
    return new Promise((resolve: Function, reject: Function) => {
      const timeblock = 5 * 60000; // 五分钟的毫秒数
      const datanow = Date.now();
      IndexDB.getItem(key).then((result: any) => {
        if (result) {
          // TODO: 因为是预获取数据 所以取值后直接删除
          IndexDB.deleteItem(key);
          const effective = (datanow - result.timestamp) < timeblock; // 有效时间区间内
          if (effective && isEqual(result.params, params)) {
            resolve(result.response);
            return;
          }
        }
        resolve(undefined);
      });
    });
  }
}

/**
 * 使用示例
  export function getPreLoadData(params) {
    return IndexDB.getApiData(URLNEW.preLoadData, params).then((response) => {
      if (response) {
        return response;
      } else {
        return Http.post(URLNEW.preLoadData, params)
      }
    });
  }

  export function setPreLoadData(params) {
    return IndexDB.setApiData(URLNEW.preLoadData, params, () => Http.post(URLNEW.preLoadData, params));
  }
 */