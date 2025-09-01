import React from "react";
import { Translations } from './types';

interface TrademarkDetailsProps {
  trademark: {
    tmName: string;
    description: string;
    logoUrl: string;
    advantages: { image: string; text: string }[];
    colorTm: string;
    colors: { image: string; name: string }[];
    desktopAdvantageUrl: string;
    mobileAdvantageUrl: string;
    nameUrl: string;
    id: string;
  };
  translations: any;
}

const parseDescription = (description: string, color: string): string => {
  return description.replace(/<span([^>]*)>/g, (match, attr) => {
    if (attr.includes('style=')) {
      return match.replace(/style="([^"]*)"/, (matchStyle, styleContent) => {
        return `style="${styleContent} color: ${color};"`; 
      });
    }
    return `<span style="color: ${color};"${attr}>`;
  });
};

const TrademarkDetails: React.FC<TrademarkDetailsProps> = ({ trademark, translations }) => {
  const formattedDescription = parseDescription(trademark.description, trademark.colorTm);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <div className="widget__trademark__details container">
        
        <div className={`widget__trademark__details--columns ${trademark.nameUrl ? 'additional-layout' : ''}`}>
          <div className="widget__trademark__details--column">
          <div className="widget__label">{translations?.widget?.about_tm}</div>
            <h3 className="td-color" style={{ color: trademark.colorTm }}>
              {trademark.nameUrl && (
                  <img src={trademark.logoUrl} alt={trademark.tmName} className="tm-logo-inline" />
              )}
              {trademark.tmName}
            </h3>
          </div>

          <div className="widget__trademark__details--column">
            {trademark.nameUrl ? (
              <div className="vox-wrapper">
                <img src={trademark.nameUrl} alt={trademark.tmName} />
              </div>
            ) : (
              <img src={trademark.logoUrl} alt={trademark.tmName} />
            )}
          </div>

        </div>
        <div className="widget__trademark__details--description">
          <p dangerouslySetInnerHTML={{ __html: formattedDescription }} />
        </div>
        <div className="widget__trademark__details--desktop">
          <img src={trademark.desktopAdvantageUrl} alt="Desktop Advantage" />
        </div>
        <div className="widget__trademark__details--mobile">
          <img src={trademark.mobileAdvantageUrl} alt="Mobile Advantage" />
          {trademark.advantages && trademark.advantages.length > 0 && (
            <div className="widget__trademark__details--advantages">
              {trademark.advantages.map((adv, index) => (
                <div key={index} className="widget__trademark__details--advantage">
                  <img src={adv.image} alt={adv.text} />
                  <p>{adv.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="widget__trademark__details--button">
        <a
  className="td-bg-color"
  href="#top"
        style={{
          backgroundColor: trademark.colorTm,
          border: `2px solid ${trademark.colorTm}`,
          transition: "all 0.3s ease-in-out",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.border = `2px solid ${trademark.colorTm}`;
          e.currentTarget.style.color = trademark.colorTm;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = trademark.colorTm;
          e.currentTarget.style.border = `2px solid ${trademark.colorTm}`;
          e.currentTarget.style.color = "#fff";
        }}
        onClick={handleScroll}
      >
        Обрати фасад
      </a>

        </div>
      </div>

      {trademark.colors && trademark.colors.length > 0 && (
        <div className="trademark-colors">
          {trademark.colors.map((color, index) => (
            <div key={index} className="color">
              <img src={color.image} alt={color.name} />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default TrademarkDetails;
