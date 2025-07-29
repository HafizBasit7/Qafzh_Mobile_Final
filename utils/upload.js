import axios, { AxiosError } from "axios";
import * as ImageManipulator from 'expo-image-manipulator';

export const uploadImage = async (asset, fileName) => {
  try {
    // Compress the image before uploading
    const compressedImage = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 800 } }], // Resize to max width of 800px
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG } // Compress to 70% quality
    );

    const formData = new FormData();
    formData.append('file', {
      uri: compressedImage.uri,
      name: asset.fileName || fileName,
      type: 'image/jpeg',
    });

    // const formData = new FormData();
    // formData.append("file", file);

    // console.log("Uploading Image:", asset.fileName); // Debugging

    const response = await axios.post("https://srv694651.hstgr.cloud/storage/upload", formData, 
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          "x-api-key": "ayzenn09876@", 
        },
        maxContentLength: 10 * 1024 * 1024, // 10MB max
        maxBodyLength: 10 * 1024 * 1024, // 10MB max
      }
    );

    const data = response.data;
    // console.log("Upload Response:", data); // Debugging

    // ✅ Fix: Return the correct field (fileUrl)
    if (data.fileUrl) {
      return data.fileUrl; 
    } else {
      throw new Error(data.message || "Image upload failed.");
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    if (error.response?.status === 413) {
      throw new Error("Image is too large. Please try uploading a smaller image.");
    }
    throw error;
  }
};