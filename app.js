const express = require("express");
const { allow } = require("joi");
const app = express();
const mysql = require('mysql');
const port = 8080;
const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Raveen@2001",
    database: "collage_councelling_database"
  });


app.use(express.json());

con.connect(function(err) {
if (err) console.log(err);
console.log("Connected!");
});

app.get("/api/users",(req, res)=>{
    console.log("get users");
        con.query("SELECT * FROM users", function (err, result, fields) {
          if (err) throw err;
          res.send(result);
        });
})

app.get("/api/user/:rollNo",(req, res)=>{
    console.log("get user");
    con.query(`SELECT * FROM users WHERE roll_no = "${req.params.rollNo}"`, function (err, result, fields) {
        if (err) throw err;
        res.send(result);
      });
})

app.post("/api/user/update/details/:rollNo/:cutoff/:category",(req, res)=>{
    console.log("update detatils")
    con.query(`UPDATE users SET cutoff = ${req.params.cutoff}, category = ${req.params.category} WHERE (roll_no = "${req.params.rollNo}")`, function (err, result, fields) {
        if (err) throw err;
      });

      con.query(`SELECT * FROM users WHERE roll_no = "${req.params.rollNo}"`, function (err, result, fields) {
        if (err) throw err;
        res.send(result)
      });
})

app.post("/api/users",(req, res)=>{
    console.log("post user");
    const user = {
        rollNo: req.body.roll_no,
        name: req.body.name,
        dob: req.body.dob,
        password: req.body.password,
    }

  
    con.query(`INSERT INTO users (roll_no, name, dob, password) VALUES ("${user.rollNo}", "${user.name}", "${user.dob}", "${user.password}")`, function (err, result, fields) {
      if(err){
        console.log('error occured in deleting: code - ' + err.code + " ,isFatal - " + err.fatal);
        res.status(400);
        res.end();
      } 
      else{
        con.query(`CREATE TABLE ${user.rollNo}_saved_college_list (
          priority INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          code VARCHAR(4) NOT NULL,
          department INT NOT NULL,
          category INT NOT NULL,
          PRIMARY KEY (priority))`, function (err, result) {
            if(err){
              console.log('error occured in deleting: code - ' + err.code + " ,isFatal - " + err.fatal);
            } else {
              console.log("saved Table created");
              con.query(`SELECT * FROM users WHERE roll_no = "${user.rollNo}"`, function (err, result, fields) {
                if(err){
                  console.log('error occured in deleting: code - ' + err.code + " ,isFatal - " + err.fatal);
                } else {
                res.send(result);
                }
              })
            }
          })
        }   
    })
})    

app.post("/api/user/:rollNo/confirmCollegeList",(req, res)=>{
  console.log("post college List");
  for(i in req.body){
    const data = {
      rollNo: req.body[i].roll_no,
      name: req.body[i].name,
      category: req.body[i].category,
      college_name: req.body[i].college_name,
      code: req.body[i].code,
      department: req.body[i].department,
      priority: req.body[i].priority,
    }

    con.query(`INSERT INTO college_list_choice (roll_no, name, category, college_name, code, department, priority) VALUES ("${data.rollNo}", "${data.name}", ${data.category}, "${data.college_name}", "${data.code}", ${data.department}, ${data.priority})`, function (err, result, fields) {
      if (err) throw err;
      console.log("inserted an row")
    });
  }

  con.query(`DROP TABLE ${req.params.rollNo}_saved_college_list`, function (err, result) {
    if (err) throw err;
    console.log("Table deleted");
  });

  con.query(`UPDATE users SET is_list_submitted = 1 WHERE (roll_no = "${req.params.rollNo}")`, function (err, result, fields) {
    if (err) throw err;
  });

  con.query(`SELECT * FROM users WHERE roll_no = "${req.params.rollNo}"`, function (err, result, fields) {
    if (err) throw err;
    res.send(result)
  });
})



app.get("/api/user/:rollNo/confirmedCollegeList",(req, res)=>{
  console.log("getting confirmed college List"); 
  con.query(`SELECT * FROM college_list_choice WHERE (roll_no = "${req.params.rollNo}")`, function (err, result, fields) {
    if (err) throw err
    console.log(result.length);
    res.send(result)
  });
})



app.post("/api/user/:rollNo/saveCollegeList",(req, res)=>{
  console.log("post college List");
  con.query(`DELETE FROM ${req.params.rollNo}_saved_college_list`, function (err, result) {
    if (err) throw err;
    console.log("Number of records deleted: " + result.affectedRows);
  });
  for(i in req.body){
    const data = {
      priority: req.body[i].priority,
      name: req.body[i].name,
      code: req.body[i].code,
      department: req.body[i].department,
      category: req.body[i].category
  }

 
    con.query(`INSERT INTO ${req.params.rollNo}_saved_college_list (priority, name, code, department, category) VALUES (${data.priority}, "${data.name}", "${data.code}", ${data.department}, ${data.category})`, function (err, result, fields) {
      if (err) throw err;
      res.send();
    });
  }
})



app.get("/api/user/:rollNo/savedCollegeList",(req, res)=>{
  console.log("getting saved college List"); 
  con.query(`SELECT * FROM ${req.params.rollNo}_saved_college_list`, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
    res.send(result)
  });
})



app.post("/api/user/marks/:rollNo",(req, res)=>{

  con.query(`INSERT INTO mark_sheet (roll_no, english, tamil, maths, physics, chemistry, bio, cs, total, cutoff) VALUES ("${req.body.roll_no}", ${req.body.english}, ${req.body.tamil}, ${req.body.maths}, ${req.body.physics}, ${req.body.chemistry}, ${req.body.bio}, ${req.body.cs}, ${req.body.total}, ${req.body.cutoff});`
  ,function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  })

  con.query(`SELECT * FROM mark_sheet WHERE roll_no = "${req.params.rollNo}"`, function (err, result, fields) {
    if (err) throw err;
    res.send(result)
    console.log("marks Inserted")
  });
})


app.get("/api/user/marks/:rollNo",(req, res)=>{
  con.query(`SELECT * FROM mark_sheet WHERE roll_no = "${req.params.rollNo}"`, function (err, result, fields) {
    if (err) throw err;
    res.send(result)
    console.log("marks sent")
  });

})


app.get("/api/admin/colleges", (req, res)=>{
  con.query(`SELECT * FROM college_list`, function (err, result, fields) {
    if (err) throw err;
    res.send(result)
  
    console.log("colleges sent")
  });
})


app.post("/api/admin/colleges", (req, res)=>{
  con.query(`INSERT INTO college_list (name, code, bc, mbc, oc, st, others) VALUES ("${req.body.name}", ${req.body.code}, ${req.body.bc}, ${req.body.mbc}, ${req.body.oc}, ${req.body.st}, ${req.body.others})`
  ,function (err, result) {
    if (err){
      console.log("Duplicate Entry");
      res.status(400);
      res.end();
    }else{
      console.log("1 record inserted");
      res.send();
    }
  })
})


app.get("/api/admin/colleges/delete/:code",(req, res)=>{
  con.query(`DELETE FROM college_list WHERE (code = "${req.params.code}")`, function (err, result) {
    if (err) throw err;
    console.log("College deleted");
    res.send();
  });
})


app.post("/api/admin/colleges/update",(req, res) =>{
  con.query(`UPDATE college_list SET name = "${req.body.name}", bc = ${req.body.bc}, mbc = ${req.body.mbc}, oc = ${req.body.oc}, st = ${req.body.st}, others = ${req.body.others} WHERE (code = "${req.body.code}")`, function (err, result, fields) {
    if (err) throw err;
    res.send();
    console.log("updated");
  });
})

app.get("/api/admin/publishRank/:id",(req, res)=>{
  con.query("SELECT * FROM users ORDER BY cutoff DESC", function (err, result, fields) {
    if (err) throw err;
    let count = 1
    let size = result.length;
    for(let i = 1; i<= size; i++){
        let data = result[i-1];
        if(data.isAdmin === 1){
          console.log("admin");
          con.query(`UPDATE users SET is_rank_published = 1 WHERE (roll_no = "${data.roll_no}")`, function (err, result, fields) {
            if (err) throw err;
          });
        }else{
          con.query(`UPDATE users SET student_rank = "${count}" , is_rank_published = 1 WHERE (roll_no = "${data.roll_no}")`, function (err, result, fields) {
            if (err) throw err;
            
          });
          count = count + 1;
        }
    }
    console.log("rank Published");
  });

  con.query(`SELECT * FROM users WHERE (roll_no = "${req.params.id}")`, function (err, result, fields) {
    if(err) throw err;
    else res.send(result);
  })
})



//publish result


let students = [];
let colleges = [];
let collegeChoiceList = [];



app.get("/api/admin/getStudents", (req, res)=>{

  con.query("SELECT roll_no, student_rank FROM users WHERE( isAdmin = 0 ) ORDER BY student_rank ASC", function (err, result, fields){
    if(err) throw err;
    students = JSON.parse(JSON.stringify(result));
    console.log("students recieved");
    res.send()
  })

})

// app.get("/api/admin/getStudentChoiceList/:rollNo",(req, res)=>{
//   con.query(`SELECT * FROM college_list_choice WHERE( roll_no = "${req.params.rollNo}" ) ORDER BY priority ASC`, function (err, result, fields){
//     if(err) throw err;
//     collegeChoiceList = JSON.parse(JSON.stringify(result));
//     publishResult().then();
//     res.send();
//   })
// })


app.get("/api/admin/publishResult", (req, res)=>{
  con.query(`SELECT * FROM college_list`, function (err, result, fields) {
    if (err) throw err;
    colleges = JSON.parse(JSON.stringify(result));
    console.log("colleges recieved")
    publishResult().then(() => {
      updateCollege().then(()=>{
        res.send();
        console.log("finished")
        console.log("success");
      });
    });
  });
})



function publishResult() {

  return new Promise((resolve) =>{
    for(let i = 0; i < students.length; i++){
      updateChoiceList(i).then(() => resolve());
    }
  })
  
  
}

function updateChoiceList(num){

  return new Promise((resolve) => {
    con.query(`SELECT * FROM college_list_choice WHERE( roll_no = "${students[num].roll_no}" ) ORDER BY priority ASC`, function (err, result, fields){
      if(err) throw err;
      collegeChoiceList = JSON.parse(JSON.stringify(result));
      // console.log("data : ", collegeChoiceList);
      console.log("choice updated");
      allocateCollege().then(()=>resolve());
    })
    
  })
  
    
  
}


function allocateCollege() {

  return new Promise((resolve) =>{

    console.log("allocation started");

  let college;
  let result;
  for(let j = 0; j< collegeChoiceList.length; j++){
    college = colleges.filter((data)=>{
      return collegeChoiceList[j].code === data.code; 
    })
    // console.log(college[0]);
    college[0].bc = 2;
    bc = college[0].bc + 1;
    mbc = college[0].mbc;
    oc = college[0].oc;
    st = college[0].bc;
    others = college[0].bc;

    // console.log(collegeChoiceList[j].category);

    if(collegeChoiceList[j].category === 1){
      if(college[0].bc >=1){
        console.log("allocated bc", college[0].name);
        college[0].bc -= 1;
        result = {
          roll_no: collegeChoiceList[j].roll_no,
          name : collegeChoiceList[j].name,
          category : collegeChoiceList[j].category,
          college_name : collegeChoiceList[j].college_name,
          code: collegeChoiceList[j].code,
          department : collegeChoiceList[j].department,
          choice_no : collegeChoiceList[j].priority
        }

        // console.log(result);
        break;
      }
    }else if(collegeChoiceList[j].category === 2){
      if(college[0].mbc >=1){
        console.log("allocated mbc", college[0].name);
        college[0].mbc -= 1;
        result = {
          roll_no: collegeChoiceList[j].roll_no,
          name : collegeChoiceList[j].name,
          category : collegeChoiceList[j].category,
          college_name : collegeChoiceList[j].college_name,
          code: collegeChoiceList[j].code,
          department : collegeChoiceList[j].department,
          choice_no : collegeChoiceList[j].priority
        }

        // console.log(result);
        break;
      }
    }else if(collegeChoiceList[j].category === 3){
      if(college[0].oc >=1){
        console.log("allocated oc", college[0].name);
        college[0].oc -= 1;
        result = {
          roll_no: collegeChoiceList[j].roll_no,
          name : collegeChoiceList[j].name,
          category : collegeChoiceList[j].category,
          college_name : collegeChoiceList[j].college_name,
          code: collegeChoiceList[j].code,
          department : collegeChoiceList[j].department,
          choice_no : collegeChoiceList[j].priority
        }

        // console.log(result);
        break;
      }
    }else if(collegeChoiceList[j].category === 4){
      if(college[0].st >=1){
        console.log("allocated st", college[0].name);
        college[0].st -= 1;
        result = {
          roll_no: collegeChoiceList[j].roll_no,
          name : collegeChoiceList[j].name,
          category : collegeChoiceList[j].category,
          college_name : collegeChoiceList[j].college_name,
          code: collegeChoiceList[j].code,
          department : collegeChoiceList[j].department,
          choice_no : collegeChoiceList[j].priority
        }

        // console.log(result);
        break;
      }
    }else if(collegeChoiceList[j].category === 5){
      if(college[0].others >=1){
        console.log("allocated others", college[0].name);
        college[0].others -= 1;
        result = {
          roll_no: collegeChoiceList[j].roll_no,
          name : collegeChoiceList[j].name,
          category : collegeChoiceList[j].category,
          college_name : collegeChoiceList[j].college_name,
          code: collegeChoiceList[j].code,
          department : collegeChoiceList[j].department,
          choice_no : collegeChoiceList[j].priority
        }

        // console.log(result);
        break;
      }
    }
  }
  if(result) {
    insertResult(result).then(()=>resolve());
  }else{
    resolve();
  } 
  })
}

function insertResult(param) {

  return new Promise( (resolve) =>{

    let collegeAllotted = JSON.parse(JSON.stringify(param));
    // console.log(collegeAllotted);
    con.query(`INSERT INTO results (roll_no, name, category, college_name, code, department, choice_no) VALUES ("${collegeAllotted.roll_no}", "${collegeAllotted.name}", ${collegeAllotted.category}, "${collegeAllotted.college_name}", "${collegeAllotted.code}", ${collegeAllotted.department}, ${collegeAllotted.choice_no})`,function(err, result){
      if(err) throw err;
      console.log("inserted in results")
      resolve();
  })

  })
  
}

function updateCollege(){
  return new Promise((resolve)=>{
    
    for(let k = 0; k < colleges.length ; k++){
      con.query(`UPDATE college_list SET bc = ${colleges[k].bc}, mbc = ${colleges[k].mbc}, oc = ${colleges[k].oc}, st = ${colleges[k].st}, others = ${colleges[k].others} WHERE (code = "${colleges[k].code}")`, function (err, result, fields) {
        if (err) throw err;
      });
    }
    resolve();
  })
}

app.get("/api/admin/getCollege/:code",(req, res) =>{
  con.query(`SELECT * FROM college_list WHERE( code = "${req.params.code}" )`, function (err, result, fields){
    if(err) throw err;
    res.send(result);
  })
})


app.post("/api/admin/results", (req, res) =>{
  con.query(`INSERT INTO results (roll_no, name, college_name, code, department, choice_no) VALUES ("${data.roll_no}", "${data.name}", "${data.college_name}", "${data.code}", ${data.department}, ${data.priority})`,function(err, result){
    if(err) throw err;
    res.send();
})
})


app.get("/api/admin/updateResultPublished",(req, res)=>{
  con.query("SELECT * FROM users", function (err, result, fields) {
    if (err) throw err;
    let size = result.length;
    for(let i = 1; i<= size; i++){
        let data = result[i-1];
        con.query(`UPDATE users SET is_result_published = 1 WHERE (roll_no = "${data.roll_no}")`, function (err, result, fields) {
          if (err) throw err;
        });
      }
      console.log("Results Updated")
      res.send();
})
})

app.get("/api/admin/results",(req, res)=>{
  con.query(`SELECT * FROM results`, function (err, result, fields){
    if(err) throw err;
    console.log("Results fetched")
    res.send(result);
  })
})


app.get("/api/admin/results/:rollNo",(req, res)=>{
  con.query(`SELECT * FROM results WHERE ( roll_no = "${req.params.rollNo}")`, function (err, result, fields){
    if(err) throw err;
    console.log("Result fetched")
    res.send(result);
  })
})

app.listen(port,()=>{
  console.log(`listening to port ${port}`);
})


// app.get("/api/admin/publishResult/:id", (req, res)=>{
//   let studentList;
//   let collegeList;
//   let studentListSize;
//   let collegeListSize;
//   let bc, mbc, oc, st, others;
//   con.query("SELECT roll_no, student_rank FROM users WHERE( isAdmin = 0 ) ORDER BY student_rank DESC", function (err, result, fields){
//     if(err) throw err;
//     studentList = result;
//     studentListSize = result.length;
//     // console.log(studentListSize);
//     // console.log(studentList);


//     for(let i = 0; i< studentListSize; i++){
//       con.query(`SELECT * FROM college_list_choice WHERE( roll_no = "${studentList[i].roll_no}" ) ORDER BY priority ASC`, function (err, result, fields){
//         if(err) throw err;
//         collegeList = result;
//         collegeListSize = result.length;
//         // console.log(collegeListSize)
//         // console.log(collegeList);
//         let allotted = false;

//         for(let j = 0; j< collegeListSize; j++){
          
//           con.query(`SELECT * FROM college_list WHERE( code = "${collegeList[j].code}" )`, function (err, result, fields){
//             if(err) throw err;
            
//             let data = collegeList[j];
//             bc = result[0].bc;
//             mbc = result[0].mbc;
//             oc = result[0].oc;
//             st = result[0].st;
//             others = result[0].others;

//             console.log(bc, mbc, oc, st, others);
//             console.log(allotted);
//             if(allotted){
//               console.log("break");
//               break;
//             }
//           console.log(collegeList[j]);

//             if(data.category === 1){
//               if(bc >= 1){
//                 bc = bc - 1;
//                 con.query(`INSERT INTO results (roll_no, name, college_name, code, department, choice_no) VALUES ("${data.roll_no}", "${data.name}", "${data.college_name}", "${data.code}", ${data.department}, ${data.priority})`,function(err, result){
//                   if(err) throw err;
//                   console.log("allotted");
//                   con.query(`UPDATE college_list SET bc = ${bc} , mbc = ${mbc}, oc = ${oc}, st = ${st}, others = ${others}  WHERE (code = "${data.code}")`,function(err, result,fields){
//                   if(err) throw err;
//                   console.log("seat decreased");            
//                   })
//                 })
//                 allotted = true
//               }
        
//             }else if(data.category === 2){
//               if(mbc >= 1){
//                 mbc = mbc - 1;
//                 con.query(`INSERT INTO results (roll_no, name, college_name, code, department, choice_no) VALUES ("${data.roll_no}", "${data.name}", "${data.college_name}", "${data.code}", ${data.department}, ${data.priority})`,(err, result)=>{
//                   if(err) throw err;
//                   console.log("allotted");
//                   con.query(`UPDATE college_list SET bc = ${bc} , mbc = ${mbc}, oc = ${oc}, st = ${st}, others = ${others}  WHERE (code = "${data.code}")`,(err, result,fields)=>{
//                   if(err) throw err;
//                   console.log("seat decreased");            
//                   })
//                 })
//                 allotted = true
//               }
//             }else if(data.category === 3){
//               if(oc >= 1){
//                 oc = oc - 1;
//                 con.query(`INSERT INTO results (roll_no, name, college_name, code, department, choice_no) VALUES ("${data.roll_no}", "${data.name}", "${data.college_name}", "${data.code}", ${data.department}, ${data.priority})`,(err, result)=>{
//                   if(err) throw err;
//                   console.log("allotted");
//                   con.query(`UPDATE college_list SET bc = ${bc} , mbc = ${mbc}, oc = ${oc}, st = ${st}, others = ${others}  WHERE (code = "${data.code}")`,(err, result,fields)=>{
//                   if(err) throw err;
//                   console.log("seat decreased");            
//                   })
//                 })
//                 allotted = true
//               }
//             }else if(data.category === 4){
//               if(st >= 1){
//                 st = st - 1;
//                 con.query(`INSERT INTO results (roll_no, name, college_name, code, department, choice_no) VALUES ("${data.roll_no}", "${data.name}", "${data.college_name}", "${data.code}", ${data.department}, ${data.priority})`,(err, result)=>{
//                   if(err) throw err;
//                   console.log("allotted");
//                   con.query(`UPDATE college_list SET bc = ${bc} , mbc = ${mbc}, oc = ${oc}, st = ${st}, others = ${others}  WHERE (code = "${data.code}")`,(err, result,fields)=>{
//                   if(err) throw err;
//                   console.log("seat decreased");            
//                   })
//                 })
//                 allotted = true
//               }
//             }else if(data.category === 5){
//               if(others >= 1){
//                 others = others - 1;
//                 con.query(`INSERT INTO results (roll_no, name, college_name, code, department, choice_no) VALUES ("${data.roll_no}", "${data.name}", "${data.college_name}", "${data.code}", ${data.department}, ${data.priority})`,(err, result)=>{
//                   if(err) throw err;
//                   console.log("allotted");
//                 })
//                   con.query(`UPDATE college_list SET bc = ${bc} , mbc = ${mbc}, oc = ${oc}, st = ${st}, others = ${others}  WHERE (code = "${data.code}")`,(err, result,fields)=>{
//                   if(err) throw err;
//                   console.log("seat decreased");            
                  
//                 })
//                 allotted = true
//               }
//             }
//           })
//         }
//       })
//     } 
//   })
//   res.send();
// })

