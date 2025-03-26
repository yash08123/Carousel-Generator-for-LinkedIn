import React from "react";
import { useReactToPrint } from "react-to-print";
import { SIZE } from "@/lib/page-size";
import { useFieldArrayValues } from "@/lib/hooks/use-field-array-values";
import { useFormContext } from "react-hook-form";
import { DocumentFormReturn } from "@/lib/document-form-types";
import { toCanvas } from "html-to-image";
import { Options as HtmlToImageOptions } from "html-to-image/lib/types";
import { jsPDF, jsPDFOptions } from "jspdf";

// TODO: Create a reusable component and package with this code

type HtmlToPdfOptions = {
  margin: [number, number, number, number];
  filename: string;
  image: { type: string; quality: number };
  htmlToImage: HtmlToImageOptions;
  jsPDF: jsPDFOptions;
};

// Convert units to px using the conversion value 'k' from jsPDF.
export const toPx = function toPx(val: number, k: number) {
  return Math.floor(((val * k) / 72) * 96);
};

function getPdfPageSize(opt: HtmlToPdfOptions) {
  // Retrieve page-size based on jsPDF settings, if not explicitly provided.
  // @ts-ignore function not explicitly exported
  const pageSize = jsPDF.getPageSize(opt.jsPDF);

  // Add 'inner' field if not present.
  if (!pageSize.hasOwnProperty("inner")) {
    pageSize.inner = {
      width: pageSize.width - opt.margin[1] - opt.margin[3],
      height: pageSize.height - opt.margin[0] - opt.margin[2],
    };
    pageSize.inner.px = {
      width: toPx(pageSize.inner.width, pageSize.k),
      height: toPx(pageSize.inner.height, pageSize.k),
    };
    pageSize.inner.ratio = pageSize.inner.height / pageSize.inner.width;
  }

  // Attach pageSize to this.
  return pageSize;
}

function canvasToPdf(canvas: HTMLCanvasElement, opt: HtmlToPdfOptions) {
  const pdfPageSize = getPdfPageSize(opt);

  // Calculate the number of pages.
  var pxFullHeight = canvas.height;
  var pxPageHeight = Math.floor(canvas.width * pdfPageSize.inner.ratio);
  var nPages = Math.ceil(pxFullHeight / pxPageHeight);

  // Define pageHeight separately so it can be trimmed on the final page.
  var pageHeight = pdfPageSize.inner.height;

  // Create a one-page canvas to split up the full image.
  var pageCanvas = document.createElement("canvas");
  var pageCtx = pageCanvas.getContext("2d");
  if (!pageCtx) {
    throw Error("Canvas context of created element not found");
  }
  pageCanvas.width = canvas.width;
  pageCanvas.height = pxPageHeight;

  // Initialize the PDF.
  const pdf = new jsPDF(opt.jsPDF);

  for (var page = 0; page < nPages; page++) {
    // Trim the final page to reduce file size.
    if (page === nPages - 1 && pxFullHeight % pxPageHeight !== 0) {
      pageCanvas.height = pxFullHeight % pxPageHeight;
      pageHeight =
        (pageCanvas.height * pdfPageSize.inner.width) / pageCanvas.width;
    }

    // Display the page.
    var w = pageCanvas.width;
    var h = pageCanvas.height;

    pageCtx.fillStyle = "white";
    pageCtx.fillRect(0, 0, w, h);
    pageCtx.drawImage(canvas, 0, page * pxPageHeight, w, h, 0, 0, w, h);

    // Add the page to the PDF.
    if (page) pdf.addPage();
    var imgData = pageCanvas.toDataURL(
      "image/" + opt.image.type,
      opt.image.quality
    );
    pdf.addImage(
      imgData,
      opt.image.type,
      opt.margin[1],
      opt.margin[0],
      pdfPageSize.inner.width,
      pageHeight
    );
  }
  return pdf;
}

export function useComponentPrinter() {
  const { numPages } = useFieldArrayValues("slides");
  const { watch }: DocumentFormReturn = useFormContext();

  const [isPrinting, setIsPrinting] = React.useState(false);
  // TODO: Show animation on loading
  const componentRef = React.useRef(null);

  // Packages and references
  // react-to-print: https://github.com/gregnb/react-to-print
  // html-to-image: https://github.com/bubkoo/html-to-image
  // jsPDF: https://rawgit.com/MrRio/jsPDF/master/docs/jsPDF.html

  const reactToPrintContent = React.useCallback(() => {
    const current = componentRef.current;

    if (current && typeof current === "object") {
      // @ts-ignore should type narrow more precisely
      const clone = current.cloneNode(true);
      // Change from horizontal to vertical for printing and remove gap
      proxyImgSources(clone);
      preserveComputedStyles(clone);
      removeSelectionStyleById(clone, "page-base-");
      removeSelectionStyleById(clone, "content-image-");
      removePaddingStyleById(clone, "carousel-item-");
      removeStyleById(clone, "slide-wrapper-", "px-2");
      removeAllById(clone, "add-slide-");
      removeAllById(clone, "add-element-");
      removeAllById(clone, "element-menubar-");
      removeAllById(clone, "slide-menubar-");
      insertFonts(clone);
      // Remove styling from container
      clone.className = "flex flex-col";
      clone.style = {};

      return clone;
    }

    return componentRef.current;
  }, []);

  const handlePrint = useReactToPrint({
    content: reactToPrintContent,
    removeAfterPrint: true,
    onBeforePrint: () => setIsPrinting(true),
    onAfterPrint: () => setIsPrinting(false),
    pageStyle: `@page { size: ${SIZE.width}px ${SIZE.height}px;  margin: 0; } @media print { body { -webkit-print-color-adjust: exact; }}`,
    print: async (printIframe) => {
      const contentDocument = printIframe.contentDocument;
      if (!contentDocument) {
        console.error("iFrame does not have a document content");
        return;
      }

      const html = contentDocument.getElementById("element-to-download-as-pdf");
      if (!html) {
        console.error("Couldn't find element to convert to PDF");
        return;
      }

      // Increase scale factor to ensure better quality and fix element positioning
      const SCALE_TO_LINKEDIN_INTRINSIC_SIZE = 2.5;
      const fontEmbedCss = await getFontEmbedCSS(html);
      
      // Add font CSS to the document
      if (fontEmbedCss) {
        const style = contentDocument.createElement('style');
        style.textContent = fontEmbedCss;
        contentDocument.head.appendChild(style);
      }
      
      const options: HtmlToPdfOptions = {
        margin: [0, 0, 0, 0],
        filename: watch("filename"),
        image: { type: "webp", quality: 1.0 },
        htmlToImage: {
          height: SIZE.height * numPages,
          width: SIZE.width,
          canvasHeight:
            SIZE.height * numPages * SCALE_TO_LINKEDIN_INTRINSIC_SIZE,
          canvasWidth: SIZE.width * SCALE_TO_LINKEDIN_INTRINSIC_SIZE,
          // Preserve accurate element positioning and font rendering
          pixelRatio: SCALE_TO_LINKEDIN_INTRINSIC_SIZE,
        },
        jsPDF: { unit: "px", format: [SIZE.width, SIZE.height] },
      };

      // TODO Create buttons to download as png / svg / etc from 'html-to-image'
      const canvas = await toCanvas(html, options.htmlToImage).catch((err) => {
        console.error(err);
      });
      if (!canvas) {
        console.error("Failed to create canvas");
        return;
      }
      // DEBUG:
      // document.body.appendChild(canvas);
      const pdf = canvasToPdf(canvas, options);
      pdf.save(options.filename);
    },
  });

  return {
    componentRef,
    handlePrint,
    isPrinting,
  };
}

function proxyImgSources(html: HTMLElement) {
  // @ts-ignore
  const images = Array.from(
    html.getElementsByTagName("img")
  ) as HTMLImageElement[];
  // Add fallback to current window location when NEXT_PUBLIC_APP_URL is not set
  const url = process.env.NEXT_PUBLIC_APP_URL || 
    (typeof window !== 'undefined' ? window.location.origin : '');

  const externalImages = images.filter(
    (image) => !image.src.startsWith("/") && !image.src.startsWith("data:")
  );

  // TODO: Make a single request with the list of images
  externalImages.forEach((image) => {
    try {
      const apiRequestURL = new URL(`${url}/api/proxy`);
      apiRequestURL.searchParams.set("url", image.src);
      // TODO: Consider using the cache of fetch
      image.src = apiRequestURL.toString();
    } catch (error) {
      console.error("Error creating proxy URL for image:", error);
      // Keep the original image source if there's an error
    }
  });
}

function removeAllById(html: HTMLElement, id: string) {
  const elements = Array.from(
    html.querySelectorAll(`[id^=${id}]`)
  ) as HTMLDivElement[];

  elements.forEach((element) => {
    element.remove();
  });
}

function removePaddingStyleById(html: HTMLElement, id: string) {
  const classNames = "pl-2 md:pl-4";
  removeStyleById(html, id, classNames);
}

function removeSelectionStyleById(html: HTMLElement, id: string) {
  const classNames = "outline-input ring-2 ring-offset-2 ring-ring";
  removeStyleById(html, id, classNames);
}

function removeStyleById(html: HTMLElement, id: string, classNames: string) {
  const elements = Array.from(
    html.querySelectorAll(`[id^=${id}]`)
  ) as HTMLDivElement[];
  
  elements.forEach((element) => {
    element.className = removeClassnames(element, classNames);
  });
}

function removeClassnames(element: HTMLDivElement, classNames: string): string {
  const className = getClassNameAsString(element);
  if (!className) return '';
  
  return className
    .split(" ")
    .filter((el) => !classNames.split(" ").includes(el))
    .join(" ");
}

function insertFonts(element: HTMLElement) {
  // Get all elements with potential font classes, not just textareas
  const allElements = element.querySelectorAll('*');
  
  // Font class to actual font-family mapping
  const fontMap: Record<string, string> = {
    'font-dm-sans': "'DM Sans', sans-serif",
    'font-dm-serif-display': "'DM Serif Display', serif",
    'font-geist-sans': "'Geist Sans', sans-serif",
    'font-montserrat': "'Montserrat', sans-serif",
    'font-pt-serif': "'PT Serif', serif",
    'font-roboto': "'Roboto', sans-serif",
    'font-roboto-condensed': "'Roboto Condensed', sans-serif",
    'font-ultra': "'Ultra', serif",
    'font-inter': "'Inter', sans-serif",
    'font-syne': "'Syne', sans-serif",
    'font-archivo-black': "'Archivo Black', sans-serif",
    'font-playfair-display': "'Playfair Display', serif",
    'font-poppins': "'Poppins', sans-serif",
    'font-oswald': "'Oswald', sans-serif",
    'font-merriweather': "'Merriweather', serif",
    'font-lato': "'Lato', sans-serif",
    'font-raleway': "'Raleway', sans-serif",
    'font-quicksand': "'Quicksand', sans-serif",
    'font-bebas-neue': "'Bebas Neue', sans-serif"
  };

  // Iterate through each element
  allElements.forEach(function (el) {
    const className = getClassNameAsString(el);
    if (!className) return;
    
    // Find font classes
    const tailwindFonts = className
      .split(" ")
      .filter((cn) => cn.startsWith("font-"));

    if (tailwindFonts.length === 0) return;

    const htmlEl = el as HTMLElement;
    // Apply the explicit font-family
    tailwindFonts.forEach((fontClass) => {
      const explicitFontFamily = fontMap[fontClass];
      if (explicitFontFamily) {
        htmlEl.style.fontFamily = explicitFontFamily;
      } else {
        // Fallback to CSS variable method if not in the map
        const fontFaceValue = getComputedStyle(
          htmlEl.ownerDocument.body
        ).getPropertyValue("--" + fontClass);
        
        if (fontFaceValue) {
          htmlEl.style.fontFamily = fontFaceValue;
        }
      }
    });
  });
}

async function getFontEmbedCSS(element: HTMLElement): Promise<string> {
  // Get all font families used in the document
  const fontFamilies = new Set<string>();
  
  element.querySelectorAll('*').forEach((el) => {
    const className = getClassNameAsString(el);
    if (!className) return;
    
    const tailwindFonts = className
      .split(" ")
      .filter((cn) => cn.startsWith("font-"));
    
    if (tailwindFonts.length === 0) return;
    
    const htmlEl = el as HTMLElement;
    tailwindFonts.forEach((font) => {
      const fontFaceValue = getComputedStyle(
        htmlEl.ownerDocument.body
      ).getPropertyValue("--" + font);
      
      if (fontFaceValue) {
        fontFamilies.add(fontFaceValue);
      }
    });
  });
  
  // Collect all CSS rules for fonts
  let fontCss = '';
  const styleSheets = Array.from(document.styleSheets);
  
  styleSheets.forEach(sheet => {
    try {
      const rules = Array.from(sheet.cssRules || []);
      rules.forEach(rule => {
        if (rule instanceof CSSFontFaceRule) {
          const fontFamily = rule.style.getPropertyValue('font-family').replace(/['";]/g, '');
          
          // Check if this font-face rule is for one of our used fonts
          fontFamilies.forEach(usedFont => {
            if (fontFamily.includes(usedFont)) {
              fontCss += rule.cssText + '\n';
            }
          });
        }
      });
    } catch (e) {
      // Skip cross-origin stylesheets
      console.warn('Could not access stylesheet:', e);
    }
  });
  
  return fontCss;
}

function preserveComputedStyles(element: HTMLElement) {
  // Get all elements with styling
  const allElements = element.querySelectorAll('*');

  // Properties we want to preserve in the export
  const propertiesToPreserve = [
    'font-family', 'font-size', 'font-weight', 'font-style',
    'line-height', 'color', 'background-color', 'text-align',
    'letter-spacing', 'text-decoration', 'text-transform'
  ];

  // Iterate through each element
  allElements.forEach(function (el) {
    const className = getClassNameAsString(el);
    if (!className) return;
    
    const htmlEl = el as HTMLElement;
    
    // Get computed styles
    const computedStyle = window.getComputedStyle(htmlEl);
    
    // Apply each property as inline style if it exists
    propertiesToPreserve.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value && value !== '') {
        htmlEl.style.setProperty(prop, value);
      }
    });
  });
}

// Add this helper function before other functions
function getClassNameAsString(element: Element): string {
  // Handle SVG elements which have className as SVGAnimatedString
  if (element instanceof SVGElement && 'className' in element) {
    const svgClassName = element.className;
    if (svgClassName && typeof svgClassName === 'object' && 'baseVal' in svgClassName) {
      return svgClassName.baseVal;
    }
  }
  
  // Handle regular HTML elements
  if ('className' in element && element.className) {
    if (typeof element.className === 'string') {
      return element.className;
    } else {
      // For any other case, try to stringify
      return String(element.className);
    }
  }
  
  return '';
}
