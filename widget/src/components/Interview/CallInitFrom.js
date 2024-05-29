import React, { useState } from 'react';

export const StartCallFrom = ({ onSubmit, products = [] }) => {
  const [errors, setErrors] = useState({});
  const [checkedBtn, setCheckedBtn] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);

    let validationErrors = {};

    if (!formData.get('fname').trim()) {
      validationErrors.fname =
        "Add a valid first name into the field. It's required information to start conversation.";
    }

    if (!formData.get('lname').trim()) {
      validationErrors.lname =
        "Add a valid last name into the field. It's required information to start conversation.";
    }

    if (!formData.get('email').trim()) {
      validationErrors.email =
        "Add a valid email into the field. It's required information to start conversation.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      const formDataObj = Array.from(formData.entries()).reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {},
      );
      // console.log({ formDataObj });
      onSubmit({ ...formDataObj });
    }
  };

  return (
    <form className="kohorta-voice-feedback-app__form" onSubmit={handleSubmit}>
      <div className="kohorta-voice-feedback-app__form-field-list">
        <div className="kohorta-voice-feedback-app__form-field">
          <span className="kohorta-voice-feedback-app__field-label">
            What product have you used?
          </span>
          <div
            className="kohorta-voice-feedback-app__product-list"
            style={{
              marginBottom: '0.5rem',
            }}
          >
            {products.map((product, index) => (
              <label
                htmlFor={product}
                key={product}
                className={`kohorta-voice-feedback-app__product ${
                  index == checkedBtn ? 'checked' : ''
                }`}
              >
                <input
                  type="radio"
                  id={product}
                  name="product"
                  value={product}
                  checked={index == checkedBtn}
                  onChange={() => {
                    setCheckedBtn(index);
                  }}
                />
                <span>{product}</span>
              </label>
            ))}
          </div>
        </div>
        <label
          htmlFor="fname"
          className="kohorta-voice-feedback-app__form-field"
        >
          <span className="kohorta-voice-feedback-app__field-label">
            First name<span className="required">*</span>
          </span>
          <input type="text" id="fname" name="fname" placeholder="John" />
          {errors.fname && (
            <div className="kohorta-voice-feedback-app__form-field-error">
              {errors.fname}
            </div>
          )}
        </label>
        <label
          htmlFor="lname"
          className="kohorta-voice-feedback-app__form-field"
        >
          <span className="kohorta-voice-feedback-app__field-label">
            Last name<span className="required">*</span>
          </span>
          <input type="text" id="lname" name="lname" placeholder="Johnson" />
          {errors.lname && (
            <div className="kohorta-voice-feedback-app__form-field-error">
              {errors.lname}
            </div>
          )}
        </label>
        <label
          htmlFor="email"
          className="kohorta-voice-feedback-app__form-field"
        >
          <span className="kohorta-voice-feedback-app__field-label">
            Email address<span className="required">*</span>
          </span>
          <input
            type="text"
            id="email"
            name="email"
            placeholder="j.johnson@company.com"
          />
          {errors.email && (
            <div className="kohorta-voice-feedback-app__form-field-error">
              {errors.email}
            </div>
          )}
        </label>
      </div>
      <button className="kohorta-voice-feedback-app__cta">
        Start conversation
      </button>
      <span className="kohorta-voice-feedback-app__help-text">
        *To start recording the conversation, allow your browser to use the
        microphone.
      </span>
    </form>
  );
};
