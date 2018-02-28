// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { render } from 'react-dom';
import { connect, Provider, } from 'react-redux';

// import * as classnames from 'classnames';

import 'global.scss';

import { api, rootSelectors, thunks } from './state';

import { IDispatchProps, IStateProps, MainComponent } from '../lib';
import { configureStore } from './store';

const ConnectedTestComponent = connect<IStateProps, IDispatchProps, any>(
  (state: any) => {
    return {
    };
  },
  {

  }
)(MainComponent);

(async () => {
  await api.init({
    orgAlias: 'ciqtest',
    baseApiUrl: __API_BASE_URL__,
  });
  const store = await configureStore();
  // dispatch any initial thunks here using store.dispatch(...)
  render(
    <Provider store={store}>
      <ConnectedTestComponent />
    </Provider>,
    document.getElementById('app')
  );
})();
