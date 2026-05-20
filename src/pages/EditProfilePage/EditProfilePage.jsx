import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import userService from '../../services/userService';
import { validateMaxLength, validateImageFile } from '../../utils/validators';
import { parseApiError } from '../../utils/errors';
import { MAX_BIO_LENGTH, MAX_LOCATION_LENGTH } from '../../utils/constants';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import Input from '../../components/common/Input/Input';
import Button from '../../components/common/Button/Button';
import styles from './EditProfilePage.module.css';

function EditProfilePage() {
  const { t } = useTranslation();
  const { user, logout, updateUser } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [avatar, setAvatar] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) { setErrors(prev => ({ ...prev, avatar: err })); return; }
    setErrors(prev => ({ ...prev, avatar: null }));
    setAvatar(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const bioErr = validateMaxLength(bio, MAX_BIO_LENGTH, 'Bio');
    const locationErr = validateMaxLength(location, MAX_LOCATION_LENGTH, 'Location');
    if (bioErr || locationErr) { setErrors({ bio: bioErr, location: locationErr }); return; }

    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('location', location);
    if (avatar instanceof File) formData.append('avatar', avatar);

    setSubmitting(true);
    try {
      const updated = await userService.updateUserProfile(user.id, formData);
      updateUser(updated);
      addToast('success', t('profile.updated'));
      navigate('/profile', { replace: true });
    } catch (err) {
      addToast('error', parseApiError(err).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <h1 className={styles.title}>{t('profile.editProfile')}</h1>
        <div className={styles.formWrapper}>
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.field}>
              <label className={styles.label}>{t('profile.profilePicture')}</label>
              <input type="file" accept="image/jpeg,image/png,image/webp" ref={fileRef} onChange={handleFile} />
              {avatar && <img src={URL.createObjectURL(avatar)} alt={t('inventory.preview')} className={styles.preview} />}
              {errors.avatar && <span className={styles.error}>{errors.avatar}</span>}
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="bio">Bio <span className={styles.charCount}>({bio.length}/{MAX_BIO_LENGTH})</span></label>
              <textarea
                id="bio"
                className={styles.textarea}
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={MAX_BIO_LENGTH}
                rows={4}
                placeholder={t('profile.bioPlaceholder')}
              />
              {errors.bio && <span className={styles.error}>{errors.bio}</span>}
            </div>

            <Input
              name="location"
              label={t('profile.location')}
              value={location}
              onChange={e => setLocation(e.target.value)}
              error={errors.location}
              placeholder={t('profile.locationPlaceholder')}
            />

            <div className={styles.actions}>
              <Button label={t('common.cancel')} onClick={() => navigate('/profile')} variant="secondary" type="button" />
              <Button label={t('common.saveChanges')} type="submit" isLoading={submitting} disabled={submitting} />
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}

export default EditProfilePage;
