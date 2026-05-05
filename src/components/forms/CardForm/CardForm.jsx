import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import useCardForm from '../../../hooks/useCardForm';
import { CARD_RARITIES, RARITY_LABELS } from '../../../utils/constants';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import styles from './CardForm.module.css';

function CardForm({ initialValues, onSuccess, mode = 'create' }) {
  const { values, errors, touched, isSubmitting, submitError, handleChange, handleImageChange, handleBlur, submit } = useCardForm(initialValues, mode);
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files[0] || null;
    handleImageChange(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    submit(onSuccess);
  }

  const isEdit = mode === 'edit';

  return (
    <form onSubmit={handleSubmit} className={styles.form} noValidate encType="multipart/form-data">
      {submitError && <p className={styles.submitError}>{submitError}</p>}

      <Input
        name="setId"
        label="Set ID"
        value={values.setId}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.setId && errors.setId}
        placeholder="UUID of the card set"
      />

      <Input
        name="name"
        label="Card Name"
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.name && errors.name}
        placeholder="Charizard"
      />

      <Input
        name="cardNumber"
        label="Card Number"
        value={values.cardNumber}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.cardNumber && errors.cardNumber}
        placeholder="e.g. 004/102"
      />

      <Input
        name="marketPrice"
        label="Market Price (USD)"
        type="number"
        value={values.marketPrice}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.marketPrice && errors.marketPrice}
        placeholder="e.g. 9.99"
      />

      <Input
        name="attributes"
        label="Attributes (JSON)"
        value={values.attributes}
        onChange={handleChange}
        onBlur={handleBlur}
        error={touched.attributes && errors.attributes}
        placeholder='{"hp": 120, "type": "Fire"}'
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="rarity">Rarity</label>
        <select
          id="rarity"
          name="rarity"
          value={values.rarity}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${styles.select} ${touched.rarity && errors.rarity ? styles.selectError : ''}`}
        >
          {CARD_RARITIES.map(r => (
            <option key={r} value={r}>{RARITY_LABELS[r] || r}</option>
          ))}
        </select>
        {touched.rarity && errors.rarity && <span className={styles.error}>{errors.rarity}</span>}
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Card Image (optional)</label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          ref={fileRef}
          onChange={handleFile}
          className={styles.fileInput}
          aria-label="Upload card image"
        />
        {values.image instanceof File && (
          <img
            src={URL.createObjectURL(values.image)}
            alt="Preview"
            className={styles.preview}
          />
        )}
        {typeof values.image === 'string' && values.image && (
          <img src={values.image} alt="Current card" className={styles.preview} />
        )}
        {touched.image && errors.image && <span className={styles.error}>{errors.image}</span>}
      </div>

      <Button
        label={isEdit ? 'Save Changes' : 'Create Card'}
        type="submit"
        isLoading={isSubmitting}
        disabled={isSubmitting}
      />
    </form>
  );
}

CardForm.propTypes = {
  initialValues: PropTypes.object,
  onSuccess: PropTypes.func,
  mode: PropTypes.oneOf(['create', 'edit']),
};


export default CardForm;
