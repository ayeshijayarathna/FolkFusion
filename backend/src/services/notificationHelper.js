const Notification = require('../models/Notification');

/**
 * creates a notification via Socket.IO and saves it to the database
 *
 * @param {object} io        
 * @param {object} payload  
 * @param {string}   payload.recipientUserId 
 * @param {string}   payload.recipientRole    
 * @param {string}   payload.province        
 * @param {string}   payload.type             
 * @param {string}   payload.title            
 * @param {string}   payload.message        
 * @param {object}  [payload.data]          
 */
async function createNotification(io, {
  recipientUserId,
  recipientRole,
  province,
  type,
  title,
  message,
  data = {},
}) {
  try {
    const notification = await Notification.create({
      recipient:     recipientUserId,
      recipientRole,
      province,
      type,
      title,
      message,
      data,
    });

    // emit to the recipient's private socket room
    if (io) {
      io.to(`user_${recipientUserId}`).emit('new_notification', {
        _id:       notification._id,
        type:      notification.type,
        title:     notification.title,
        message:   notification.message,
        data:      notification.data,
        isRead:    false,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (err) {
    // notification failure must never break the main request
    console.error('createNotification error:', err.message);
    return null;
  }
}

module.exports = { createNotification };