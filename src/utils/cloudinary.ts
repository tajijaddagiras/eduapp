import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = async (
  uri: string,
  folder: string = 'profiles',
  resourceType: 'image' | 'video' | 'auto' = 'image'
): Promise<string> => {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Konfigurasi Cloudinary belum lengkap di .env');
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  // Di Web atau jika URI adalah data URI (base64)
  if (Platform.OS === 'web' || uri.startsWith('data:')) {
    const formData = new FormData();
    
    if (Platform.OS === 'web' && uri.startsWith('blob:')) {
      const blobRes = await fetch(uri);
      const blobData = await blobRes.blob();
      const defaultFileName = resourceType === 'video' ? 'upload.mp4' : 'upload.jpg';
      formData.append('file', blobData, defaultFileName);
    } else {
      formData.append('file', uri);
    }

    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', folder);

    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!data.secure_url) {
      throw new Error(data.error?.message || 'Upload gagal');
    }
    return data.secure_url;
  }

  // Di platform Native (iOS & Android) menggunakan FileSystem.uploadAsync
  // Ini menghindari error 'Unsupported FormDataPart implementation' pada SDK 57
  const response = await FileSystem.uploadAsync(endpoint, uri, {
    httpMethod: 'POST',
    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
    fieldName: 'file',
    parameters: {
      upload_preset: UPLOAD_PRESET,
      folder,
    },
  });

  const data = JSON.parse(response.body);
  if (!data.secure_url) {
    throw new Error(data.error?.message || 'Upload gagal');
  }
  return data.secure_url;
};

export const uploadVideoToCloudinary = async (
  uri: string,
  folder: string = 'edusampah/videos'
): Promise<string> => {
  return uploadToCloudinary(uri, folder, 'video');
};
