import React, { Component } from "react";
import PropTypes from "prop-types";

import _isEqual from "lodash/isEqual";
import _noop from "lodash/noop";

import styles from "./index.module.css";

class Card extends Component {
  static propTypes = {
    dimensions: PropTypes.shape({
      height: PropTypes.number,
      width: PropTypes.number
    }),
    images: PropTypes.shape({
      front: PropTypes.string,
      back: PropTypes.string
    }),
    isDisabled: PropTypes.bool,
    isFlipped: PropTypes.bool.isRequired,
    isSolved: PropTypes.bool.isRequired,
    index: PropTypes.number.isRequired,

    onClick: PropTypes.func
  };

  static defaultProps = {
    onClick: _noop,
    dimensions: { height: 100, width: 100 },
    isDisabled: false
  };

  shouldComponentUpdate(nextProps) {
    if (_isEqual(this.props, nextProps)) {
      return false;
    }

    return true;
  }

  handleClick = () => {
    const { isDisabled, isSolved, onClick } = this.props;

    // Ignore clicks if card is disabled or solved
    if (isDisabled || isSolved) return;
    onClick(this.props.index);
  };

  render() {
    const {
      dimensions: { height, width },
      images,
      isFlipped,
      isSolved
    } = this.props;

    return (
      <div
        className={`${styles["flip-card"]} ${
          isFlipped || isSolved ? styles["is-flipped"] : ""
        }`}
        style={{ width, height }}
        onClick={this.handleClick}
      >
        <div className={styles["flip-card-inner"]}>
          <div className={styles["flip-card-front"]}>
            <img className={styles["card-image"]} src={images.front} alt="" />
          </div>
          <div className={styles["flip-card-back"]}>
            <img className={styles["card-image"]} src={images.back} alt="" />
          </div>
        </div>
      </div>
    );
  }
}

export default Card;
