import React, { useRef, useState, useEffect } from "react";
import darkArrow from "../../assets/images/dark-arrow-dropdown.svg";

interface Trademark {
  tmName?: string;
  name?: string;
  iconUrl?: string;
}

interface Color {
  id: string;
  name: string;
  trademarks?: { trademarkName: string }[];
}

interface TrademarkSelectorProps {
  trademarks: Trademark[];
  widgetColors: Color[];
  selectedTrademark: number | null;
  setSelectedTrademark: (index: number | null) => void;
  selectedColor: string | null;
  translations: any;
}

const TrademarkSelector: React.FC<TrademarkSelectorProps> = ({
  trademarks,
  widgetColors,
  selectedTrademark,
  setSelectedTrademark,
  selectedColor,
  translations,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1050);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isTrademarkDisabled = (tm: Trademark) => {
    if (selectedColor !== null) {
      const selectedColorObj = widgetColors.find((c) => c.id === selectedColor);
      if (!selectedColorObj || !selectedColorObj.trademarks) return true;
      const tmName = tm.tmName || tm.name;
      return !selectedColorObj.trademarks.some(
        (t) => t.trademarkName === tmName
      );
    }
    return false;
  };

  const handleScrollLeft = () => {
    containerRef.current?.scrollBy({ left: -200, behavior: "smooth" });
  };

  const handleScrollRight = () => {
    containerRef.current?.scrollBy({ left: 200, behavior: "smooth" });
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      setScrollPosition(container.scrollLeft);
      setMaxScroll(container.scrollWidth - container.clientWidth);
    };
    container.addEventListener("scroll", onScroll);
    onScroll();
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1050);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDropdownToggle = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleTrademarkSelect = (index: number) => {
    const selectedTm = sortedTrademarks[index];
    const originalIndex = trademarks.findIndex(tm => 
      (tm.tmName || tm.name) === (selectedTm.tmName || selectedTm.name)
    );
    setSelectedTrademark(originalIndex);
    setIsDropdownOpen(false);
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.body.classList.add("trademark-blur");
    } else {
      document.body.classList.remove("trademark-blur");
    }
  }, [isDropdownOpen]);

  const selectedTrademarkObj =
    selectedTrademark !== null ? trademarks[selectedTrademark] : null;

    const getSortedTrademarks = () => {
      if (selectedColor === null) return trademarks;
    
      const selectedColorObj = widgetColors.find((c) => c.id === selectedColor);
      if (!selectedColorObj) return trademarks;
    
      const trademarksForColor = selectedColorObj.trademarks || []; // Якщо trademarks відсутній, використовуємо порожній масив
    
      return [...trademarks].sort((a, b) => {
        const aHasColor = trademarksForColor.some(
          (t) => t.trademarkName === (a.tmName || a.name)
        );
        const bHasColor = trademarksForColor.some(
          (t) => t.trademarkName === (b.tmName || b.name)
        );
    
        return Number(bHasColor) - Number(aHasColor);
      });
    };
    

  const sortedTrademarks = getSortedTrademarks();

  return (
    <div className="widget__column overflow-none">
      <span className="widget__label widget__label__desktop">{translations?.widget?.tm}</span>
      {isMobile ? (
        <div
          className={`widget__trademark__wrap ${
            isDropdownOpen ? "active" : ""
          }`}
        >
          <div className="widget__trademark--select">
            <div
              className="widget__trademark__dropdown"
              onClick={handleDropdownToggle}
            >
              {selectedTrademarkObj && selectedTrademarkObj.iconUrl && (
                <img
                  src={selectedTrademarkObj.iconUrl}
                  alt={selectedTrademarkObj.tmName || selectedTrademarkObj.name}
                  className="widget__trademark--icon"
                />
              )}
              {selectedTrademarkObj
                ? selectedTrademarkObj.tmName || selectedTrademarkObj.name
                : translations?.widget?.choose_tm}
              <img src={darkArrow} className="widget__trademark--icon" />
            </div>
            {isDropdownOpen && (
              <div
                className={`widget__trademark__list ${
                  isDropdownOpen ? "open" : ""
                }`}
              >
                {sortedTrademarks.map((tm, index) => (
                  <div
                    key={index}
                    className={`widget__trademark__list--item ${
                      isTrademarkDisabled(tm) ? "disabled" : ""
                    }`}
                    onClick={() =>
                      !isTrademarkDisabled(tm) && handleTrademarkSelect(index)
                    }
                  >
                    {tm.tmName || tm.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="widget__trademark" ref={containerRef}>
          {scrollPosition > 0 && (
            <div className="widget__trademark--prev" onClick={handleScrollLeft}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="9"
                height="14"
                viewBox="0 0 9 14"
                fill="none"
              >
                <path
                  d="M8 13L2 7L8 1"
                  stroke="#070707"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
          {sortedTrademarks.map((tm, index) => (
            <button
              key={index}
              className={`widget__trademark--button ${
                (selectedTrademarkObj && ((selectedTrademarkObj.tmName || selectedTrademarkObj.name) === (tm.tmName || tm.name))) ? "active" : ""
              }`}
              disabled={isTrademarkDisabled(tm)}
              onClick={() => {
                const originalIndex = trademarks.findIndex(t => 
                  (t.tmName || t.name) === (tm.tmName || tm.name)
                );
                setSelectedTrademark(originalIndex);
              }}
            >
              {tm.iconUrl && (
                <img
                  src={tm.iconUrl}
                  alt={tm.tmName || tm.name}
                  className="widget__trademark--icon"
                />
              )}
              {tm.tmName || tm.name}
            </button>
          ))}
          {scrollPosition < maxScroll && (
            <div
              className="widget__trademark--next"
              onClick={handleScrollRight}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="9"
                height="14"
                viewBox="0 0 9 14"
                fill="none"
              >
                <path
                  d="M1 13L7 7L1 1"
                  stroke="#070707"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrademarkSelector;
