import React, { useState, useEffect } from "react";
import dropdown from "../../assets/images/dropdown.svg";
import { House } from "./types";


interface HouseSelectorProps {
  houses: House[];
  selectedHouse: number | null;
  setSelectedHouse: (index: number | null) => void;
  translations: any;
}

const HouseSelector: React.FC<HouseSelectorProps> = ({ houses, selectedHouse, setSelectedHouse, translations }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (index: number) => {
    setSelectedHouse(index);
    setIsOpen(false);
  };

  const selectedHouseObj = selectedHouse !== null ? houses[selectedHouse] : null;

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("body-overlay");
    } else {
      document.body.classList.remove("body-overlay");
    }

    return () => {
      document.body.classList.remove("body-overlay");
    };
  }, [isOpen]);

  return (
    <div className="widget__houses__wrap">
      <div className="widget__houses">
        <div className="widget__houses__dropdown" onClick={() => setIsOpen(!isOpen)}>
          {selectedHouseObj && selectedHouseObj.iconUrl && (
            <img
              src={selectedHouseObj.iconUrl}
              alt={selectedHouseObj.name}
              className="widget__houses--icon"
            />
          )}
          {selectedHouseObj ? selectedHouseObj.name : translations?.widget?.choose_house }
          <img src={dropdown} alt="dropdown" className="widget__houses__arrow" />
        </div>

        {isOpen && (
          <div className={`widget__houses__list ${isOpen ? "open" : ""}`}>
            {houses.map((house, index) => (
              <div
                key={index}
                className="widget__houses__list--item"
                onClick={() => handleSelect(index)}
              >
                {house.iconUrl && (
                  <img
                    src={house.iconUrl}
                    alt={house.name}
                    className="widget__houses--icon"
                  />
                )}
                {house.name}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HouseSelector;