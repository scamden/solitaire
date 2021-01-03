// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { Component } from 'react';

import * as _ from 'lodash';

import { Game } from './Game';

export interface IStateProps {
  className?: string;
}

export interface IDispatchProps {
}

export interface IProps extends IDispatchProps, IStateProps { }

export interface IState {
}

export class MainComponent extends Component<IProps, IState> {

  render() {
    return <div className="pin-to-edges" style={{ background: 'green' }}><Game /></div>;
  }
}
