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
    // @ts-ignore
    window.IndexDB = IndexDB;
  }

  static getObjectStore() {
    return IndexDB._db.transaction([conf.object_store], "readwrite").objectStore(conf.object_store);
  }

  static setItem(key: string, data: { params: any, response: any }) {
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

  // 接口数据获取
  static get(key: string, params: any) {
    return new Promise((resolve: Function, reject: Function) => {
      const timeblock = 1 * 60 * 60 * 1000; // 一小时的毫秒数
      const datanow = Date.now();
      IndexDB.getItem(key).then((result: any) => {
        if (result && result.timestamp && result.params && result.response) {
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

  static race(req_1: any, req_2: any) {
    return new Promise((resolve: Function, reject: Function) => {
      Promise.race([req_1, req_2]).then((res: any) => {
        console.log('res:', res);
        if (res) {
          resolve(res);
        } else {
          resolve(req_2);
        }
      });
    });
  }
}

/**
 * 使用示例
  IndexDB.get('/optimusChannel/preLoadData', params).then((response) => {
    if (response) {
      return response;
    } else {
      return Http.post('/optimusChannel/preLoadData', { ...params, })
    }
  });
 */