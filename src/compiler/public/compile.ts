import { mergeCompilationMeta } from "../mergeCompilationMeta";
import { CompilationMetadata, CompilerModule } from "../../types";
import { compileInternal } from "../compileInternal";
import { createCompilationContext } from "../createCompilationContext";
import { normalizeInput } from "../normalizeInput";
import { PersistentCompilationCache } from "../persistent-compilation-cache";

// Module-level cache — survives across buildEntry calls (page navigations)
const persistentCache = new PersistentCompilationCache();

export const compile: CompilerModule["compile"] = (
  content,
  config,
  contextParams
) => {
  let resultMeta: CompilationMetadata = {
    // @ts-expect-error We can leave `devices` and `locale` undefined because these values are set in `compileInternal`.
    vars: {},
    code: {},
  };

  const compilationContext = createCompilationContext(
    config,
    contextParams,
    content._component
  );

  const inputConfigComponent = normalizeInput(content);

  const { meta, compiled, configAfterAuto, externals } = compileInternal(
    inputConfigComponent,
    compilationContext,
    persistentCache
  );

  resultMeta = mergeCompilationMeta(resultMeta, meta);

  return {
    compiled,
    configAfterAuto,
    meta: resultMeta,
    externals,
  };
};
