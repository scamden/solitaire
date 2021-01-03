import * as _ from 'lodash';

export enum Suit {
  Hearts = 'Hearts',
  Spades = 'Spades',
  Clubs = 'Clubs',
  Diamonds = 'Diamonds',
}

export const SUITS = [
  Suit.Hearts,
  Suit.Spades,
  Suit.Clubs,
  Suit.Diamonds,
];

export const CARD_VALUES = [
  1,  // ace
  2, 3, 4, 5, 6, 7, 8, 9, 10
  , 11 // jack
  , 12 // queen
  , 13 // king

] as const;
export type CardValue = typeof CARD_VALUES[number];

export type Card = {
  value: CardValue;
  suit: Suit
};

export type ZeroCard = {
  value: 0;
  suit: Suit;
};

export type SuperKingCard = {
  value: 14,
  suit?: undefined;
};

export type AnyCard = Card | SuperKingCard | ZeroCard;

export const isZeroCard = (card: Card | ZeroCard | SuperKingCard): card is ZeroCard => card.value === 0;
export const isSuperKingCard = (card: Card | ZeroCard | SuperKingCard): card is SuperKingCard => card.value === 14;

export const shuffle = (_deck: Card[]): Card[] => {
  const deck = _.clone(_deck);
  for (let i = 0; i < deck.length; i++) {
    const indexToSwap = Math.floor(Math.random() * (deck.length - i));
    const swap = deck[indexToSwap];
    deck[indexToSwap] = deck[i];
    deck[i] = swap;
  }
  return deck;
};

export const makeDeck = (): Card[] => _.flatten(CARD_VALUES.map((value) => SUITS.map((suit) => ({ value, suit }))));
export const makeShuffledDeck = (): Card[] => shuffle(makeDeck());

export const getSuitSymbol = (suit: Suit) => {
  switch (suit) {
    case Suit.Hearts: return `♥`;
    case Suit.Spades: return `♠`;
    case Suit.Clubs: return `♣`;
    case Suit.Diamonds: return `♦`;
  }
};

export const getCardValueDisplay = (value: CardValue) => {
  switch (value) {
    case 11: return `J`;
    case 12: return `Q`;
    case 13: return `K`;
    case 1: return `A`;
    default: return `${value}`;
  }
};

export const getCardText = (card: Card) => `${getCardValueDisplay(card.value)}${getSuitSymbol(card.suit)}`;

export const cardsEqual = (card1: AnyCard, card2: AnyCard) => card1.suit === card2.suit && card1.value === card2.value;
export const getCardColor = (card: AnyCard) => {
  switch (card.suit) {
    case Suit.Hearts: return `red`;
    case Suit.Spades: return `black`;
    case Suit.Clubs: return `black`;
    case Suit.Diamonds: return `red`;
    default: return undefined;
  }
};
export const cardsEqualColor = (card1: AnyCard, card2: AnyCard) => card1.suit;