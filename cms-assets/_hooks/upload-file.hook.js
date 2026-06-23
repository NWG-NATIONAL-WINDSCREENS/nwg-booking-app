// import { store } from '../_stores/store.js';
// import {useUploadImageMutation} from "../_services/booking.api.js";
//
// export async function uploadFileToHubSpot(file, enquiryId) {
//   const secrets = store.getState().secret;
//   const { hubspot_api_key } = secrets;
//
//   const [uploadImage, { isLoading, isError, error }] = useUploadImageMutation();
//
//
//   if (!file) {
//     console.error('No file selected.');
//     return null;
//   }
//
//   const formData = new FormData();
//   formData.append('file', file);
//   formData.append('folderPath', `/Booking/${enquiryId}/`);
//   formData.append('options', JSON.stringify({ access: 'PRIVATE' }));
//
//   try {
//    await dispatchuploadImage(file, formData, enquiryId);
//
//     if (!response.ok) {
//       console.error(`Failed to upload file: ${response.statusText}`);
//       return null;
//     }
//
//     const data = await response.json();
//     return data.url;
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     return null;
//   }
// }
