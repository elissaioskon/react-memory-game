import React, { Component } from "react";
import PropTypes from "prop-types";

// External helpers
import isEqual from "lodash/isEqual";

// Components
import Card from "../Card";

class Board extends Component {
  static propTypes = {
    cardsInfo: PropTypes.arrayOf(PropTypes.shape({ image: PropTypes.string })),
    dimensions: PropTypes.shape({
      height: PropTypes.number,
      width: PropTypes.number
    }),
    cardHiddenImage: PropTypes.string,
    isDisabled: PropTypes.bool,

    // Functions
    onCardClick: PropTypes.func
  };

  static defaultProps = {
    isDisabled: false
  };

  // We dont use Pure component because dimensions props object is created on every render
  // so the reference changes even if the dimensions height and width are the same
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props, nextProps);
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
      <div style={{ width: width, height: height }}>
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
