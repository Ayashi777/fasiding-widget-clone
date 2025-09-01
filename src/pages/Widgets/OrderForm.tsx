import React, { useState } from "react";
import shieldIcon from "../../assets/images/shield.svg";
import formClose from "../../assets/images/form-close.svg";

interface OrderFormProps {
  selectedHouse: string | null;
  selectedTrademark: string | null;
  selectedColor: string | null;
  selectedTextureUrl: string | null;
  selectedPhotoUrl: string | null;
  onClose: () => void;
  translations: any;
  adminEmail: string;
  widgetName: string;
 // pdfUrl: string;
}

const OrderForm: React.FC<OrderFormProps> = ({
  selectedHouse,
  selectedTrademark,
  selectedColor,
  selectedTextureUrl,
  selectedPhotoUrl,
  onClose,
  translations,
  adminEmail,
  widgetName,
//  pdfUrl
}) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
  
    const formData = {
      adminEmail,
      widgetName,
      name,
      phone,
      email,
      selectedHouse,
      selectedTrademark,
      selectedColor,
      selectedTextureUrl,
      selectedPhotoUrl,
    //  pdfUrl,
      translations, 
    };
  
    try {
      const response = await fetch("https://vizualizator.fasiding.com.ua/send-mail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const data = await response.json();
  
      if (data.success) {
        setIsSubmitted(true);
      } else {
        alert("Помилка при надсиланні листа. Спробуйте ще раз.");
      }
    } catch (error) {
      console.error("Помилка при надсиланні:", error);
      alert("Помилка з'єднання з сервером.");
    } finally {
      setIsSending(false);
    }
  };
  

  const handleOkClick = () => {
    setIsSubmitted(false);
    onClose();
  };

  return (
    <div className="order__form__overlay">
      <div className={`order__form ${isSubmitted ? "order__form--thank" : ""}`}>
        {isSubmitted ? (
          <div className="order__form__thank-you">
            <div className="order__form__thank-you-message">
              {translations?.form?.thank_you}
            </div>
            <button className="order__form__ok-button" onClick={handleOkClick}>
              {translations?.form?.ok}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="order__form__column">
              <div className="order__form__title">
                {translations?.form?.leave_request}
              </div>
              <div className="order__form__fields">
                <div className="order__form__field">
                  <label>{translations?.form?.name}</label>
                  <input
                    placeholder={translations?.form?.enter_name}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="order__form__field">
                  <label>{translations?.form?.phone_number}</label>
                  <input
                    placeholder={translations?.form?.enter_phone}
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="order__form__field">
                  <label>{translations?.form?.email}</label>
                  <input
                    placeholder={translations?.form?.enter_email}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="order__form__guarantee order__form__guarantee--dekstop">
                <p className="order__form__guarantee--title">{translations?.form?.data_protection}</p>
                <div className="order__form__guarantee--description">
                  <img src={shieldIcon} alt="" />
                  <p>{translations?.form?.data_protection}</p>
                </div>
              </div>
            </div>
            <div className="order__form__column">
              <div className="widget__label">{translations?.form?.selected_fasad}</div>
              <div className="order__form__choice">
                <div>
                  {selectedPhotoUrl && (
                    <img width={100} src={selectedPhotoUrl} alt="Фото" />
                  )}
                </div>
                <div>
                  {selectedTextureUrl && (
                    <img src={selectedTextureUrl} alt="Текстура" />
                  )}
                </div>
              </div>
              <div className="widget__label">{translations?.form?.color}</div>
              <div className="order__form__field">
                <span>{selectedColor}</span>
              </div>
              <div className="widget__label">{translations?.form?.tm}</div>
              <div className="order__form__field">
                <span>{selectedTrademark}</span>
              </div>
              <div className="widget__label">{translations?.form?.house_type}</div>
              <div className="order__form__field">
                <span>{selectedHouse}</span>
              </div>
              <div className="order__form__guarantee order__form__guarantee--mobile">
                <p className="order__form__guarantee--title">{translations?.form?.data_protection}</p>
                <div className="order__form__guarantee--description">
                  <img src={shieldIcon} alt="" />
                  <p>{translations?.form?.data_protection}</p>
                </div>
              </div>
              <button className="order__form__button" type="submit" disabled={isSending}>
                {isSending ? (
                  <span
                    style={{
                      display: "inline-block",
                      width: "20px",
                      height: "20px",
                      border: "2px solid #fff",
                      borderTop: "2px solid transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite"
                    }}
                  ></span>
                ) : (
                  translations?.form?.get_consultation
                )}
              </button>
            </div>
          </form>
        )}
        <button className="order__form__close" onClick={onClose}>
          <img src={formClose} alt="" />
        </button>

        <style>
          {`@keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }`}
        </style>
      </div>
    </div>
  );
};

export default OrderForm;
