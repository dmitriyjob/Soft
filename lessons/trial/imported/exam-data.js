// Categories describe Ion's teaching methods, not a required FIPI classification.
export const taskGroups=[
 {id:'hand',label:'Руками',tasks:[1,4,7,11,12],testPoints:34},
 {id:'table',label:'Таблицами',tasks:[3,18,22],testPoints:20},
 {id:'code',label:'Программой',tasks:[2,5,6,8,9,10,13,14,15,16,17,19,20,21,23,24,25,26,27],testPoints:80}
];
export const scoreScale=[7,14,20,27,34,40,43,46,48,51,54,56,59,62,64,67,70,72,75,78,80,83,85,88,90,93,95,98,100].map((test,i)=>({primary:i+1,test}));
// 2018–2025: main-period figures from FIPI's annual analysis reports.
// 2026: preliminary main-period results in the screenshot supplied by the user.
export const scoreTrend=[
 {year:2018,score:58.2},{year:2019,score:61.87},{year:2020,score:61.18},
 {year:2021,score:62.68},{year:2022,score:59.29},{year:2023,score:58.03},
 {year:2024,score:54.5},{year:2025,score:55.8},{year:2026,score:58.73}
];
