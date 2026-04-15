declare module 'meteor/mdg:validated-method' {
  type Mixin = (options: ValidatedMethodOptions<unknown, unknown>) => ValidatedMethodOptions<unknown, unknown>;

  interface ValidatedMethodOptions<TArgs, TResult> {
    name: string;
    validate: ((args: TArgs) => void) | null;
    run: (this: MethodContext, args: TArgs) => TResult;
    mixins?: Mixin[];
    rateLimit?: {
      numRequests: number;
      timeInterval: number;
    };
    [key: string]: unknown;
  }

  interface MethodContext {
    userId: string | null;
    isSimulation: boolean;
    connection: Meteor.Connection | null;
    setUserId(userId: string | null): void;
    unblock(): void;
  }

  export class ValidatedMethod<TArgs, TResult> {
    constructor(options: ValidatedMethodOptions<TArgs, TResult>);
    name: string;
    call(args: TArgs, callback?: (error: Meteor.Error | undefined, result?: TResult) => void): TResult | undefined;
    callAsync(args: TArgs): Promise<TResult>;
    _execute(context: Partial<MethodContext>, args: TArgs): TResult;
  }
}

declare module 'ddp-rate-limiter-mixin' {
  export const RateLimiterMixin: <T>(options: T) => T;
}
