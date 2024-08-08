import React from "react";
import PropTypes from "prop-types";

function MainImage({image,text}){
  return (
      <div className="carousel-image">
        <img
            src={image}
            alt={text}
            className="d-block w-100"
        />
      </div>
  );
}
MainImage.propTypes = {
  image: PropTypes.string.isRequired, // 'image' is a required string
  text: PropTypes.string.isRequired   // 'text' is a required string
};
export default MainImage;