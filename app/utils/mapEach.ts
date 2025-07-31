export function mapEach<T, U>(fn: (item: T) => U) {
  return (array: T[]) => array.map(fn);
}
