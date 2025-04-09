/* with love from shopstory */
import { CompilationCache } from './CompilationCache.js';
import { normalize } from './normalize.js';
import { compileComponent } from './compileComponent.js';
import { getDevicesWidths } from './devices.js';

function compileInternal(configComponent, compilationContext) {
  let cache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new CompilationCache();
  const normalizedConfig = normalize(configComponent, compilationContext);
  const meta = {
    vars: {
      definitions: {
        links: [],
        actions: [],
        components: [],
        textModifiers: []
      },
      devices: compilationContext.devices,
      locale: compilationContext.contextParams.locale
    }
  };
  const contextProps = {
    $width: getDevicesWidths(compilationContext.devices),
    $widthAuto: {
      $res: true,
      ...Object.fromEntries(compilationContext.devices.map(d => [d.id, false]))
    }
  };
  const compilationArtifacts = compileComponent(normalizedConfig, compilationContext, contextProps, meta, cache);
  const ret = {
    compiled: compilationArtifacts.compiledComponentConfig,
    meta: {
      vars: meta.vars
    }
  };
  if (compilationContext.isEditing) {
    return {
      ...ret,
      configAfterAuto: compilationArtifacts.configAfterAuto
    };
  }
  return ret;
}

export { compileInternal };
//# sourceMappingURL=compileInternal.js.map
