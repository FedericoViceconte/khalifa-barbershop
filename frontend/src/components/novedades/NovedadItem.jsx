import React from 'react';

const NovedadItem = (props) => {
    const { tittle, subtitle, imagen, body } = props;

    return (
        <div className="novedades">
            <h1>{tittle}</h1>
            <h2>{subtitle}</h2>
            {imagen && <img src={imagen} alt="" />}
            <p>{body}</p>
            <hr />
        </div>
    );
}

export default NovedadItem;
