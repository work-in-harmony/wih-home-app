import { useContext } from "react";
import { IMAGES } from "../config/urls.jsx";


function Logo() {
  const IMAGE_URL_DARK = IMAGES.LOGO_DARK;

  const IMAGE_URL_LIGHT = IMAGES.LOGO_LIGHT;


  return (
    <img
      src={IMAGE_URL_DARK}
      alt="WorkInHarmony Logo"
      className="absolute top-6 left-6 w-32 md:top-8 md:left-8 md:w-40"
    />
  );
}

export default Logo;
