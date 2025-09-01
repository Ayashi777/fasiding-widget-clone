import React, { useEffect, useLayoutEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/firebase";
import HouseSelector from "./HouseSelector";
import ColorSelector from "./ColorSelector";
import TrademarkSelector from "./TrademarkSelector";
import ImageGallery from "./ImageGallery";
import "./widgets.scss";
import TrademarkDetails from "./TrademarkDetails";
import OrderForm from "./OrderForm";
import {
  Trademark,
  Color,
  ExtendedTrademark,
  WidgetData,
  ImageData,
  FormTranslations,
  WidgetTranslations,
  Translations,
} from "./types";

const WidgetDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [widget, setWidget] = useState<WidgetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTrademark, setSelectedTrademark] = useState<number | null>(
    null
  );
  const [selectedHouse, setSelectedHouse] = useState<number | null>(null);
  const [selectedTextureUrl, setSelectedTextureUrl] = useState<string | null>(
    null
  );
  const [selectedColorName, setSelectedColorName] = useState<string | null>(
    null
  );
  const [images, setImages] = useState<ImageData[]>([]);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const isFormReady =
    selectedHouse !== null &&
    selectedTrademark !== null &&
    selectedColor !== null;
  const [translations, setTranslations] = useState<Translations | null>(null);
  const [hoveredTextureUrl, setHoveredTextureUrl] = useState<string | null>(
    null
  );
  const [hoveredColor, setHoveredColor] = useState<Color | null>(null);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchWidget = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "widgets", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const widgetData = docSnap.data() as WidgetData;
          setWidget(widgetData);
          console.log("Widget data:", widgetData);
          widgetData.color.forEach((color) => {
            color.trademarks?.forEach((tm) => {
              console.log(`PDF для торговой марки ${tm.trademarkName}:`, tm.trademarkPdfUrl);
            });
          });
        }
      } catch (error) {
        console.error("Ошибка загрузки виджета:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWidget();
  }, [id]);

  useEffect(() => {
    const fetchTranslations = async () => {
      if (widget && widget.languageId) {
        try {
          const languageDocRef = doc(db, "languages", widget.languageId);
          const languageDocSnap = await getDoc(languageDocRef);

          if (languageDocSnap.exists()) {
            const translationsData = languageDocSnap.data().translations;

            if (translationsData && typeof translationsData === "object") {
              setTranslations(translationsData);
            } 
          } else {
            console.error("dont find document");
          }
        } catch (error) {
          console.error("Error downolaod translate:", error);
        }
      }
    };
    fetchTranslations();
  }, [widget]);

  useEffect(() => {
    if (isOrderFormOpen) {
      document.body.classList.add("body-no-scroll");
    } else {
      document.body.classList.remove("body-no-scroll");
    }

    return () => {
      document.body.classList.remove("body-no-scroll");
    };
  }, [isOrderFormOpen]);

  useEffect(() => {
    const fetchImages = async () => {
      if (widget && widget.languageId) {
        try {
          const imagesColRef = collection(
            db,
            "languages",
            widget.languageId,
            "images"
          );
          const querySnapshot = await getDocs(imagesColRef);
          const imagesData: ImageData[] = querySnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              colorId: data.colorId,
              colorName: data.colorName,
              houseId: data.houseId,
              houseName: data.houseName,
              imageUrls: data.imageUrls,
              trademarkId: data.trademarkId,
              trademarkName: data.trademarkName,
            };
          });
   
          setImages(imagesData);
        } catch (error) {
          console.error("Error downolaod images:", error);
        }
      }
    };
    fetchImages();
  }, [widget]);

  useLayoutEffect(() => {
    let lastHeight = 0;
    let timeoutId: NodeJS.Timeout;
    let observer: MutationObserver | null = null;
    let imageLoadListeners: (() => void)[] = [];
  
    const sendHeight = () => {
      clearTimeout(timeoutId);
  
      timeoutId = setTimeout(() => {
        const newHeight = document.documentElement.scrollHeight;
        
        if (newHeight !== lastHeight) {
          lastHeight = newHeight;
          window.parent.postMessage(
            { type: "resize", height: newHeight },
            "*"
          );
        }
      }, 100);
    };
  
    const trackImagesLoad = () => {
      imageLoadListeners.forEach(remove => remove());
      imageLoadListeners = [];
  
      const images = document.querySelectorAll('img');
      let imagesToLoad = 0;
  
      const onImageLoad = () => {
        imagesToLoad--;
        if (imagesToLoad === 0) {
          sendHeight();
        }
      };
  
      images.forEach(img => {
        if (!img.complete) {
          imagesToLoad++;
          const listener = () => onImageLoad();
          img.addEventListener('load', listener);
          img.addEventListener('error', listener);
          imageLoadListeners.push(() => {
            img.removeEventListener('load', listener);
            img.removeEventListener('error', listener);
          });
        }
      });
  
      if (imagesToLoad === 0) {
        sendHeight();
      }
    };
  
    sendHeight();
    trackImagesLoad();
  
    observer = new MutationObserver((mutations) => {
      const hasSignificantChanges = mutations.some(mutation => {
        return mutation.addedNodes.length > 0 || 
               mutation.removedNodes.length > 0 ||
               mutation.type === 'attributes';
      });
  
      if (hasSignificantChanges) {
        trackImagesLoad();
        sendHeight();
      }
    });
  
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });
  
    window.addEventListener('resize', sendHeight);
  
    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
      window.removeEventListener('resize', sendHeight);
      imageLoadListeners.forEach(remove => remove());
    };
  }, [selectedTrademark, selectedColor, selectedHouse, images]);

  useEffect(() => {
    if (selectedTrademark !== null && selectedColor && widget) {
      const trademark = widget.trademark[selectedTrademark];
      if (trademark.colors && trademark.colors.length > 0) {
        const selectedColorData = trademark.colors.find(
          (color) => color.name === widget.color.find(c => c.id === selectedColor)?.name
        );
        if (selectedColorData && selectedColorData.pdf) {
          setSelectedPdfUrl(selectedColorData.pdf);
        }
      }
    }
  }, [selectedTrademark, selectedColor, widget]);

  const transformedImages = images.map((image) => ({
    id: image.id,
    url: image.imageUrls.length > 0 ? image.imageUrls[0] : undefined,
    houseId: image.houseId,
    trademarkId: image.trademarkId,
    colorId: image.colorId,
  }));

  const handleOrderClick = () => {
    if (isFormReady) {
      setIsOrderFormOpen(true);
    }
  };

  const handleCloseOrderForm = () => {
    setIsOrderFormOpen(false);
  };

  const handleColorSelect = (colorId: string | null) => {
    setSelectedColor(colorId);
    if (colorId && widget) {
      const selectedColorData = widget.color.find((c) => c.id === colorId);
      const textureUrl =
        selectedColorData?.trademarks?.[0]?.trademarkTextureUrl || null;
      setSelectedTextureUrl(textureUrl);
      setSelectedColorName(selectedColorData?.name || null);
    } else {
      setSelectedTextureUrl(null);
      setSelectedColorName(null);
    }
  };

  const resetAllFilters = () => {
    setSelectedColor(null);
    setSelectedTrademark(null);
    setSelectedHouse(null);
    setSelectedTextureUrl(null);
    setSelectedColorName(null);
    setSelectedPdfUrl(null);
  };

  if (loading) return <div>Loading...</div>;
  if (!widget) return <div>Widget not found</div>;

  const defaultColor = widget.color[0];
  const defaultTextureUrl =
    defaultColor?.trademarks?.[0]?.trademarkTextureUrl || null;

  return (<>
    <div className="container" id="top">
      <div className="widget__container">
        <span className="widget__label widget__label__mobile">
          {translations?.widget?.tm}
        </span>
        <div
          className={`widget__row mobile__row ${
            selectedColor ||
            selectedTrademark !== null ||
            selectedHouse !== null
              ? "filter__active"
              : ""
          }`}
          style={{ alignItems: "center" }}
        >
          <TrademarkSelector
            trademarks={widget.trademark}
            widgetColors={widget.color}
            selectedTrademark={selectedTrademark}
            setSelectedTrademark={setSelectedTrademark}
            selectedColor={selectedColor}
            translations={translations}
          />
          <div className="widget__column mobile__column">
            {(selectedColor ||
              selectedTrademark !== null ||
              selectedHouse !== null) && (
              <div className="widget__label mobile-none">
                {translations?.widget?.selected}
              </div>
            )}
            <div className="widget__filter">
              <div className="widget__filter--column">
                {selectedColor && (
                  <button
                    className="widget__filter--tag"
                    onClick={() => setSelectedColor(null)}
                  >
                    <span>
                      {widget.color.find((c) => c.id === selectedColor)?.name}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M15 5L5 15"
                        stroke="#363636"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 5L15 15"
                        stroke="#363636"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
                {selectedTrademark !== null && (
                  <button
                    className="widget__filter--tag"
                    onClick={() => setSelectedTrademark(null)}
                  >
                    <span>
                      {widget.trademark[selectedTrademark].tmName ||
                        widget.trademark[selectedTrademark].name}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M15 5L5 15"
                        stroke="#363636"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 5L15 15"
                        stroke="#363636"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
                {selectedHouse !== null && (
                  <button
                    className="widget__filter--tag"
                    onClick={() => setSelectedHouse(null)}
                  >
                    <span>{widget.house[selectedHouse].name}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M15 5L5 15"
                        stroke="#363636"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 5L15 15"
                        stroke="#363636"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
              <div className="widget__filter--column">
                {(selectedColor ||
                  selectedTrademark !== null ||
                  selectedHouse !== null) && (
                  <button
                    className="widget__filter--reset"
                    onClick={resetAllFilters}
                  >
                    <span className="display-block">
                      <span className="widget__filter--reset--desktop">{translations?.widget?.reset_filters}</span>
                      <span className="widget__filter--reset--mobile">{translations?.widget?.mobile_filters}</span>
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="none"
                    >
                      <path
                        d="M15 5L5 15"
                        stroke="#363636"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 5L15 15"
                        stroke="#363636"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="widget__row widget__row__mobile">
          <div className="widget__column image">
            <HouseSelector
              houses={widget.house}
              selectedHouse={selectedHouse}
              setSelectedHouse={setSelectedHouse}
              translations={translations}
            />
            <ImageGallery
              images={transformedImages}
              houseSelected={selectedHouse !== null}
              trademarkSelected={selectedTrademark !== null}
              colorSelected={selectedColor !== null}
              selectedHouseId={widget.house[selectedHouse || 0]?.id ?? ""}
              selectedTrademarkId={
                widget.trademark[selectedTrademark || 0]?.id ?? ""
              }
              selectedColorId={selectedColor ?? ""}
              translations={translations}
            />
          </div>
          <div className="widget__column texture">
            <div
              className="texture__container"
              style={{
                backgroundImage: hoveredTextureUrl
                  ? `url(${hoveredTextureUrl})`
                  : selectedTextureUrl
                  ? `url(${selectedTextureUrl})`
                  : `url(${defaultTextureUrl})`,
                backgroundSize: "cover",
                position: "relative",
              }}
            >
              {!selectedTextureUrl && !hoveredTextureUrl && (
                <div className="texture__overlay">
                  <div className="texture__overlay--text">
                    <div className="texture__overlay--text--desktop">
                      {translations?.widget?.color_texture_hover}
                    </div>
                  </div>
                  <div className="texture__overlay--text">
                    <div className="texture__overlay--text--mobile">
                      {translations?.widget?.color_texture_select}
                    </div>
                  </div>
                </div>
              )}

              {(hoveredColor || selectedColor) && (
                <div className="texture__info">
                  {hoveredColor?.name || selectedColorName ? (
                    <div className="texture__info--name">
                      {hoveredColor?.name || selectedColorName}
                    </div>
                  ) : null}
                  {selectedTrademark !== null &&
                    (hoveredColor || selectedColor) && (
                      <div className="texture__info--logo">
                        <img
                          src={widget.trademark[selectedTrademark].logoUrl}
                          alt={
                            widget.trademark[selectedTrademark].tmName ||
                            widget.trademark[selectedTrademark].name
                          }
                        />
                      </div>
                    )}
                </div>
              )}
            </div>

            <div className="texture__buttons">
              <button
                onClick={handleOrderClick}
                disabled={!isFormReady}
                className={!isFormReady ? "disabled-button" : ""}
              >
                {translations?.widget?.order_fasad}
              </button>
              <a
                href={selectedPdfUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className={!selectedPdfUrl ? "disabled-link" : ""}
              >
                <span className="downoload-pdf--desktop"> {translations?.widget?.download_pdf}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M12 14L11.2929 14.7071L12 15.4142L12.7071 14.7071L12 14ZM13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44771 11 5L13 5ZM6.29289 9.70711L11.2929 14.7071L12.7071 13.2929L7.70711 8.29289L6.29289 9.70711ZM12.7071 14.7071L17.7071 9.70711L16.2929 8.29289L11.2929 13.2929L12.7071 14.7071ZM13 14L13 5L11 5L11 14L13 14Z"
                    fill="#070707"
                  />
                  <path
                    d="M5 16L5 17C5 18.1046 5.89543 19 7 19L17 19C18.1046 19 19 18.1046 19 17V16"
                    stroke="#070707"
                    strokeWidth="2"
                  />
                </svg>
              </a>
              {isOrderFormOpen && (
                <OrderForm
                  selectedHouse={widget?.house[selectedHouse || 0]?.name || ""}
                  selectedTrademark={
                    widget?.trademark[selectedTrademark || 0]?.tmName || ""
                  }
                  selectedColor={selectedColorName || ""}
                  selectedTextureUrl={selectedTextureUrl || ""}
                  selectedPhotoUrl={transformedImages[0]?.url || ""}
                  onClose={handleCloseOrderForm}
                  translations={translations}
                  adminEmail={widget.adminEmail}
                  widgetName={widget.widgetName}
                />
              )}
            </div>
          </div>
        </div>
        <div className="widget__row">
          <div className="wrapper">
            <div className="widget__label desktop">
              {translations?.widget?.colors}
            </div>
            <ColorSelector
              colors={widget.color}
              selectedColor={selectedColor}
              setSelectedColor={handleColorSelect}
              trademarks={widget.trademark}
              selectedTrademark={selectedTrademark}
              onHoverTexture={setHoveredTextureUrl}
              onHoverColor={setHoveredColor}
            />
          </div>
        </div>
        <div className="mobile__buttons">
          <div className="texture__buttons">
            <button
              onClick={handleOrderClick}
              disabled={!isFormReady}
              className={!isFormReady ? "disabled-button" : ""}
            >
              {translations?.widget?.order_fasad}
            </button>
            <a
              className="mobile__downoload__pdf"
              href={selectedPdfUrl || "#"}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="downoload-pdf--mobile"> {translations?.widget?.mobile_pdf}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  d="M12 14L11.2929 14.7071L12 15.4142L12.7071 14.7071L12 14ZM13 5C13 4.44772 12.5523 4 12 4C11.4477 4 11 4.44771 11 5L13 5ZM6.29289 9.70711L11.2929 14.7071L12.7071 13.2929L7.70711 8.29289L6.29289 9.70711ZM12.7071 14.7071L17.7071 9.70711L16.2929 8.29289L11.2929 13.2929L12.7071 14.7071ZM13 14L13 5L11 5L11 14L13 14Z"
                  fill="#070707"
                />
                <path
                  d="M5 16L5 17C5 18.1046 5.89543 19 7 19L17 19C18.1046 19 19 18.1046 19 17V16"
                  stroke="#070707"
                  strokeWidth="2"
                />
              </svg>
            </a>
            {isOrderFormOpen && (
              <OrderForm
                selectedHouse={widget?.house[selectedHouse || 0]?.name || ""}
                selectedTrademark={
                  widget?.trademark[selectedTrademark || 0]?.tmName || ""
                }
                selectedColor={selectedColorName || ""}
                selectedTextureUrl={selectedTextureUrl || ""}
                selectedPhotoUrl={transformedImages[0]?.url || ""}
                onClose={handleCloseOrderForm}
                translations={translations}
                adminEmail={widget.adminEmail}
                widgetName={widget.widgetName}
              />
            )}
          </div>
        </div>
      </div>
    </div>
    <div className="widget__trademark__details--wrap">
      {selectedTrademark !== null &&
        widget.trademark[selectedTrademark] && (
          <TrademarkDetails
            trademark={{
              tmName:
                widget.trademark[selectedTrademark].tmName ||
                "No name available",
              description:
                widget.trademark[selectedTrademark].description ||
                "No description available",
              logoUrl: widget.trademark[selectedTrademark].logoUrl,
              advantages:
                widget.trademark[selectedTrademark].advantages || [],
              colorTm: widget.trademark[selectedTrademark].colorTm || "",
              colors: widget.trademark[selectedTrademark].colors || [],
              desktopAdvantageUrl:
                widget.trademark[selectedTrademark].desktopAdvantageUrl ||
                "",
              mobileAdvantageUrl:
                widget.trademark[selectedTrademark].mobileAdvantageUrl ||
                "",
              nameUrl: widget.trademark[selectedTrademark].nameUrl || "",
              id: widget.trademark[selectedTrademark].id,
            }}
            translations={translations}
          />
        )}
    </div>
  </>);
};

export default WidgetDetail;