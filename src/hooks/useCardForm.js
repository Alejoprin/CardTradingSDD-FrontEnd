import { useState, useCallback } from 'react';
import cardService from '../services/cardService';
import { validateRequired, validateMaxLength, validateImageFile } from '../utils/validators';
import { parseApiError } from '../utils/errors';

const INITIAL_VALUES = {
  name: '',
  series: '',
  number: '',
  description: '',
  rarity: 'common',
  condition: 'mint',
  image: null,
};

function validate(values) {
  return {
    name: validateRequired(values.name, 'Card name') || validateMaxLength(values.name, 100, 'Card name'),
    series: validateRequired(values.series, 'Series'),
    number: validateRequired(String(values.number || ''), 'Card number'),
    rarity: validateRequired(values.rarity, 'Rarity'),
    condition: validateRequired(values.condition, 'Condition'),
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

    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      if (key === 'image') {
        if (val instanceof File) formData.append('image', val);
      } else if (val !== null && val !== undefined) {
        formData.append(key, String(val));
      }
    });

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      let result;
      if (mode === 'edit' && initialValues?.id) {
        result = await cardService.updateCard(initialValues.id, formData);
      } else {
        result = await cardService.createCard(formData);
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
