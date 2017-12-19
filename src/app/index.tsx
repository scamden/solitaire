// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { render } from 'react-dom';
import { connect, Provider, } from 'react-redux';

// import * as classnames from 'classnames';

import 'global.scss';

import { api, rootSelectors, thunks } from './state';

import { configureStore } from './store';

(async () => {
  await api.init({
    orgAlias: 'ciqtest',
    baseApiUrl: __API_BASE_URL__,
  });
  const store = await configureStore();
  // dispatch any initial thunks here using store.dispatch(...)
  render(
    <Provider store={store}>
      <div>Web Base (Your Connected Component Here)</div>
    </Provider>,
    document.getElementById('app')
  );
})();
