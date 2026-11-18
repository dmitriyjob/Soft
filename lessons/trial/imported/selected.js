import {binaryScene} from './binary.js?v=c10203d6c68a';
import {introduction} from './intro.js?v=c10203d6c68a';
import {scenes as allScenes,chapters as allChapters} from './content.js?v=c10203d6c68a';
export const sourceNumbers=[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 21, 22, 23, 27, 29, 30, 31, 32, 34, 35, 36, 38, 39];
export const scenes=[...introduction,...sourceNumbers.flatMap(n=>n===18?[binaryScene,{...allScenes[n-1],sourceNumber:n}]:[{...allScenes[n-1],sourceNumber:n}])];
export const chapters=allChapters;
