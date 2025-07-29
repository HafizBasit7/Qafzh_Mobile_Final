// utils/uploadAPI.js
import axios from 'axios';

export const uploadAPI = {
  uploadImage: async (uri, filename, mimetype) => {
    try {
      // Convert the image URI to a blob
      const response = await fetch(uri);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', blob, {
        name: filename,
        type: mimetype,
      });

      // Make the upload request
      const uploadResponse = await axios.post(
        'https://srv694651.hstgr.cloud/storage/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-api-key': 'ayzenn09876@'
          }
        }
      );

      return uploadResponse.data;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  }
};