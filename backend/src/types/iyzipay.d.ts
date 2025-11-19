/**
 * İyzico TypeScript Declaration
 * 
 * Bu dosya iyzipay npm paketi için TypeScript type tanımlarını içerir.
 * Paket kendi type definition'larını içermediği için bu dosya oluşturulmuştur.
 */

declare module 'iyzipay' {
  export interface IyzipayConfig {
    apiKey: string;
    secretKey: string;
    uri: string;
  }

  export interface IyzipayCallback<T = any> {
    (error: any, result: T): void;
  }

  export interface IyzipayRequest {
    locale?: string;
    conversationId?: string;
    price?: string;
    paidPrice?: string;
    currency?: string;
    basketId?: string;
    paymentGroup?: string;
    callbackUrl?: string;
    enabledInstallments?: number[];
    buyer?: any;
    shippingAddress?: any;
    billingAddress?: any;
    basketItems?: any[];
    [key: string]: any;
  }

  export interface IyzipayResponse {
    status: string;
    errorCode?: string;
    errorMessage?: string;
    errorGroup?: string;
    locale?: string;
    systemTime?: number;
    conversationId?: string;
    paymentId?: string;
    paidPrice?: string;
    price?: string;
    threeDSHtmlContent?: string;
    paymentPageUrl?: string;
    [key: string]: any;
  }

  export interface IyzipayThreedsInitialize {
    create(request: IyzipayRequest, callback: IyzipayCallback<IyzipayResponse>): void;
  }

  export interface IyzipayPayment {
    retrieve(request: IyzipayRequest, callback: IyzipayCallback<IyzipayResponse>): void;
    create(request: IyzipayRequest, callback: IyzipayCallback<IyzipayResponse>): void;
  }

  export interface IyzipayRefund {
    create(request: IyzipayRequest, callback: IyzipayCallback<IyzipayResponse>): void;
  }

  export default class Iyzipay {
    constructor(config: IyzipayConfig);
    threedsInitialize: IyzipayThreedsInitialize;
    payment: IyzipayPayment;
    refund: IyzipayRefund;
  }
}

