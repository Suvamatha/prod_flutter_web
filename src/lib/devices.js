/**
 * Device presets used by <PhoneFrame>. width/height are CSS viewport pixels,
 * statusBar/homeIndicator are the safe-area insets drawn by the frame. The
 * hosted Flutter app only receives the space between them, so the frame never
 * overlaps (or intercepts taps on) the app.
 */
export const DEVICES = [
  { id: 'iphone-15-pro', name: 'iPhone 15 Pro', width: 393, height: 852, radius: 56, bezel: 12, statusBar: 54, homeIndicator: 30, cutout: 'island', os: 'ios' },
  { id: 'iphone-15-pro-max', name: 'iPhone 15 Pro Max', width: 430, height: 932, radius: 60, bezel: 12, statusBar: 54, homeIndicator: 30, cutout: 'island', os: 'ios' },
  { id: 'pixel-8', name: 'Pixel 8', width: 412, height: 915, radius: 46, bezel: 11, statusBar: 40, homeIndicator: 22, cutout: 'punch', os: 'android' },
  { id: 'galaxy-s24', name: 'Galaxy S24', width: 360, height: 780, radius: 42, bezel: 9, statusBar: 36, homeIndicator: 20, cutout: 'punch', os: 'android' },
]

export const DEFAULT_DEVICE = DEVICES[0]
export const getDevice = (id) => DEVICES.find((d) => d.id === id) || DEFAULT_DEVICE
