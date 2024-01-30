import {
  DeviceEventEmitter,
  NativeEventEmitter,
  NativeModules,
} from "react-native";

type RequestInfo = {
  id?: number;
  name: string;
  params?: any;
};

type TransactionStatus = "successful" | "failed" | "pending";

type PaymentInfo = {
  serviceId: string;
  appId: string;
  amount: number;
  currency: string;
  metadata: any;
};

export interface Transaction {
  id: string;
  serviceId: string;
  appId: string;
  user: string;
  total: number;
  subTotal: number;
  paidTotal: number;
  discountTotal: number;
  taxTotal: number;
  currency: string;
  status: TransactionStatus;
  canceledAt: Date;
  createdAt: Date;
  updatedAt: Date;
  metadata: any;
}

export type AppInfo = {
  appId: string;
  debug?: boolean;
  props: { [key: string]: string };
};

const callbackMap = new Map();
const emitter = new NativeEventEmitter(NativeModules.AppModule);

emitter.addListener("RESPONSE_MESSAGE", (event) => {
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
  NativeModules.AppModule.request({ ...res, id });
};

class Api {
  constructor() {
    DeviceEventEmitter.addListener("dismiss", (data) => {
      this.dismiss(data);
    });
  }

  public startApp(info: AppInfo): Promise<boolean> {
    return new Promise((resolve) => {
      request({ name: "startApp", params: [info] }, (data: boolean) =>
        resolve(data)
      );
    });
  }

  public dismiss(data: any): Promise<boolean> {
    return new Promise((resolve) => {
      request({ name: "dismiss", params: [data] }, (data: any) =>
        resolve(data)
      );
    });
  }

  public setItem(key: string, value: string): Promise<boolean> {
    return new Promise((resolve) => {
      request({ name: "setItem", params: [key, value] }, (data: boolean) =>
        resolve(data)
      );
    });
  }

  public getItem(key: string): Promise<string | undefined> {
    return new Promise((resolve) => {
      request({ name: "getItem", params: [key] }, (data: string | undefined) =>
        resolve(data)
      );
    });
  }

  public requestPayment(data: PaymentInfo): Promise<Transaction> {
    return new Promise((resolve) => {
      request({ name: "requestPayment", params: [data] }, (data: Transaction) =>
        resolve(data)
      );
    });
  }
}

export const PlatformApi = new Api();
