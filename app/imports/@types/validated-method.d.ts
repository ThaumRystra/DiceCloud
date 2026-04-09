declare module 'meteor/mdg:validated-method' {
  type Mixin = (options: ValidatedMethodOptions<any>) => ValidatedMethodOptions<any>;

  interface ValidatedMethodOptions<TArgs> {
    name: string;
    validate: ((args: TArgs) => void) | null;
    run: (this: MethodContext, args: TArgs) => any;
    mixins?: Mixin[];
    rateLimit?: {
      numRequests: number;
      timeInterval: number;
    };
    [key: string]: any;
  }

  interface MethodContext {
    userId: string | null;
    isSimulation: boolean;
    connection: Meteor.Connection | null;
    setUserId(userId: string | null): void;
    unblock(): void;
  }

  export class ValidatedMethod<TArgs = any, TResult = any> {
    constructor(options: ValidatedMethodOptions<TArgs>);
    name: string;
    call(args: TArgs, callback?: (error: Meteor.Error | undefined, result?: TResult) => void): TResult | undefined;
    callAsync(args: TArgs): Promise<TResult>;
    _execute(context: Partial<MethodContext>, args: TArgs): TResult;
  }
}

declare module 'ddp-rate-limiter-mixin' {
  export const RateLimiterMixin: (options: any) => any;
}
