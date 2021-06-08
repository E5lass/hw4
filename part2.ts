/* 2.1 */
import * as R from "ramda";

export const MISSING_KEY = "___MISSING___"

type PromisedStore<K, V> = {
    get(key: K): Promise<V>,
    set(key: K, value: V): Promise<void>,
    delete(key: K): Promise<void>
}

type allpromises<K, V> = {
    keys: K[];
    values: V[] 
    }; 


export function makePromisedStore<K, V>(): PromisedStore<K, V> {
    const promiseStoreall: allpromises<K, V> = { keys: [], values: [] }; // type of promiseStoreall
    return {
         get(key: K) {
            const indexOftheKey = promiseStoreall.keys.indexOf(key);
            return  new Promise<V>((resolve, reject) => {
             indexOftheKey == -1 ? //t if the key not in the promiseStoreall
             reject(MISSING_KEY) //the value not exist
             :resolve(promiseStoreall.values[indexOftheKey]) //the value exist

         });
        },

        set(key: K, value: V) {
            const indexOftheKey = promiseStoreall.keys.indexOf(key); 
            return new Promise<void>((resolve) => {
              if(indexOftheKey !== -1 )  //the key is exist and there is value in the key
              {
                  const removedList = R.remove(indexOftheKey, 1, promiseStoreall.values);
                  promiseStoreall.values = R.insert(indexOftheKey, value, removedList);
                    
              }
             else //adding new value and key to the promiseStoreall
              {
                    promiseStoreall.keys = R.append(key, promiseStoreall.keys);
                    promiseStoreall.values = R.append(value, promiseStoreall.values);
                   
              }
                    resolve();
            });
          },


        delete(key: K) {

          const indexOftheKey = promiseStoreall.keys.indexOf(key);
          return new Promise<void>((resolve, reject) => {
          if(indexOftheKey !== -1 ) //if the key exist // we remove the key and the value of the key
          {
              promiseStoreall.keys = R.remove(indexOftheKey, 1, promiseStoreall.keys);
              promiseStoreall.values = R.remove(indexOftheKey, 1, promiseStoreall.values);
              resolve();
            
            }
          
          else
            {
               reject(MISSING_KEY);
            }
            
          });
        },
      }
    }

 export function getAll<K, V>(store: PromisedStore<K, V>, keys: K[]): Promise<V[]> // what  the function return
  {
    const s= R.map(store.get,keys);
    return Promise.all(s); 
  }








  

/* 2.2 */

export function asycMemo<T, R>(f: (param: T) => R): (param: T) => Promise<R> {
  const memo = makePromisedStore<T, R>();
  return async (param) => {
    let value = f(param)
      try {
         const chekvalue: R = await memo.get(param);
          return chekvalue 
          } 
      catch (error) 
      {
        memo.set(param, value)
        return value
      }
  }
}







/* 2.3 */

export function lazyFilter<T>(genFn: () => Generator<T>, filterFn:(v:T) => boolean): ()=> Generator<T>
 {
  const filtergen=  function* (genFn: ()=> Generator<T>, filter: (v:T) => boolean) {
    const genf = genFn()
    for (let x of genf) {
        if (filter(x)) {
            yield x;
        }
    }
  }
  return ()=> filtergen(genFn,filterFn);
}



export function lazyMap<T, R>(genFn: () => Generator<T>, mapFn: (v:T) => R):()=> Generator<R>  {
  const genm = genFn()
  const lazymap= function* (genFn: ()=> Generator<T>, map: (v:T)=> R)
       {
         for (let x of genm) 
         yield map(x);
          
       }

     return ()=> lazymap(genFn,mapFn);
 }






/* 2.4 */
// you can use 'any' in this question
// const myPromise = new Promise((resolve, reject)

const time2s = async (): Promise<void> =>
  new Promise((res: VoidFunction) => setTimeout(res, 2000));


export async function asyncWaterfallWithRetry(fns: [() => Promise<any>, ...((param: any) => Promise<any>)[]]):
 Promise<any> {
    let val = undefined;
    let i=0;
    for (let nowAplFunc of fns) {
      for(i;i<2;i++){
          try {
          val = await nowAplFunc(val);
              } 
          catch {
          await time2s();
             }
       }
      try {
            val = await nowAplFunc(val);
          } 
      catch (err) {
        return err;
      }   
    }
    return val;
}
  
  