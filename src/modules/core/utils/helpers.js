import i18n from '@/i18n';
import router from '@/router';

export function localeDate() {
  return i18n.locale === 'en' ? 'en-GB' : i18n.locale;
}

export function capitalize(string) {
  const str = string.toLowerCase();
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function clone(item) {
  return JSON.parse(JSON.stringify(item));
}

export function removeDuplicatesInArray(arrayWithDuplicates, prop) {
  const arrayWithoutDuplicates = arrayWithDuplicates.filter(
    (obj, pos, arr) => arr.map((mapObj) => mapObj[prop.toString()]).indexOf(obj[prop]) === pos,
  );
  return arrayWithoutDuplicates || [];
}

export function makeDateArray(timeStamp = new Date()) {
  const year = timeStamp.getFullYear();
  const month = timeStamp.getMonth() + 1;
  const day = timeStamp.getDate();
  return [year, month, day, 0, 0];
}

export function makeStringFromDateArray(arr) {
  const timeStamp = new Date(arr[0], arr[1] - 1, arr[2], 0, 0);
  const year = timeStamp.getFullYear();
  const month = timeStamp.getMonth() + 1;
  const corrMonth = month < 10 ? `0${month}` : month;
  const day = timeStamp.getDate();
  const corrDay = day < 10 ? `0${day}` : day;
  return `${year}-${corrMonth}-${corrDay}`;
}

export function setDate(date) {
  const options = {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    timeZone: 'UTC',
  };
  if (Array.isArray(date)) {
    const utcDate = new Date(Date.UTC(date[0], date[1] - 1, date[2]));
    return utcDate.toLocaleString(localeDate(), options);
  }
  return date;
}

export function setDateTime(date) {
  const options = {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'UTC',
  };
  if (Array.isArray(date)) {
    const utcDate = new Date(Date.UTC(date[0], date[1] - 1, date[2], date[3], date[4], date[5]));
    return utcDate.toLocaleString(localeDate(), options);
  }
  return date;
}

export function isAfterDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const parsedDate = Array.isArray(date) ? new Date(makeStringFromDateArray(date)) : new Date(date);
  parsedDate.setHours(0, 0, 0, 0);
  return today >= parsedDate;
}

export function anchorLinks(text) {
  return (text || '').replace(/([^\S]|^)(((https?:\/\/)|(www\.))(\S+))/gi, (match, space, url) => {
    let hyperlink = url;
    if (!hyperlink.match('^https?://')) {
      hyperlink = `https://${hyperlink}`;
    }
    return `${space}<a href="${hyperlink}" target="blank">${url}</a>`;
  });
}

export function sortArray(arr, column, ascending = false) {
  arr = [...arr].sort((a, b) => {
    a = a[column];
    b = b[column];

    if (typeof a === 'string' && typeof b === 'string') {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }

    return a > b ? 1 : b > a ? -1 : 0;
  });

  if (!ascending) {
    arr.reverse();
  }
  return arr;
}

export function parseField(field) {
  if (field) {
    const currentPath = JSON.parse(JSON.stringify(field));
    const parsedPath = [];
    currentPath.forEach((element, index) => {
      if (index && /^\d+$/.test(element)) {
        element = `${parsedPath[index - 1]}[${element}]`;
        parsedPath.splice(index - 1, 1);
      }
      parsedPath.push(element);
    });
    return parsedPath.join('.');
  }
}

function fill(arr, obj, val) {
  let k = arr.shift();
  if (!k) k = arr.shift();
  if (arr.length) {
    obj[k] = obj[k] || {};
    fill(arr, obj[k], val);
  } else {
    obj[k] = val;
  }
}

function parsePath(path) {
  if (path.indexOf('[') >= 0) {
    path = path.replace(/\[/g, '.').replace(/]/g, '');
  }
  return path.split('.');
}

export function toObject(obj) {
  Object.keys(obj).forEach((k) => {
    const parsedPath = parsePath(k).join('.');
    if (parsedPath.indexOf('.') !== -1) {
      fill(parsedPath.split('.'), obj, obj[k]);
      delete obj[k];
    } else {
      // obj[k] = obj[k];
    }
  });

  return obj;
}

export function sanitizeOrcId(id) {
  const [sanitizedOrcId] = id ? id.split('/').slice(-1) : '';
  return sanitizedOrcId;
}

export function sanitizeString(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function sanitizeObject(object) {
  Object.keys(object).forEach((k) => {
    if (object[k] && typeof object[k] === 'string') {
      object[k] = sanitizeString(object[k]);
    }
    if (object[k] && typeof object[k] === 'object') {
      sanitizeObject(object[k]);
    }
  });
  return object;
}

export function search(object, searchTerm) {
  if (!object) return;
  const clonedObj = JSON.parse(JSON.stringify(object));
  const cleanObj = sanitizeObject(clonedObj);
  const regex = new RegExp(searchTerm, 'i');

  return Object.values(cleanObj).find((val) => {
    if (typeof val === 'string' && val.match(regex)) {
      return cleanObj;
    }
    if (typeof val === 'object') {
      return search(val, searchTerm);
    }

    return null;
  });
}

export function objectsAreEqual(object1, object2) {
  return Object.entries(object1).toString() === Object.entries(object2).toString();
}

export function setQuery(query) {
  if (objectsAreEqual(query, router.currentRoute.value.query)) return;
  router.replace({ query });
}
