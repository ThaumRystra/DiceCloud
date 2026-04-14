import { computed, type ComputedRef, getCurrentInstance, markRaw, ref, watchEffect } from 'vue'

interface Stoppable {
  stop: () => void
}

interface AutorunEffect<TResult> extends Stoppable {
  result: ComputedRef<TResult>
}

function autorunAsync<TResult = unknown>(callback: () => Promise<TResult>): AutorunEffect<TResult> {
  const result = ref<TResult>()
  const stop = watchEffect((onInvalidate) => {
    const computation = Tracker.autorun(async () => {
      let value: any = await callback()
      if (typeof value?.fetch === 'function') {
        value = value.fetch()
      }
      result.value = value && typeof value === 'object' ? markRaw(value as unknown as object) as TResult : value
    })
    onInvalidate(() => {
      computation.stop()
    })
  })
  return {
    result: computed<TResult>(() => result.value as TResult),
    stop,
  }
}

function makeSetupOnlyFunction<
  TFn extends (...args: any[]) => any
>(fn: TFn): TFn {
  return ((...args) => {
    if (process.env.NODE_ENV !== 'production') {
      if (!getCurrentInstance()) {
        console.warn(`'${fn.name}()' should only be used in setup() inside components to clean up correctly. If you need to call '${fn.name}' later outside of the setup context, use 'use${fn.name[0].toUpperCase()}${fn.name.slice(1)}()' instead.`)
      }
    }
    return fn(...args)
  }) as TFn
}

const setupOnlyAutorunAsync = makeSetupOnlyFunction(autorunAsync);

export { setupOnlyAutorunAsync as autorunAsync };
