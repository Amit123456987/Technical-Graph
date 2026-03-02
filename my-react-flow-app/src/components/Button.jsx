import React from 'react';

const AlgoButton = ({ onClick, algorithm, buttonStyle, children }) => {
    return (
        <button
        onClick={() => onClick(algorithm)}
        style={buttonStyle}
      >
        {children}
      </button>
    );
};

export default AlgoButton;