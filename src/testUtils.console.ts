/**
 * Silence one console method for the length of a test, and hand back what it
 * was called with.
 *
 * `schemaPropDefinitions.test.ts` imports this from `@easyblocks/test-utils`,
 * a package this fork does not have — so that suite has never run. It is the
 * suite covering `definitions.ts`, which is where most of the recovery paths
 * added in September live, and every one of those paths warns. Having the
 * helper locally is what lets those tests assert the warning instead of
 * printing it.
 */
export function mockConsoleMethod(method: "log" | "warn" | "error" | "info") {
  const calls: Array<Array<unknown>> = [];

  const spy = jest
    .spyOn(console, method)
    .mockImplementation((...args: Array<unknown>) => {
      calls.push(args);
    });

  return {
    calls,
    mockedFn: spy,
    unmock: () => {
      spy.mockRestore();
    },
  };
}
