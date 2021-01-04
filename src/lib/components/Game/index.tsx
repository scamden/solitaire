// tslint:disable-next-line:no-unused-variable
import * as React from 'react';
import { Component } from 'react';

import * as _ from 'lodash';

import * as classnames from 'classnames';
import {
  Card,
  cardsEqual,
  getCardColor,
  getCardText,
  isSuperKingCard,
  isZeroCard,
  makeShuffledDeck,
  Suit,
  SUITS,
  SuperKingCard,
  ZeroCard,
} from '../../cards';
import { CARD_SIZE, CardDisplay } from '../Card';

export interface IStateProps {
  className?: string;
}

export interface IDispatchProps {
}

export interface IProps extends IDispatchProps, IStateProps { }

export interface IGameState {
  showing: Card[];
  facedown: Card[];
  suitStacks: Partial<Record<Suit, SuitStack>>;
  stacks: Stack[];
  selectedCards?: Card[];
  autoMove?: boolean;
}

type RemainingDeckProps = {
  showing: Card[];
  facedown: Card[];
  next: () => void;
  onCardClick: (card: Card) => void;
  selectedCards: Card[] | undefined
};

type DownCardProps = {
  next: () => void;
  className?: string;
  style?: React.HTMLAttributes<HTMLDivElement>['style'];
};

const RemainingDeck: React.FunctionComponent<RemainingDeckProps> = ({ showing, facedown, next, onCardClick, selectedCards, }) => {
  const topFaceDown = _.last(facedown);
  return (
    <div className="flex-row m-l-auto flex-shrink-0" style={{ transition: 'all 0.5s' }}>
      {showing.map((card, i) => (
        <CardDisplay
          card={card}
          key={getCardText(card)}
          style={{ marginLeft: '-30px' }}
          onClick={() => i === showing.length - 1 && onCardClick(card)}
          selected={isSelected(card, selectedCards)}
        />
      ))}
      {topFaceDown && <CardDisplay card={topFaceDown} onClick={next} className="m-l-sub2" selected={false} flipped={true} />}
    </div>
  );
};

type SuitStack = [ZeroCard, ...Card[]];
type Stack = {
  facedown: Card[];
  showing: Array<SuperKingCard | Card>;
};

type SuitStackProps = {

  cards: SuitStack | undefined;
  className?: string;
  onStackClick: (card: Card | ZeroCard) => void;
} & Pick<IGameState, 'selectedCards'>;

const isSelected = (card: Card | ZeroCard | SuperKingCard, selectedCards: Card[] | undefined) =>
  selectedCards?.some((sc) => cardsEqual(sc, card));

const SuitStackDisplay: React.FunctionComponent<SuitStackProps> = ({ cards, className, onStackClick, selectedCards }) => {
  const topCard = _.last(cards);
  if (!topCard) {
    throw new Error('stacks must start with the zero card');
  }
  const onClickBound = () => onStackClick(topCard);
  return (
    <CardDisplay card={topCard} className={className} onClick={onClickBound} selected={isSelected(topCard, selectedCards)} />
  );
};

const turnUpStack = (stack: Stack) => {
  if (stack.showing.length === 0) {
    const facedown = _.dropRight(stack.facedown, 1);
    const showing = _.takeRight(stack.facedown, 1);
    return { facedown, showing };

  }
  return stack;
};

export class Game extends Component<IProps, IGameState> {

  constructor(props: IProps) {
    super(props);
    const deck = makeShuffledDeck();
    const dealt = [1, 2, 3, 4, 5, 6, 7].reduce((accum, numToDeal) => ({
      stacks: [...accum.stacks, { facedown: [..._.takeRight(accum.deck, numToDeal)], showing: [] }],
      deck: _.dropRight(accum.deck, numToDeal),
    }), { deck, stacks: [] });
    this.state = {
      showing: [],
      facedown: dealt.deck,
      suitStacks: SUITS.reduce((accum, suit) => ({
        ...accum,
        [suit]: [{ suit, value: 0 }]
      }), {}),
      stacks: dealt.stacks.map(turnUpStack),
      autoMove: true,
    };
  }

  next = () => {
    this.getNextSelectedCards(undefined);
    const rotateShowing = this.state.showing.length >= 3;
    this.setState({
      facedown: [...rotateShowing ? _.take(this.state.showing, 1) : [], ..._.initial(this.state.facedown)],
      showing: [...rotateShowing ? _.tail(this.state.showing) : this.state.showing, ..._.takeRight(this.state.facedown, 1)]
    });

  }

  onDeckCardClick = (card: Card) => {
    this.selectCards(this.getNextSelectedCards([card]));
  }

  getNextSelectedCards = (cards: Card[] | undefined) => {
    if (cardsEqual(_.first(cards), _.first(this.state.selectedCards))) {
      return undefined;
    } else {
      return cards;
    }
  }

  selectCards = (selectedCards: Card[] | undefined) => {
    this.setState({ selectedCards }, () => {
      if (this.state.autoMove) {
        this.autoMove();
      }
    });
  }

  turnUpStackCard = (stackIndex: number,) => {
    const stack = turnUpStack(this.state.stacks[stackIndex]);
    this.setState({
      stacks: this.getNewStacks(stackIndex, stack, this.state.stacks),
    });
  }

  getNewStacks(stackIndex: number, stack: Stack, stacks: Stack[]): Stack[] {
    return [...stacks.slice(0, stackIndex), stack, ...stacks.slice(stackIndex + 1)];
  }

  getStateWithoutSelectedCard(selectedCards: Card[] | undefined) {
    return {
      showing: this.state.showing.filter((c) => !isSelected(c, selectedCards)),
      stacks: this.state.stacks.map((stack) => {
        const newShowing = stack.showing.filter((c) => !isSelected(c, selectedCards));
        return turnUpStack({
          ...stack,
          showing: newShowing.length === 0 && stack.facedown.length === 0 ? [{ value: 14 } as SuperKingCard] : newShowing
        });
      }),
      suitStacks: _.mapValues(this.state.suitStacks, (suitStack) =>
        suitStack?.filter((c) => !isSelected(c, selectedCards)) as SuitStack | undefined),
    };
  }

  maybeMoveToStack = (stackIndex: number, card: Card | SuperKingCard, selectedCards: Card[] | undefined): true | void => {
    const topCard = _.last(this.state.stacks[stackIndex].showing);
    const selectedCard = _.first(selectedCards);
    const canMove = selectedCard
      && (!topCard || cardsEqual(topCard, card))
      && (isSuperKingCard(card) || getCardColor(selectedCard) !== getCardColor(card))
      && card.value - 1 === selectedCard.value;
    if (canMove) {
      const newStateWithoutSelected = this.getStateWithoutSelectedCard(selectedCards);
      const stack = newStateWithoutSelected.stacks[stackIndex];
      const stacks = this.getNewStacks(
        stackIndex,
        { ...stack, showing: [...stack.showing.filter((c) => !isSuperKingCard(c)), ...selectedCards || []] },
        newStateWithoutSelected.stacks,
      );
      this.setState({
        ...newStateWithoutSelected,
        stacks,
      });
      return true;
    }
  }

  onStackClick = (stackIndex: number, card: Card | SuperKingCard): true | void => {
    const nextSelectedCards = !isSuperKingCard(card) ?
      this.getNextSelectedCards([card, ..._.takeRightWhile(
        this.state.stacks[stackIndex].showing,
        (c) => !cardsEqual(card, c)
      )].filter((c): c is Card => !isSuperKingCard(c)))
      : undefined;

    if (!this.maybeMoveToStack(stackIndex, card, this.state.selectedCards)) {
      this.selectCards(nextSelectedCards);
    }
  }

  maybeMoveToSuitStack = (card: ZeroCard | Card, selectedCards: Card[] | undefined): true | void => {
    const selectedCard = _.first(selectedCards);
    const canAdd = selectedCard && selectedCard.suit === card.suit && card.value === selectedCard.value - 1;
    if (canAdd) {
      const newStateWithoutSelected = this.getStateWithoutSelectedCard(selectedCards);
      const newState = {
        ...newStateWithoutSelected,
        suitStacks: {
          ...newStateWithoutSelected.suitStacks,
          [card.suit]: [...newStateWithoutSelected.suitStacks[card.suit] || [], ...selectedCards || []]
        }
      };
      this.setState(newState);
      return true;
    }
  }

  onSuitStackClick = (card: ZeroCard | Card) => {
    if (!this.maybeMoveToSuitStack(card, this.state.selectedCards)) {
      this.selectCards(!isZeroCard(card) ? this.getNextSelectedCards([card]) : undefined);
    }
  }

  autoMove = () => {
    return SUITS.some((suit) => {
      const topCard = _.last(this.state.suitStacks[suit]);
      return topCard && this.maybeMoveToSuitStack(topCard, this.state.selectedCards);
    }) || this.state.stacks.some((stack, i) => {
      const topCard = _.last(stack.showing);
      return topCard && this.maybeMoveToStack(i, topCard, this.state.selectedCards);
    });
  }

  render() {
    const { className } = this.props;

    return (
      <div className={classnames(className, 'p-x-2 p-y-1')}>
        <div className="flex-row">
          <div className="flex-row">
            {SUITS.map((suit) => <SuitStackDisplay
              cards={this.state.suitStacks[suit]}
              key={suit}
              className="m-r-sub2"
              onStackClick={this.onSuitStackClick}
              selectedCards={this.state.selectedCards}
            />)}
          </div>
          <RemainingDeck
            showing={this.state.showing}
            facedown={this.state.facedown}
            next={this.next}
            onCardClick={this.onDeckCardClick}
            selectedCards={this.state.selectedCards}
          />
        </div>
        <div className="flex-row m-t-3">
          {this.state.stacks.map((stack, stackIndex) => (
            <div className="m-r-sub2" key={stackIndex}>
              {[...stack.facedown, ...stack.showing].map((card, i) =>
                isSuperKingCard(card)
                  ? <div
                    className="cursor-pointer"
                    key={card.value}
                    style={
                      CARD_SIZE
                    }
                    onClick={() => this.onStackClick(stackIndex, card)}
                  />
                  : <CardDisplay
                    flipped={i < stack.facedown.length}
                    card={card}
                    key={getCardText(card)}
                    selected={isSelected(card, this.state.selectedCards)}
                    onClick={() => this.onStackClick(stackIndex, card)}
                    style={{ marginTop: i !== 0 ? i <= stack.facedown.length ? '-75px' : '-60px' : undefined }}
                  />)}
            </div>

          )
          )}
        </div>
      </div>
    );
  }

}
