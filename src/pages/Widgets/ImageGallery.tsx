import React, { useState, useEffect } from "react";
import trademarkArrow from "../../assets/images/trademark-arrow.svg";
import colorArrow from "../../assets/images/color-arrow.svg";
import fullIcon from "../../assets/images/Full.svg";
import formClose from "../../assets/images/form-close.svg";  // Assuming this is the close icon you want to use

interface ImageGalleryProps {
  images: GalleryImage[];
  houseSelected: boolean;
  trademarkSelected: boolean;
  colorSelected: boolean;
  selectedHouseId: string;
  selectedTrademarkId: string;
  selectedColorId: string;
  translations: any;
}

interface GalleryImage {
  id: string;
  url?: string;
  imageUrls?: string[];
  houseId: string;
  trademarkId: string;
  colorId: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  houseSelected,
  trademarkSelected,
  colorSelected,
  selectedHouseId,
  selectedTrademarkId,
  selectedColorId,
  translations,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const allFiltersSelected = houseSelected && trademarkSelected && colorSelected;

  const filteredImages = allFiltersSelected
    ? images.filter(
        (image) =>
          image.houseId === selectedHouseId &&
          image.trademarkId === selectedTrademarkId &&
          image.colorId === selectedColorId
      )
    : [];

  const selectedImage: GalleryImage | undefined = allFiltersSelected
    ? filteredImages[0]
    : images[0];

  const imageSources: string[] =
    selectedImage?.imageUrls && selectedImage.imageUrls.length > 0
      ? selectedImage.imageUrls
      : selectedImage?.url
      ? [selectedImage.url]
      : [];

  const showOverlay = !allFiltersSelected || !selectedImage;

  let selectionText = "";
  if (!trademarkSelected && !colorSelected) {
    selectionText =
    translations?.widget?.start_description;
  } else if (trademarkSelected && !colorSelected) {
    selectionText = translations?.widget?.choose_step_second;
  } else if (!trademarkSelected && colorSelected) {
    selectionText = translations?.widget?.choose_step_third;
  }

  const openPopup = () => {
    if (imageSources.length > 0) {
      setIsPopupOpen(true);
    }
  };

  const formatTextWithBr = (text: string) => {
    const words = text.split(" ");
    if (words.length > 2) {
      words.splice(2, 0, "<br/>"); 
    }
    return words.join(" ");
  };

  const closePopup = () => setIsPopupOpen(false);

  useEffect(() => {
    if (isPopupOpen) {
      document.body.classList.add('body-no-scroll');
    } else {
      document.body.classList.remove('body-no-scroll');
    }

    return () => {
      document.body.classList.remove('body-no-scroll');
    };
  }, [isPopupOpen]);

  return (
    <div className="image__wrap">
      <div className="image__wrap">
        {imageSources.length > 0 ? (
          <div className="slider-container">
            <img
              src={imageSources[0]}
              alt="Зображення"
              className="image"
            />
          </div>
        ) : (
          <div
            className="image__placeholder"
          >
             {translations?.widget?.image_none}
          </div>
        )}
        {imageSources.length > 0 && (
          <img
            src={fullIcon}
            className="image__full--icon"
            onClick={openPopup}
          />
        )}
      </div>
      {showOverlay && (
        <div className="image__overlay">
          {!houseSelected && (
            <div className="image__house--wrap">
              <div className="image__house">
                {translations?.widget?.fasad_description}
              </div>
            </div>
          )}
          {!trademarkSelected && (
            <div className="image__trademark--arrow">
              <img src={trademarkArrow} alt="Стрілка для вибору торгової марки" />
            </div>
          )}
          {(!trademarkSelected || !colorSelected) && (
            <div className="image__text">{selectionText}</div>
          )}
          {!colorSelected && (
            <div className="image__color--arrow">
              <img src={colorArrow} alt="Стрілка для вибору кольору" />
            </div>
          )}
            <div className="image__tooltip--wrap">
            <div className="image__tooltip">
            <div
                className="image__tooltip"
                dangerouslySetInnerHTML={{
                  __html: formatTextWithBr(translations?.widget?.zoom_image || ""),
                }}
              />
            </div>
          
          </div>
          <div className="image__tooltip--icon">
            <img
            src={fullIcon}
          />
            </div>
        </div>
      )}
      {isPopupOpen && imageSources.length > 0 && (
        <div className="image__popup--overlay" onClick={closePopup}>
          <div className="image__popup--close" onClick={closePopup}>
            <img src={formClose} alt="Close" />
          </div>
          <img className="image__popup--image"
            src={imageSources[0]}
            alt="Popup Зображення"
          />
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
