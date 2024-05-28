import React from 'react';
import styles from './Loader.module.scss';

const Loader = ({ className, style }) => {
  const classes = className ? className : '';
  const customStyle = style ? style : {};

  return (
    <div className={classes} style={customStyle}>
      <span
        className={styles.loader}
        style={{
          height: '24px',
          width: '24px',
        }}
      ></span>
    </div>
  );
};

export default Loader;
