interface AsyncFlow {
  <A>(): (value: A) => Promise<A>;
  <A, B>(fn1: (input: A) => Promise<B>): (value: A) => Promise<B>;
  <A, B>(fn1: (input: A) => B): (value: A) => Promise<B>;
  <A, B, C>(
    fn1: (input: A) => Promise<B>,
    fn2: (input: B) => Promise<C>
  ): (value: A) => Promise<C>;
  <A, B, C>(
    fn1: (input: A) => Promise<B>,
    fn2: (input: B) => C
  ): (value: A) => Promise<C>;
  <A, B, C>(
    fn1: (input: A) => B,
    fn2: (input: B) => Promise<C>
  ): (value: A) => Promise<C>;
  <A, B, C>(
    fn1: (input: A) => B,
    fn2: (input: B) => C
  ): (value: A) => Promise<C>;
  <A, B, C, D>(
    fn1: (input: A) => Promise<B>,
    fn2: (input: B) => Promise<C>,
    fn3: (input: C) => Promise<D>
  ): (value: A) => Promise<D>;
  <A, B, C, D>(
    fn1: (input: A) => Promise<B>,
    fn2: (input: B) => Promise<C>,
    fn3: (input: C) => D
  ): (value: A) => Promise<D>;
  <A, B, C, D>(
    fn1: (input: A) => Promise<B>,
    fn2: (input: B) => C,
    fn3: (input: C) => Promise<D>
  ): (value: A) => Promise<D>;
  <A, B, C, D>(
    fn1: (input: A) => B,
    fn2: (input: B) => Promise<C>,
    fn3: (input: C) => Promise<D>
  ): (value: A) => Promise<D>;
  <A, B, C, D>(
    fn1: (input: A) => B,
    fn2: (input: B) => C,
    fn3: (input: C) => Promise<D>
  ): (value: A) => Promise<D>;
  <A, B, C, D>(
    fn1: (input: A) => B,
    fn2: (input: B) => C,
    fn3: (input: C) => D
  ): (value: A) => Promise<D>;
  <A, B, C, D, E>(
    fn1: (input: A) => Promise<B>,
    fn2: (input: B) => Promise<C>,
    fn3: (input: C) => Promise<D>,
    fn4: (input: D) => Promise<E>
  ): (value: A) => Promise<E>;
  <A, B, C, D, E>(
    fn1: (input: A) => Promise<B>,
    fn2: (input: B) => Promise<C>,
    fn3: (input: C) => Promise<D>,
    fn4: (input: D) => E
  ): (value: A) => Promise<E>;
  // ... and so on for mixed sync/async combinations
}

export const asyncFlow: AsyncFlow = (...fns: Function[]) => {
  return async (value: any): Promise<unknown> => {
    let result = value;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };
};
