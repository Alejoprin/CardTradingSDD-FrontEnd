import { useState, useCallback } from 'react';

function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues || {});
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setValues(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    if (validate) {
      const fieldErrors = validate({ ...values, [name]: values[name] });
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] || null }));
    }
  }, [values, validate]);

  const handleSubmit = useCallback((onSubmit) => async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    let validationErrors = {};
    if (validate) {
      validationErrors = validate(values);
      const allTouched = Object.keys(values).reduce((acc, k) => ({ ...acc, [k]: true }), {});
      setTouched(allTouched);
      setErrors(validationErrors);
    }

    const hasErrors = Object.values(validationErrors).some(Boolean);
    if (hasErrors) return;

    setIsSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setIsSubmitting(false);
    }
  }, [values, validate]);

  const setFieldError = useCallback((name, message) => {
    setErrors(prev => ({ ...prev, [name]: message }));
  }, []);

  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const reset = useCallback((newValues) => {
    setValues(newValues || initialValues || {});
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldError,
    setFieldValue,
    reset,
  };
}

export default useForm;
