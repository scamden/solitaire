// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { render } from 'react-dom';

// import * as classnames from 'classnames';

import 'global.scss';

import { MainComponent } from '../lib';

(async () => {
  render(
    <MainComponent />,
    document.getElementById('app')
  );
})();
