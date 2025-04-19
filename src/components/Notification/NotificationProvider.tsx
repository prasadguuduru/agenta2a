// src/components/Notification/NotificationProvider.tsx
import React, { useEffect, useState } from 'react';
import Notification from './Notification';
import notificationService, { NotificationOptions } from '../../services/notificationService';

interface NotificationState extends NotificationOptions {
  id: number;
}

const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationState[]>([]);
  const [notificationCounter, setNotificationCounter] = useState(0);
  
  useEffect(() => {
    // Subscribe to notification service
    const unsubscribe = notificationService.subscribe((options: NotificationOptions) => {
      const id = notificationCounter;
      setNotificationCounter(prev => prev + 1);
      
      setNotifications(prev => [...prev, { ...options, id }]);
    });
    
    // Cleanup subscription
    return () => {
      unsubscribe();
    };
  }, [notificationCounter]);
  
  const handleClose = (id: number) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  return (
    <>
      {/* Pass through children */}
      {children}
      
      {/* Render notifications */}
      <div className="fixed bottom-0 right-0 z-50 p-4 space-y-4">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
            duration={notification.duration}
            onClose={() => handleClose(notification.id)}
          />
        ))}
      </div>
    </>
  );
};

export default NotificationProvider;