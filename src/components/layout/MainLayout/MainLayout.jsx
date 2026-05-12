import React from 'react';
import PropTypes from 'prop-types';
import Header from '../Header/Header';
import Sidebar from '../Sidebar/Sidebar';
import Footer from '../Footer/Footer';
import ToastContainer from '../../common/Toast/ToastContainer';
import { useUI } from '../../../context/UIContext';
import styles from './MainLayout.module.css';

function MainLayout({ user, onLogout, children }) {
  const { sidebarOpen, closeSidebar } = useUI();

  return (
    <div className={styles.root}>
      <Header user={user} onLogout={onLogout} />
      <div className={styles.body}>
        <Sidebar isOpen={sidebarOpen} />

        {/* Overlay para cerrar sidebar en mobile al tocar fuera */}
        {sidebarOpen && (
          <div className={styles.overlay} onClick={closeSidebar} aria-hidden="true" />
        )}

        <main className={styles.main}>
          {children}
        </main>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  );
}

MainLayout.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
  onLogout: PropTypes.func,
};

export default MainLayout;