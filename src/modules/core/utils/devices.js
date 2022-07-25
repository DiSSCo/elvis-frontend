const screenSizes = [
  { width: 0, device: ['small-phone', 'phone', 'up-to-tablet', 'up-to-desktop'] },
  { width: 480, device: ['phone', 'up-to-tablet', 'up-to-desktop'] },
  { width: 768, device: ['tablet', 'up-to-desktop'] },
  { width: 1024, device: ['tablet', 'desktop'] },
  { width: 1280, device: ['desktop'] }
];

let screenSizesList = [];
let canTouch = false;

export function setScreenSizes() {
  const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
  screenSizes.forEach(size => {
    if (screenWidth >= size.width) {
      document.body.className = document.body.className.replace(/(^|\s)size-\S+/g, '');
      screenSizesList = [];

      size.device.forEach(device => {
        document.body.classList.add(`size-${device}`);
        screenSizesList.push(`size-${device}`);
      });
    }
  });
}

export function getScreenSizes() {
  return screenSizesList;
}

export function checkIfTouch() {
  const isTouch = 'ontouchstart' in window || (window.DocumentTouch && document instanceof window.DocumentTouch);
  if (isTouch) {
    document.body.classList.add('user-can-touch');
    canTouch = true;
  } else {
    document.body.classList.add('no-touch');
    canTouch = false;
  }

  window.addEventListener(
    'mouseover',
    function onFirstHover() {
      document.body.classList.add('user-can-hover');
      window.removeEventListener('mouseover', onFirstHover, false);
    },
    false
  );
}

export function userCanTouch() {
  return canTouch;
}
