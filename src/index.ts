import { curry, keys } from "./tools";



export * from "./tools";

function add(x:number, y:number){return x+y;}
let add2 = curry(add, 'x');