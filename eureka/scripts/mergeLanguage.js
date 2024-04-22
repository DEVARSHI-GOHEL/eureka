const fs = require('fs');

/**
 * Take source object as definition of all translations.
 * in "useLocalizatin" find all trnanslations in differente language.
 * The main idea is, to have only one source of truth. So if some tranzlation key is removed from "source',
 * it shuold be also removed in result merged file.
 * @param source
 * @param destination
 * @returns {*}
 */
function deepMerge(source, useLozalization) {
  const resp = {...source};
  for (const key in source) {
    if (useLozalization.hasOwnProperty(key)) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        resp[key] = deepMerge(source[key], useLozalization[key]);
      }else {
        resp[key] = useLozalization[key] ;
      }
    }
  }
  return resp;
}

function mergeJSONFiles(source, destination, spaces = 2) {
  // Read the JSON data from file A and file B
  const dataA = JSON.parse(fs.readFileSync(source, 'utf8'));
  const dataB = JSON.parse(fs.readFileSync(destination, 'utf8'));

  // Merge the JSON data from file A into file B
  const mergedData = deepMerge(dataA, dataB);

  // Write the merged result back into file B
  fs.writeFileSync(destination, JSON.stringify(mergedData, null, spaces), 'utf8');
}

// Usage
const bengaliFIle = '../App/assets/languages/bn.json';
const englishFile = '../App/assets/languages/en.json';
const japansesFile = '../App/assets/languages/ja.json';

mergeJSONFiles(englishFile, japansesFile, 2);
mergeJSONFiles(englishFile, bengaliFIle, 3);
