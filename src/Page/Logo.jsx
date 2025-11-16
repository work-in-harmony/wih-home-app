import { IMAGES } from "../config/urls.jsx";
// Logo Component
function Logo() {
  const IMAGE_URL_DARK = IMAGES.LOGO_DARK;
  return (
    <img
      src={IMAGE_URL_DARK}
      alt="WorkInHarmony Logo"
      className="w-32 md:w-40" />
  );
}
