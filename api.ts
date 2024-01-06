import {NativeEventEmitter, NativeModules} from 'react-native';

type RequestInfo = {
  id?: number;
  name: string;
  params?: any;
};

export type AppInfo = {
  appId: string;
  props: {[key: string]: string};
};

const callbackMap = new Map();
const emitter = new NativeEventEmitter(NativeModules.AppModule);

emitter.addListener('RESPONSE_MESSAGE', event => {
  const callback = callbackMap.get(event.data.id);
  delete event.data.id;
  callback?.(event.data?.result);
  callbackMap.delete(event.data.id);
});

const request = (res: RequestInfo, callback: any) => {
  const id = res.id ?? Date.now();
  if (callback) {
    callbackMap.set(id, callback);
  }
  NativeModules.AppModule.request({...res, id});
};

class Api {
  public startApp(info: AppInfo): Promise<boolean> {
    return new Promise(resolve => {
      request({name: 'startApp', params: info}, (data: boolean) =>
        resolve(data),
      );
    });
  }

  public dismiss(data: any): Promise<boolean> {
    return new Promise(resolve => {
      request({name: 'dismiss', params: [data]}, (data: any) => resolve(data));
    });
  }

  public setItem(key: string, value: string): Promise<boolean> {
    return new Promise(resolve => {
      request({name: 'setItem', params: [key, value]}, (data: boolean) =>
        resolve(data),
      );
    });
  }

  public getItem(key: string): Promise<string | undefined> {
    return new Promise(resolve => {
      request({name: 'getItem', params: [key]}, (data: string | undefined) =>
        resolve(data),
      );
    });
  }
}

export const PlatformApi = new Api();
