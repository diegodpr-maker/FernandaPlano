import { DatabaseSync } from 'node:sqlite';
import { readFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
export function openDatabase(filename){
 if(filename!==':memory:')mkdirSync(path.dirname(filename),{recursive:true});
 const db=new DatabaseSync(filename);
 db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
 db.exec(readFileSync(new URL('./db/schema.sql',import.meta.url),'utf8'));
 const adapter={
  prepare(sql){let args=[];return {bind(...values){args=values;return this;},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return db.prepare(sql).run(...args);}};},
  async batch(statements){db.exec('BEGIN IMMEDIATE');try{const results=[];for(const s of statements)results.push(await s.run());db.exec('COMMIT');return results;}catch(e){db.exec('ROLLBACK');throw e;}},
  close(){db.close();}
 };
 return adapter;
}
