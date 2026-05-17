import { Configuration, PopupRequest } from '@azure/msal-browser';

export const msalConfig: Configuration = {
  auth: {
    clientId: process.env.NEXT_PUBLIC_AZURE_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${process.env.NEXT_PUBLIC_AZURE_TENANT_ID || 'common'}`,
    redirectUri: typeof window !== 'undefined' ? window.location.origin : '',
  },
  cache: {
    cacheLocation: 'sessionStorage',
  },
};

export const loginRequest: PopupRequest = {
  scopes: ['Sites.Read.All', 'Files.Read.All', 'User.Read'],
};

export const sharePointConfig = {
  siteUrl: process.env.NEXT_PUBLIC_SHAREPOINT_SITE_URL || '',
  listName: process.env.NEXT_PUBLIC_SHAREPOINT_LIST_NAME || 'OKR Data',
  driveId: process.env.NEXT_PUBLIC_SHAREPOINT_DRIVE_ID || '',
  fileId: process.env.NEXT_PUBLIC_SHAREPOINT_FILE_ID || '',
};
