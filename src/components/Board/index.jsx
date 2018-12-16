import React, { Component } from "react";
import PropTypes from "prop-types";

import isEqual from "lodash/isEqual";

import Card from "../Card";

import styles from "./styles.css";

class Board extends Component {
  static propTypes = {
    cardsInfo: PropTypes.arrayOf(PropTypes.shape({ image: PropTypes.string })),
    dimensions: PropTypes.shape({
      height: PropTypes.number,
      width: PropTypes.number
    }),
    cardHiddenImage: PropTypes.string,
    isDisabled: PropTypes.bool,

    onCardClick: PropTypes.func
  };

  static defaultProps = {
    isDisabled: false
  };

  // We dont use Pure component because dimensions props object is created on every render
  // so the reference changes even if the dimensions height and width are the same
  shouldComponentUpdate(nextProps) {
    if (isEqual(this.props, nextProps)) {
      return false;
    }

    return true;
  }

  render() {
    const {
      cardsInfo,
      dimensions: { height, width },
      cardHiddenImage,
      onCardClick,
      isDisabled
    } = this.props;

    return (
      <div
        className={styles["cards-container"]}
        style={{ width: width, height: height }}
      >
        {cardsInfo.map(({ id, image, isFlipped, isSolved }, index) => (
          <Card
            key={id}
            dimensions={{
              height: height / 4,
              width: width / 4
            }}
            isFlipped={isFlipped}
            isSolved={isSolved}
            images={{ front: cardHiddenImage, back: image }}
            index={index}
            isDisabled={isDisabled}
            onClick={onCardClick}
          />
        ))}
      </div>
    );
  }
}

export default Board;
