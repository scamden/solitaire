// tslint:disable-next-line:no-unused-variable
import * as React from 'react';

import * as classnames from 'classnames';
import { Card, getCardValueDisplay, getSuitSymbol, isZeroCard, Suit, ZeroCard } from '../../cards';

import { back, cardBase, cardContainer, inverted, selected } from './style.scss';

export type IProps = SharedCardProps & {
  card: Card | ZeroCard;
  selected: boolean | undefined;
  flipped?: boolean;
};

export const CARD_SIZE = {
  width: `53px`,
  height: `80px`,
};

const CARD_STYLE = {
  ...CARD_SIZE,
  background: 'white',
  userSelect: 'none',
  /* transform: 'translate3d(0, 0, 0)', */
} as const;
const CARD_VALUE_STYLE = { fontWeight: 'bold' } as const;
const CARD_SUIT_STYLE = { fontSize: '35px' };
const cardBackImageUrl = require('../../../assets/images/card-back-simple.jpg');
/* const cardBackImageUrl = require('../../assets/images/card-back.png'); */

const CARD_BACK_STYLE = { background: `url(${cardBackImageUrl})`, backgroundSize: 'cover', backgroundPositionX: 'center' };

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
  const { card, style, className, flipped, ...rest } = props;
  const suitSymbol = getSuitSymbol(card.suit);
  const color = card.suit === Suit.Hearts || card.suit === Suit.Diamonds ? 'red' : 'black';
  return (
    <div
      className={classnames('position-relative', className, { [inverted]: flipped }, cardContainer)}
      style={{ boxShadow: 'rgba(0, 0, 0, 0.2) -2px 2px 8px 0px', ...style, opacity: isZeroCard(card) ? 0.5 : undefined, }}
    >
      <CardContainer
        style={CARD_BACK_STYLE}
        className={classnames(back)}
        {...rest}
      />
      <CardContainer
        className={classnames({ [selected]: props.selected, })}
        style={{ color, }}
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

    </div>
  );
};
