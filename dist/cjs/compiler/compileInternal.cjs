/* with love from shopstory */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var CompilationCache = require('./CompilationCache.cjs');
var normalize = require('./normalize.cjs');
var compileComponent = require('./compileComponent.cjs');
var devices = require('./devices.cjs');

function compileInternal(configComponent, compilationContext) {
  let cache = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : new CompilationCache.CompilationCache();
  const normalizedConfig = normalize.normalize(configComponent, compilationContext);
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
    $width: devices.getDevicesWidths(compilationContext.devices),
    $widthAuto: {
      $res: true,
      ...Object.fromEntries(compilationContext.devices.map(d => [d.id, false]))
    }
  };
  const compilationArtifacts = compileComponent.compileComponent(normalizedConfig, compilationContext, contextProps, meta, cache);
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

exports.compileInternal = compileInternal;
