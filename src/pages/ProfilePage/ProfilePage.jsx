import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import useProfile from '../../hooks/useProfile';
import MainLayout from '../../components/layout/MainLayout/MainLayout';
import ProfileCard from '../../components/features/profile/ProfileCard/ProfileCard';
import ProfileStats from '../../components/features/profile/ProfileStats/ProfileStats';
import Button from '../../components/common/Button/Button';
import Spinner from '../../components/common/Spinner/Spinner';
import styles from './ProfilePage.module.css';

function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { profile, loading, error } = useProfile(user?.id);

  return (
    <MainLayout user={user} onLogout={logout}>
      <div className={styles.page}>
        <h1 className={styles.title}>My Profile</h1>

        {loading && <div className={styles.center}><Spinner size="lg" /></div>}
        {error && <p className={styles.error}>{error}</p>}

        {profile && (
          <>
            <ProfileCard profile={profile} showEmail={true} />
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
