import type { Settings } from '../../interfaces/settings.interfaces';

const elementSpecificStyles = ['color', 'backgroundColor', 'fontSize'] as const;

export const settings: Settings<typeof elementSpecificStyles> = {
  allowedStyles: elementSpecificStyles,
  defaultStyles: {
    color: '#000000',
    backgroundColor: '#ffffff',
    fontSize: '1rem',
  }
};

export default settings;
