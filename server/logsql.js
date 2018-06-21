var LogSQL = {  
                insert:'INSERT INTO t_log(content, date) VALUES(?,?)', 
                queryAll:'SELECT * FROM t_log',  
              };
 module.exports = LogSQL;