import React, { useState, useRef, useEffect, Dispatch, SetStateAction } from "react";
import { Color, Trademark } from "./types";

interface ColorSelectorProps {
  colors: Color[];
  selectedColor: string | null;
  setSelectedColor: (id: string | null) => void;
  trademarks: Trademark[];
  selectedTrademark: number | null;
  onHoverTexture: (textureUrl: string | null) => void;
  onHoverColor: Dispatch<SetStateAction<Color | null>>;
}

const ColorSelector: React.FC<ColorSelectorProps> = ({
  colors,
  selectedColor,
  setSelectedColor,
  trademarks,
  selectedTrademark,
  onHoverTexture,
  onHoverColor,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const scrollStartX = useRef<number>(0);

  useEffect(() => {
    const updateScrollState = () => {
      const container = containerRef.current;
      if (!container) return;

      const { scrollLeft, clientWidth, scrollWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
      setHasOverflow(scrollWidth > clientWidth);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollState);
    }
    window.addEventListener("resize", updateScrollState);
    updateScrollState();

    return () => {
      if (container) {
        container.removeEventListener("scroll", updateScrollState);
      }
      window.removeEventListener("resize", updateScrollState);
    };
  }, [colors]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 992);
      setIsSmallScreen(window.innerWidth <= 1050);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scroll = (direction: "left" | "right") => {
    const container = containerRef.current;
    if (container) {
      const scrollAmount = direction === "left" ? -200 : 200;
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    if (containerRef.current) {
      scrollStartX.current = containerRef.current.scrollLeft;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current !== null && containerRef.current) {
      const deltaX = touchStartX.current - e.touches[0].clientX;
      containerRef.current.scrollLeft = scrollStartX.current + deltaX;
    }
  };

  const handleTouchEnd = () => {
    touchStartX.current = null;
  };

  const isColorActive = (color: Color) => selectedColor === color.id;
  const isColorDisabled = (color: Color) => {
    if (selectedTrademark !== null) {
      const selectedTm = trademarks[selectedTrademark];
      const selectedTmName = selectedTm.tmName || selectedTm.name;
      return !(color.trademarks && color.trademarks.some((tm) => tm.trademarkName === selectedTmName));
    }
    return false;
  };

  const getFirstTextureUrl = (color: Color) => {
    return color.trademarks?.[0]?.trademarkTextureUrl || null;
  };

  const getSortedColors = (colors: Color[], trademarks: Trademark[], selectedTrademark: number | null) => {
    if (selectedTrademark === null) return colors;

    const selectedTm = trademarks[selectedTrademark];
    const selectedTmName = selectedTm.tmName || selectedTm.name;

    return [...colors].sort((a, b) => {
      const aHasTrademark = a.trademarks?.some((tm) => tm.trademarkName === selectedTmName) ?? false;
      const bHasTrademark = b.trademarks?.some((tm) => tm.trademarkName === selectedTmName) ?? false;

      return Number(bHasTrademark) - Number(aHasTrademark);
    });
  };

  const sortedColors = getSortedColors(colors, trademarks, selectedTrademark);

  return (
    <div
      className="widget__colors-container"
      style={{
        position: "relative",
        paddingBottom: isMobile ? "0" : "10px",
      }}
    >
      {hasOverflow && canScrollLeft && !isSmallScreen && (
        <button className="widget__colors__scroll--prev left" onClick={() => scroll("left")}>
          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="14" viewBox="0 0 9 14" fill="none">
            <path d="M8 13L2 7L8 1" stroke="#070707" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}

      <div
        className="widget__colors"
        ref={containerRef}
        style={{
          paddingLeft: canScrollLeft && !isSmallScreen ? "40px" : "0px",
          paddingRight: canScrollRight && !isSmallScreen ? "40px" : "0px",
          overflowX: hasOverflow ? "auto" : "visible",
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {sortedColors.map((color) => {
          const textureUrl = getFirstTextureUrl(color);
          return (
            <button
              key={color.id}
              className={`widget__colors--button ${isColorActive(color) ? "active" : ""}`}
              disabled={isColorDisabled(color)}
              onClick={() => setSelectedColor(color.id)}
              onMouseEnter={() => {
                onHoverTexture(textureUrl);
                onHoverColor(color);
              }}
              onMouseLeave={() => {
                onHoverTexture(null);
                onHoverColor(null);
              }}
              style={{
                backgroundImage: textureUrl ? `url(${textureUrl})` : "none",
              }}
            >
              <div className="widget__colors--wrap">
                <div className="widget__colors--name">{color.name}</div>
              </div>
              <div className="widget__colors--cross">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <path d="M2 38L38 2" stroke="#979797" strokeWidth="3" strokeLinecap="round" />
                  <path d="M38 38L2 2" stroke="#979797" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
            </button>
          );
        })}
      </div>

      {hasOverflow && canScrollRight && !isSmallScreen && (
        <button className="widget__colors__scroll--next right" onClick={() => scroll("right")}>
          <svg xmlns="http://www.w3.org/2000/svg" width="9" height="14" viewBox="0 0 9 14" fill="none">
            <path d="M1 13L7 7L1 1" stroke="#070707" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ColorSelector;
