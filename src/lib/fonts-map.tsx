type FontInfo = {
  name: string;
  className: string;
};

type FontMap = {
  [fontFamilyName: string]: FontInfo;
};

export const fontsMap: FontMap = {
  DM_Sans: {
    className: "font-dm-sans",
    name: "DM Sans",
  },
  DM_Serif_Display: {
    className: "font-dm-serif-display",
    name: "DM Serif Display",
  },
  GeistSans: {
    className: "font-geist-sans",
    name: "Geist Sans",
  },
  Montserrat: {
    className: "font-montserrat",
    name: "Montserrat",
  },
  PT_Serif: {
    className: "font-pt-serif",
    name: "PT Serif",
  },
  Roboto: {
    className: "font-roboto",
    name: "Roboto",
  },
  Roboto_Condensed: {
    className: "font-roboto-condensed",
    name: "Roboto Condensed",
  },
  Ultra: {
    className: "font-ultra",
    name: "Ultra",
  },
  Inter: {
    className: "font-inter",
    name: "Inter",
  },
  Syne: {
    className: "font-syne",
    name: "Syne",
  },
  ArchivoBlack: {
    className: "font-archivo-black",
    name: "Archivo Black",
  },
  Playfair_Display: {
    className: "font-playfair-display",
    name: "Playfair Display",
  },
  Poppins: {
    className: "font-poppins",
    name: "Poppins",
  },
  Oswald: {
    className: "font-oswald",
    name: "Oswald",
  },
  Merriweather: {
    className: "font-merriweather",
    name: "Merriweather",
  },
  Lato: {
    className: "font-lato",
    name: "Lato",
  },
  Raleway: {
    className: "font-raleway",
    name: "Raleway",
  },
  Quicksand: {
    className: "font-quicksand",
    name: "Quicksand",
  },
  Bebas_Neue: {
    className: "font-bebas-neue",
    name: "Bebas Neue",
  },
};

export function fontIdToClassName(fontId: string) {
  return fontsMap[fontId].className;
}
