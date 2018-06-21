// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { Component } from 'react';

import * as classnames from 'classnames';

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
    const { className } = this.props;
    return (
      <div className={classnames(className)}>
        Your code here
      </div>
    );
  }
}
