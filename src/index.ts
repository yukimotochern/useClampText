/**
 * This hooks is adapted from
 * 1. https://github.com/drenther/use-clamp-text/blob/main/src/index.ts
 * 2. https://github.com/zoltantothcom/react-clamp-lines/blob/master/src/index.js
 */
import { useRef, useState, useCallback, useLayoutEffect } from 'react';
import { useOnWindowResize, useDebounce } from 'rooks';

interface ClampTextconfig {
  originalText: string;
  lines?: number;
  debounceTime?: number;
  minSpaceCharNum?: number;
  unitSpaceChar?: string;
  endSpaceNumber?: number;
}

export const useClampText = <
  WrapperContainer extends HTMLElement,
  AddonsContainer extends HTMLElement,
  TextContainer extends HTMLElement,
>({
  originalText = '',
  lines = 2,
  debounceTime = 300,
  minSpaceCharNum = 0,
  unitSpaceChar = '.',
  endSpaceNumber = 0,
}: ClampTextconfig) => {
  const longEnoughToClampRef = useRef(false);
  const maxHeightRef = useRef(0);
  const wrapperContainerRef = useRef<WrapperContainer>(null);
  const textContainerRef = useRef<TextContainer>(null);
  const addOnsContainerRef = useRef<AddonsContainer>(null);
  const initializedRef = useRef(false);

  const [{ clamped, clampedText, isClampLinesApplied }, setClampState] = useState({
    clamped: true,
    /**
     * The '.' is chosen to be the initial clampedText so as to measure the lineHeight,
     * since one char must be rendered in a single line
     */
    //
    clampedText: '.',
    isClampLinesApplied: false,
  });

  const getHeight = (element: HTMLElement) => {
    const style = window.getComputedStyle(element);
    const paddingHeight = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const innerHeight = element.getBoundingClientRect().height;
    return innerHeight - paddingHeight;
  };

  const initializeHeight = useCallback(() => {
    /**
     * This initializedRef is needed only in development.
     * Since from React 18 ahead, the development server will use each `effect`
     * twice even for those without dependencies. This will potentially cause
     * the calculation of single line height incorrect.
     */
    if (!initializedRef.current) {
      const wrapperContainer = wrapperContainerRef.current;
      if (!wrapperContainer) return;
      const lineHeight = getHeight(wrapperContainer) + 1;
      maxHeightRef.current = lineHeight * lines + 1;
    }
    initializedRef.current = true;
  }, [lines]);

  const setLongEnoughToClamp = useCallback(() => {
    const wrapperContainer = wrapperContainerRef.current;
    const textContainer = textContainerRef.current;
    const addOnsContainer = addOnsContainerRef.current;
    if (!wrapperContainer || !textContainer) return;

    // longEnoughToClamp should exclude addons
    let addOnsContainerStyle = '';
    if (addOnsContainer) {
      addOnsContainerStyle = addOnsContainer.getAttribute('style') || '';
      addOnsContainer.setAttribute('style', 'display: none;');
    }

    textContainer.innerText = originalText;
    const fullClientHeight = getHeight(wrapperContainer);
    const maxHeight = maxHeightRef.current;
    longEnoughToClampRef.current = fullClientHeight > maxHeight;

    if (addOnsContainer) {
      addOnsContainer.setAttribute('style', addOnsContainerStyle);
    }
  }, [originalText]);

  /**
   * When did mount,
   * 1. initialize line height
   * 2. check whether longEnoughToClamp
   */
  useLayoutEffect(() => {
    initializeHeight();
    setLongEnoughToClamp();
  }, [initializeHeight, setLongEnoughToClamp]);

  const clampLines = useCallback(() => {
    const textContainer = textContainerRef.current;
    const wrapperContainer = wrapperContainerRef.current;
    const addOnsContainer = addOnsContainerRef.current;
    if (!textContainer || !wrapperContainer) return;

    const maxHeight = maxHeightRef.current;
    let fitText = originalText;
    if (clamped) {
      // clamping should exclude addons
      let addOnsContainerStyle = '';
      if (addOnsContainer) {
        addOnsContainerStyle = addOnsContainer.getAttribute('style') || '';
        addOnsContainer.setAttribute('style', 'display: none;');
      }

      let start = 0;
      let middle = 0;
      let end = originalText.length;

      const moveMarkers = () => {
        const clientHeight = getHeight(wrapperContainer);
        if (clientHeight <= maxHeight) {
          start = middle + 1;
        } else {
          end = middle - 1;
        }
      };

      while (start <= end) {
        middle = Math.floor((start + end) / 2);
        textContainer.innerText = originalText.slice(0, middle);
        moveMarkers();
      }
      fitText = originalText.slice(0, Math.max(middle, 0));
      if (addOnsContainer) {
        addOnsContainer.setAttribute('style', addOnsContainerStyle);
      }
    }

    textContainer.innerText = fitText;
    /**
     * The below setClampState will trigger re-render and hence the
     * render of addons next to the clamped text and then the
     * adjustSpace layout effect.
     */
    setClampState((prev) => ({
      ...prev,
      clampedText: fitText,
      isClampLinesApplied: true,
    }));
  }, [clamped, originalText]);

  useLayoutEffect(() => {
    clampLines();
  }, [clampLines]);

  const adjustSpace = useCallback(() => {
    if (!clamped || !isClampLinesApplied) return;

    const textContainer = textContainerRef.current;
    const wrapperContainer = wrapperContainerRef.current;
    if (!textContainer || !wrapperContainer) return;

    const maxHeight = maxHeightRef.current;
    const clientHeight = getHeight(wrapperContainer);
    if (clientHeight > maxHeight && longEnoughToClampRef.current) {
      /**
       * After the potential render of addons, triggered by the setClampeState
       * in the clampLines, need to make sure that the wrapperContainer
       * is still within maxHeight. If not, shrink.
       */
      const currentText = textContainer.innerText;
      // native javascript loop for efficiency
      // tslint:disable-next-line no-var-keyword
      for (var x = 0; x < currentText.length; x++) {
        // tslint:disable-next-line no-shadowed-variable
        const clientHeight = getHeight(wrapperContainer);
        if (clientHeight <= maxHeight || textContainer.innerText.length === 0) {
          break;
        } else {
          textContainer.innerText = textContainer.innerText.slice(0, -1);
        }
      }
    }

    /**
     * Apply space and progressively shink.
     * If the desired space makes the wrapperContainer on the brink of maxHeight,
     * the desired result is obtained.
     */
    if (endSpaceNumber && longEnoughToClampRef.current) {
      const currentText = textContainer.innerText;
      const endSpace = unitSpaceChar.repeat(endSpaceNumber);
      if (minSpaceCharNum) {
        textContainer.innerText = textContainer.innerText.slice(0, -minSpaceCharNum);
      }
      // tslint:disable-next-line no-var-keyword
      for (var x = 0; x < currentText.length - minSpaceCharNum; x++) {
        // add space
        textContainer.innerText = textContainer.innerText + endSpace;
        // check
        // tslint:disable-next-line no-shadowed-variable
        const clientHeight = getHeight(wrapperContainer);
        if (clientHeight <= maxHeight || textContainer.innerText.length === 0) {
          // remove space
          textContainer.innerText = textContainer.innerText.slice(0, -endSpace.length);
          break;
        } else {
          // remove space and shrink
          textContainer.innerText = textContainer.innerText.slice(0, -endSpace.length - 1);
        }
      }
    }

    setClampState((prev) => ({
      ...prev,
      clampedText: textContainer.innerText,
      isClampLinesApplied: false,
    }));
  }, [clamped, isClampLinesApplied, endSpaceNumber, unitSpaceChar, minSpaceCharNum]);

  useLayoutEffect(() => {
    adjustSpace();
  }, [adjustSpace]);

  // on window resize
  const resizeDebuncedRefresh = useDebounce(() => {
    setLongEnoughToClamp();
    clampLines();
  }, debounceTime);
  useOnWindowResize(resizeDebuncedRefresh);

  const toggleClamp = () =>
    setClampState((prev) => ({
      ...prev,
      clamped: !prev.clamped,
    }));

  return {
    longEnoughToClamp: longEnoughToClampRef.current,
    clamped,
    clampedText,
    toggleClamp,
    wrapperContainerRef,
    textContainerRef,
    addOnsContainerRef,
  } as const;
};
