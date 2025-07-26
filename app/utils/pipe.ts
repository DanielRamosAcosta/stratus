interface Pipe {
  <A>(value: A): A;
  <A, B>(value: A, fn1: (input: A) => B): B;
  <A, B, C>(value: A, fn1: (input: A) => B, fn2: (input: B) => C): C;
  <A, B, C, D>(
    value: A,
    fn1: (input: A) => B,
    fn2: (input: B) => C,
    fn3: (input: C) => D
  ): D;
  <A, B, C, D, E>(
    value: A,
    fn1: (input: A) => B,
    fn2: (input: B) => C,
    fn3: (input: C) => D,
    fn4: (input: D) => E
  ): E;
  // ... and so on
}

export const pipe: Pipe = (value: any, ...fns: Function[]): unknown => {
  return fns.reduce((acc, fn) => fn(acc), value);
};

interface AsyncPipe {
  <A>(value: A): Promise<A>;
  <A, B>(value: A, fn1: (input: A) => Promise<B>): Promise<B>;
  <A, B, C>(value: A, fn1: (input: A) => Promise<B>, fn2: (input: B) => Promise<C>): Promise<C>;
  <A, B, C>(value: A, fn1: (input: A) => Promise<B>, fn2: (input: B) => C): Promise<C>;
  <A, B, C, D>(
    value: A,
    fn1: (input: A) => Promise<B>,
    fn2: (input: B) => Promise<C>,
    fn3: (input: C) => Promise<D>
  ): Promise<D>;
  <A, B, C, D>(
    value: A,
    fn1: (input: A) => Promise<B>,
    fn2: (input: B) => Promise<C>,
    fn3: (input: C) => D
  ): Promise<D>;
  // ... and so on
}

export const asyncFlow = (...fns: Function[]) => {
  return async (value: any): Promise<unknown> => {
    let result = value;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
};
