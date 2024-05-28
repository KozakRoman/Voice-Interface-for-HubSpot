import React from 'react';
import styles from './Loader.module.scss';

const Loader = () => {
  return (
    <div className="flex flex-col justify-center items-center w-full py-20 px-8 h-60">
      <span className={styles.loader}></span>
    </div>
  );
};

export default Loader;
