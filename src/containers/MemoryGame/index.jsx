import React, { Component, Fragment } from "react";
import uuid from "uuid/v4";

// External helpers
import _debounce from "lodash/debounce";

import {
  cardsInfo,
  cardHiddenImage,
  gameTimeInSeconds,
  allStatus,
  gameFinishMessage
} from "./constants";

import Board from "../../components/Board";

import styles from "./styles.module.css";

class MemoryGame extends Component {
  getRandomNumber = maxNumber => Math.floor(Math.random() * maxNumber + 1);

  initializeCardsOnBoard = () => {
    const cardsOnBoard = Array(16);
    //Create an array with entires 0,2,3, ... 15
    const boardPositions = Array.from({ length: 16 }, (x, i) => i);

    const result = cardsInfo.reduce(
      ({ cardsOnBoard, availableBoardPositions }, cardInfo, index) => {
        let indexInAvailableBoardPositions =
          this.getRandomNumber(availableBoardPositions.length) - 1;
        const cardPosition =
          availableBoardPositions[indexInAvailableBoardPositions];

        // Place card on board
        cardsOnBoard[cardPosition] = {
          id: index,
          ...cardInfo,
          isFlipped: false,
          isSolved: false
        };

        // Update available positions
        availableBoardPositions.splice(indexInAvailableBoardPositions, 1);

        indexInAvailableBoardPositions =
          this.getRandomNumber(availableBoardPositions.length) - 1;

        const cardPairPosition =
          availableBoardPositions[indexInAvailableBoardPositions];

        // Place card pair on board
        cardsOnBoard[cardPairPosition] = {
          ...cardInfo,
          isFlipped: false,
          isSolved: false,
          id: uuid()
        };

        // Update available positions
        availableBoardPositions.splice(indexInAvailableBoardPositions, 1);

        return { cardsOnBoard, availableBoardPositions };
      },
      {
        cardsOnBoard,
        availableBoardPositions: boardPositions
      }
    );

    return result.cardsOnBoard;
  };

  state = {
    cardsInfo: this.initializeCardsOnBoard(),
    boardDimensions: 0,
    status: allStatus.NOT_STARTED,
    remainingTimeInSeconds: gameTimeInSeconds
  };

  componentDidMount() {
    this.resizeBoard();
    window.addEventListener("resize", _debounce(this.resizeBoard, 150));
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.resizeBoard);
  }

  resizeBoard = () => {
    const minDimension = Math.min(window.innerWidth, window.innerHeight);

    // Max dimensions are 500, else get 90% of the min dimension
    this.setState({
      boardDimensions: minDimension <= 500 ? 0.95 * minDimension : 500
    });
  };

  // Card actions flip, hide, solve
  executeCardAction = async (action, cardIndexesToAction) => {
    // Update cardsInfo array without mutate
    await this.setState(({ cardsInfo }) => ({
      cardsInfo: cardsInfo.map((cardInfo, index) => {
        if (cardIndexesToAction.includes(index)) {
          let { isFlipped, isSolved } = cardInfo;

          switch (action) {
            case "flip":
              isFlipped = true;
              break;
            case "hide":
              isFlipped = false;
              break;
            case "solve":
              isSolved = true;
              isFlipped = false;
              break;
            default:
          }

          return {
            ...cardInfo,
            isFlipped,
            isSolved
          };
        }

        return cardInfo;
      })
    }));
  };

  getFlippedCards = () =>
    this.state.cardsInfo.reduce(
      (flippedCards, card, index) =>
        card.isFlipped ? [...flippedCards, { ...card, index }] : flippedCards,
      []
    );

  getSolvedCards = () =>
    this.state.cardsInfo.reduce(
      (solvedCards, card, index) =>
        card.isSolved ? [...solvedCards, { ...card, index }] : solvedCards,
      []
    );

  handleCardClick = async clickedCardIndex => {
    const { cardsInfo } = this.state;
    const clickedCard = cardsInfo[clickedCardIndex];
    const { isFlipped, isSolved } = clickedCard;

    if (!isFlipped && !isSolved) {
      let flippedCards = this.getFlippedCards();

      if (flippedCards.length <= 1) {
        await this.executeCardAction("flip", [clickedCardIndex]);

        // Add currently flipped card to flipped cards
        flippedCards = [
          ...flippedCards,
          { ...this.state.cardsInfo[clickedCardIndex], index: clickedCardIndex }
        ];

        if (flippedCards.length === 2) {
          if (flippedCards[0].name === flippedCards[1].name) {
            await this.executeCardAction("solve", [
              flippedCards[0].index,
              flippedCards[1].index
            ]);

            //check if all cards have been solved
            if (this.getSolvedCards().length === cardsInfo.length) {
              // stopTimer
              clearInterval(this.timerIntervalId);
              this.setState({ status: allStatus.WIN });
            }
          } else {
            // Hide flipped cards after 1sec
            setTimeout(() => {
              this.executeCardAction(
                "hide",
                flippedCards.map(updatedFlippedCard => updatedFlippedCard.index)
              );
            }, 1000);
          }
        }
      }
    }
  };

  startTimer = () => {
    this.timerIntervalId = setInterval(() => {
      if (!!this.state.remainingTimeInSeconds) {
        this.setState(({ remainingTimeInSeconds }) => ({
          remainingTimeInSeconds: remainingTimeInSeconds - 1
        }));
      } else {
        // stopTimer
        clearInterval(this.timerIntervalId);
        this.setState({ status: allStatus.LOSE });
      }
    }, 1000);
  };

  startGame = () => {
    this.setState(
      {
        status: allStatus.IN_PROGRESS,
        remainingTimeInSeconds: gameTimeInSeconds,
        cardsInfo: this.initializeCardsOnBoard()
      },
      this.startTimer
    );
  };

  cancelGame = () => {
    clearInterval(this.timerIntervalId);
    this.setState(({ cardsInfo }) => ({
      remainingTimeInSeconds: gameTimeInSeconds,
      status: allStatus.CANCELED,
      cardsInfo: cardsInfo.map(cardInfo => ({
        ...cardInfo,
        isFlipped: false,
        isSolved: false
      }))
    }));
  };

  getTimeDisplayFormat = () => {
    const { remainingTimeInSeconds } = this.state;

    let minutes = Math.floor(remainingTimeInSeconds / 60);
    let seconds = remainingTimeInSeconds - minutes * 60;

    const minutesString =
      minutes.toString().length === 1 ? `0${minutes}` : minutes;

    const secondsString =
      seconds.toString().length === 1 ? `0${seconds}` : seconds;

    return `${minutesString} : ${secondsString}`;
  };

  render() {
    const { status, cardsInfo, boardDimensions } = this.state;

    return (
      <Fragment>
        <div
          className={styles["info-control"]}
          style={{ width: boardDimensions }}
        >
          <div className={styles["game-text-container"]}>
            <span className={styles["game-text"]}>Memory Game</span>
          </div>

          {status === allStatus.IN_PROGRESS ? (
            <button className={styles["ctrl-btn"]} onClick={this.cancelGame}>
              Cancel
            </button>
          ) : (
            <button className={styles["ctrl-btn"]} onClick={this.startGame}>
              Start New Game
            </button>
          )}

          {(status === allStatus.NOT_STARTED ||
            status === allStatus.CANCELED ||
            status === allStatus.IN_PROGRESS) && (
            <div className={styles["remaining-time"]}>
              {this.getTimeDisplayFormat()}
            </div>
          )}

          {status === allStatus.WIN && (
            <div className={styles["game-finish-message-container"]}>
              <div className={styles["game-finish-message"]}>
                {gameFinishMessage.win}
              </div>
            </div>
          )}
          {status === allStatus.LOSE && (
            <div className={styles["game-finish-message"]}>
              {gameFinishMessage.lose}
            </div>
          )}
        </div>

        <Board
          cardsInfo={cardsInfo}
          dimensions={{ height: boardDimensions, width: boardDimensions }}
          cardHiddenImage={cardHiddenImage}
          isDisabled={status !== allStatus.IN_PROGRESS}
          onCardClick={this.handleCardClick}
        />
      </Fragment>
    );
  }
}

export default MemoryGame;
