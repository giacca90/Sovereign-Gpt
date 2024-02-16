export const packagerConfig = {
  asar: true,
  derefSymlinks: true,
//  icon: 'favicon.ico'
};
export const rebuildConfig = {};
export const makers = [
  {
    name: '@electron-forge/maker-squirrel',
    config: {
//      certificateFile: './cert.pfx',
//      certificatePassword: process.env.CERTIFICATE_PASSWORD,
      authors: 'Giacca90',
      description: 'ChatBot Soberano',
//      setupIcon: 'favicon.ico'
    },
  },
  {
    name: '@electron-forge/maker-zip',
    platforms: ['darwin', 'win32'],
  },
  {
    name: '@electron-forge/maker-deb',
    config: {
      iconUrl: 'favicon-linux.png'
    },
  },
  {
    name: '@electron-forge/maker-rpm',
    config: {
      iconUrl: 'favicon-linux.png'
    },
  },
];
export const plugins = [
  {
    name: '@electron-forge/plugin-auto-unpack-natives',
    config: {},
  },
];
