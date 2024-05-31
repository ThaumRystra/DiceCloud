declare module 'meteor/mdg:validated-method' {
  interface ValidatedMethodOptionsMixinFields<TRunArg, TRunReturn> {
    rateLimit: {
      numRequests: number,
      timeInterval: number,
    };
  }
  type Return<TFunc> = TFunc extends (...args: any[]) => infer TReturn ? TReturn : never;
  type Argument<TFunc> = TFunc extends (...args: infer TArgs) => any ? TArgs extends [infer TArg] ? TArg
    : NoArguments
    : never;
  interface ValidatedMethod<TName extends string, TRun extends (...args: any[]) => any> {
    callAsync: Argument<TRun> extends NoArguments
    // methods with no argument can be called with () or just a callback
    ?
    & ((unusedArg: any, callback: (error: Meteor.Error, result: Return<TRun>) => void) => void)
    & ((callback: (error: Meteor.Error | undefined, result: Return<TRun>) => void) => void)
    & (() => Return<TRun>)
    // methods with arguments require those arguments to be called
    :
    & ((
      arg: Argument<TRun>,
      callback: (error: Meteor.Error | undefined, result: Return<TRun>) => void,
    ) => void)
    & ((arg: Argument<TRun>) => Return<TRun>);
  }
}