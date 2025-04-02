/* with love from shopstory */
import { entries } from '@easyblocks/utils';

function responsiveValueEntries(value) {
  const values = [];
  entries(value).forEach(_ref => {
    let [key, v] = _ref;
    if (key === "$res") return;
    values.push([key, v]);
  });
  return values;
}

export { responsiveValueEntries };
