import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import useProfile from '../../hooks/useProfile';
import userService from '../../services/userService';
import { validateImageFile } from '../../utils/validators';
import { parseApiError } from '../../utils/errors';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import ProfileCard from '../../components/features/profile/ProfileCard/ProfileCard';
import ProfileStats from '../../components/features/profile/ProfileStats/ProfileStats';
import Button from '../../components/common/Button/Button';
import Spinner from '../../components/common/Spinner/Spinner';
import styles from './ProfilePage.module.css';

function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();
  const { profile, loading, error } = useProfile(user?.id);
  const [uploadLoading, setUploadLoading] = useState(false);

  async function handleImageUpload(file) {
    const imgError = validateImageFile(file);
    if (imgError) { addToast('error', imgError); return; }
    setUploadLoading(true);
    try {
      const updated = await userService.uploadProfileImage(user.id, file);
      updateUser({ profileImageUrl: updated.profileImageUrl });
      addToast('success', 'Profile photo updated!');
    } catch (err) {
      addToast('error', parseApiError(err).message);
    } finally {
      setUploadLoading(false);
    }
  }

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <h1 className={styles.title}>My Profile</h1>

        {loading && <div className={styles.center}><Spinner size="lg" /></div>}
        {error && <p className={styles.error}>{error}</p>}

        {profile && (
          <>
            <ProfileCard
              profile={{ ...profile, profileImageUrl: user?.profileImageUrl || profile.profileImageUrl }}
              showEmail={true}
              onImageUpload={handleImageUpload}
              uploadLoading={uploadLoading}
            />
            <ProfileStats stats={profile.stats || {}} />
            <div className={styles.actions}>
              <Button label="Edit Profile" onClick={() => navigate('/profile/edit')} variant="secondary" />
              <Button label="Change Password" onClick={() => navigate('/profile/change-password')} variant="ghost" />
              <Button label="Logout" onClick={logout} variant="danger" />
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}

export default ProfilePage;
