/* with love from shopstory */
import { entries } from '../utils/object/entries.js';

function responsiveValueValues(value) {
  const values = [];
  entries(value).forEach(_ref => {
    let [key, v] = _ref;
    if (key === "$res") return;
    values.push(v);
  });
  return values;
}

export { responsiveValueValues };
