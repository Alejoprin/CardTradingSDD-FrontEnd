import { useState, useCallback } from 'react';
import cardService from '../services/cardService';
import { validateRequired, validateMaxLength, validateImageFile } from '../utils/validators';
import { parseApiError } from '../utils/errors';

const INITIAL_VALUES = {
  setId: '',
  name: '',
  cardNumber: '',
  rarity: 'COMMON',
  attributes: '',
  marketPrice: '',
  image: null,
};

function validate(values) {
  return {
    setId: validateRequired(values.setId, 'Set ID'),
    name: validateRequired(values.name, 'Card name') || validateMaxLength(values.name, 100, 'Card name'),
    rarity: validateRequired(values.rarity, 'Rarity'),
    image: values.image instanceof File ? validateImageFile(values.image) : null,
  };
}

function useCardForm(initialValues, mode = 'create') {
  const merged = { ...INITIAL_VALUES, ...(initialValues || {}) };
  const [values, setValues] = useState(merged);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback((file) => {
    setValues(prev => ({ ...prev, image: file }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const fieldErrors = validate({ ...values, [name]: values[name] });
    setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
  }, [values]);

  const submit = useCallback(async (onSuccess) => {
    const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
    const validationErrors = validate(values);
    setTouched(allTouched);
    setErrors(validationErrors);

    const hasErrors = Object.values(validationErrors).some(Boolean);
    if (hasErrors) return;

    const cardData = {};
    Object.entries(values).forEach(([key, val]) => {
      if (key !== 'image' && val !== null && val !== undefined && val !== '') {
        cardData[key] = key === 'marketPrice' ? parseFloat(val) : val;
      }
    });

    let payload;
    if (values.image instanceof File) {
      payload = new FormData();
      payload.append('data', new Blob([JSON.stringify(cardData)], { type: 'application/json' }), 'data.json');
      payload.append('image', values.image);
    } else {
      payload = cardData;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let result;
      if (mode === 'edit' && initialValues?.id) {
        result = await cardService.updateCard(initialValues.id, payload);
      } else {
        result = await cardService.createCard(payload);
      }
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setSubmitError(parseApiError(err).message);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, mode, initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    submitError,
    handleChange,
    handleImageChange,
    handleBlur,
    submit,
  };
}

export default useCardForm;
