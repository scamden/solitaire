// tslint:disable-next-line:no-unused-variable
import * as React from 'react';

import * as classnames from 'classnames';
import { Card, getCardValueDisplay, getSuitSymbol, isZeroCard, Suit, ZeroCard } from '../../cards';

import { cardBase, selected } from './style.scss';

export type IProps = SharedCardProps & {
  card: Card | ZeroCard;
  selected: boolean | undefined;
};

export const CARD_SIZE = {
  width: `53px`,
  height: `80px`,
};

const CARD_STYLE = {
  ...CARD_SIZE,
  background: 'white',
  userSelect: 'none',
  boxShadow: 'rgba(0, 0, 0, 0.2) -2px 2px 8px 0px',
  transform: 'translate3d(0, 0, 0)',
} as const;
const CARD_VALUE_STYLE = { fontWeight: 'bold' } as const;
const CARD_SUIT_STYLE = { fontSize: '35px' };

export type SharedCardProps = {
  onClick?: () => void;
  onDoubleClick?: () => void;
  className?: string;
  style?: React.HTMLAttributes<HTMLDivElement>['style'];
};

type CardContainerProps = SharedCardProps & {

};

export const CardContainer: React.FunctionComponent<CardContainerProps> = ({ style, className, children, ...rest }) => {
  return (
    <div
      className={classnames(className, cardBase, 'cursor-pointer p-x-sub2 p-y-sub3 flex-column border border-radius-lg flex-shrink-0')}
      style={{ ...CARD_STYLE, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
};

export const BigSuit = ({ suit }: { suit: Suit }) => <div className="flex-x-center" style={CARD_SUIT_STYLE}>{getSuitSymbol(suit)}</div>;

export const CardDisplay = (props: IProps) => {
  const { card, style, className, ...rest } = props;
  const suitSymbol = getSuitSymbol(card.suit);
  const color = card.suit === Suit.Hearts || card.suit === Suit.Diamonds ? 'red' : 'black';
  return (
    <CardContainer
      className={classnames(className, { [selected]: props.selected })}
      style={{ ...style, color }}
      {...rest}
    >
      <div className="flex-grow-1 flex-x-center flex-column flex-space-between">
        {!isZeroCard(card) &&
          <div className="flex-row flex-space-between">
            <div style={CARD_VALUE_STYLE}>{getCardValueDisplay(card.value)}</div>
            <div>{suitSymbol}</div>
          </div>}
        <BigSuit suit={card.suit} />
      </div>
    </CardContainer>
  );
};
