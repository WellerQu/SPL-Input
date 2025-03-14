// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Func = (...args: any[]) => any;

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function compose<T extends Func>(...funcs: Func[]) {
  if (!funcs || funcs.length === 0) {
    return undefined;
  }
  if (funcs.length === 1) {
    return funcs[0] as T;
  }

  return funcs.reduce((a: Func, b: Func) => (...args: unknown[]) =>
    a(b(...args))
  ) as T;
}
