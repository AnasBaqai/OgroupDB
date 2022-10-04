//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
var path = require('path')

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
// app.set('views', path.join(__dirname, '../dist/views'))
app.set('view engine', 'ejs')
app.use(express.static("public"));

app.use(session({
    secret: "we are friends",
    resave: false,
    saveUninitialized: false,
})
);



app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://anasbaqai:An12as34@cluster0.uuocn2n.mongodb.net/OgroupStudentsDB");
// mongoose.connect("mongodb://localhost:27017/sqeDB");

const usersSchema = new mongoose.Schema({
    username: String,
    password: String,
});
usersSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", usersSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const testsSchema = new mongoose.Schema({
    date: {
        type: String,
        // required: [true, "please enter Date"],
    },
    category: {
        type: String,
        // required: [true, "please enter category"],
    },
    title: {
        type: String,
        // required: [true, "please enter course name"],
    },
    status: {
        type: String,
        // required: [true, "please enter course name"],
    },
    obtainedMarks: {
        type: Number,
        // required: [true, "please enter obtained marks"]
    },
    totalMarks: {
        type: Number,
        // required: [true, "please enter total marks"]
    },
    grade: String,
    percantage: String,
});
const studentsSchema = new mongoose.Schema({
    _id: {
        type: String,
        // required: [true, "please enter name"],
    },
    name: {
        type: String,
        // required: [true, "please enter name"],
    },
    // DOB: {
    //     type: String,
    //     // required: [true, "please enter Date of Birth"],
    // },
    class: {
        type: String,
        // required: [true, "please enter Date of Birth"],
    },
    branchName: String,
    address: String,
    phoneNumber: String,
    subjects: [testsSchema],

});

const Test = mongoose.model("Test", testsSchema);
const Student = mongoose.model("Student", studentsSchema)

// function createDefaultUser(name){
//     User.findOne({username:name},function(err,foundUser){
//         if(err){
//             console.log(err);
//         }else{
//             if(!foundUser){
//                 return false;
//             }else{
//                 return true;
//             }
//         }
//     })
// }



/////routes

app.get("/", function (req, res) {
    res.render("login");
})
app.post("/", function (req, res) {
    if (req.body.username === "admin" && req.body.password === "admin") {
        res.redirect("/register");
    } else {
        res.redirect("/");
    }

    //const newUser= new User({
    //     username:req.body.username,
    //     password:req.body.password,
    // })
    // if(!createDefaultUser(req.body.username))
    // {
    //     newUser.save();
    // }
    // req.login(newUser,function(err){
    //     if(err){
    //         console.log("err");
    //     }else{
    //         passport.authenticate("local")(req,res,function(){
    //             res.redirect("/register");
    //         })
    //     }
    // })



})
app.get("/register", function (req, res) {
    // if (req.isAuthenticated()) {
    //     res.render("home");
    // } else {
    //     res.redirect("/");
    // }
    res.render("home");

})


app.post("/register", function (req, res) {
    const newStudent = new Student({
        name: _.lowerCase(req.body.studentName),
        _id: _.lowerCase(req.body.id),
        class: _.lowerCase(req.body.class),
        address: _.lowerCase(req.body.address),
        phoneNumber: _.lowerCase(req.body.phoneNumber),
        branchName: _.lowerCase(req.body.branchName),
    })
    Student.findById(_.lowerCase(req.body.id), function (err, foundStudent) {
        if (err) {
            console.log(err);
        } else {
            if (!foundStudent) {
                newStudent.save();
                res.redirect("/register");
            }else{
                res.send("Student with this id already exists");
            }
        }
    })

})

app.get("/entry", function (req, res) {
    res.render("testEntry", { student: "" })
})

app.post("/entry", function (req, res) {
    let grade = "";
    let obtMarks = Number(req.body.marks)
    let totMArks = Number(req.body.totalMarks);
    console.log(req.body.marks);
    console.log(req.body.totalMarks);
    if(totMArks>= obtMarks){
       
         if (req.body.status === "notAttempted") {
            var newTestEntry = new Test({
                date: req.body.testDate,
                category: _.lowerCase(req.body.category),
                title: _.lowerCase(req.body.subjectName),
                status: req.body.status,
                obtainedMarks: 0,
                totalMarks: req.body.totalMarks,
                grade: "F",
                percantage: "0%"
            })
            newTestEntry.save();
        } else {
           
            let calculatedGrade = (req.body.marks / req.body.totalMarks) * 100;
            console.log(calculatedGrade);
    
            if (calculatedGrade >= 80) {
                grade = "A1";
    
            }
            else if (calculatedGrade >= 70 && calculatedGrade <= 79) {
                grade = "A";
    
            }
            else if (calculatedGrade >= 60 && calculatedGrade <= 69) {
                grade = "B";
    
            }
            else if (calculatedGrade >= 40 && calculatedGrade <= 59) {
                grade = "C";
    
            }
            else if (calculatedGrade >= 33 && calculatedGrade <= 49) {
                grade = "D"
            }
            else {
                grade = "F"
    
            }
            var newTestEntry = new Test({
                date: req.body.testDate,
                category: _.lowerCase(req.body.category),
                title: _.lowerCase(req.body.subjectName),
                status: _.lowerCase(req.body.status),
                obtainedMarks: req.body.marks,
                totalMarks: req.body.totalMarks,
                grade: grade,
                percantage: calculatedGrade.toFixed(3) + "%",
            })
            newTestEntry.save();
        }
    
        console.log(_.lowerCase(req.body.studentID))
        Student.findOneAndUpdate(
            { _id: _.lowerCase(req.body.studentID) },
            { "$push": { "subjects": newTestEntry } },
            function (err, foundStudent) {
                if (err) {
                    console.log(err);
                } else {
                    if (foundStudent) {
                        console.log("entered successfully");
                        res.redirect("/entry");
                    } else {
                        res.send("<h1>no student found<h1>");
                    }
                }
            }
        )
    
    }else{
        res.send("<h1> OBTAINED MARKS CAN NOT BE GREATER THAN TOTAL MARKS</h1>");
    }
    

})

app.get("/find", function (req, res) {
    res.render("find");
})

app.post("/find", function (req, res) {

    res.redirect("/find/" + req.body.studentID)
})
app.get("/find/:studentID", function (req, res) {

    stdID = _.lowerCase(req.params.studentID);
    console.log(stdID);
    Student.findOne({ _id: stdID }, function (err, foundStudent) {
        if (foundStudent) {
            if (err) {
                console.log(err);
            } else {
                res.render("foundSpec", { student: foundStudent });
            }
        } else {
            res.send("<h1> student Not Found.")

        }
    })
})
app.get("/findALL", function (req, res) {
    Student.find({}, function (err, foundStudents) {
        if (err) {
            console.log(err);
        } else {
            res.render("findALL", { studentsList: foundStudents });
        }
    })
})

// app.get("/findALL/:studentName",function(req,res){
//     const studentName= _.lowerCase(req.params.studentName);

//     Student.findOne({name:studentName},function(err,foundStudent){
//         if(err){
//             console.log(err);
//         }else{
//             res.render("foundSpec",{student:foundStudent});
//         }
//     })


// })


app.post("/delete", function (req, res) {

    console.log("logging from /delete" + req.body.studentID);

    Student.findOneAndUpdate({ _id: req.body.studentID },
        { $pull: { subjects: { _id: req.body.subjectID } } },
        function (err, foundArray) {
            if (err) {
                console.log(err);
            } else {
                console.log("deleted successfully")
                res.redirect("/find/" + req.body.studentID)
            }
        })



})




app.get("/delete/:studentID", function (req, res) {
    console.log("loggin id from find all delete req :" + req.params.studentID)

    Student.deleteOne({ _id: req.params.studentID }, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("record deleted successfully");
            res.redirect("/findALL")
        }
    })


})

app.post("/id", function (req, res) {
    Student.findOne({ _id: _.lowerCase(req.body.id) }, function (err, foundStudent) {
        if (foundStudent) {
            if (err) {
                console.log(err);
            } else {
                res.render("testEntry", { student: foundStudent });
            }
        } else {
            res.send("<h1> student Not Found.</h1>")

        }
    })
})

app.get("/openSearch",function(req,res){
    res.render("openSearch");
})

app.post("/openSearch",function(req,res){
    res.redirect("/openSearch/" + _.lowerCase(req.body.studentID))
})
app.get("/openSearch/:studentID",function(req,res){
    stdID = _.lowerCase(req.params.studentID);
    console.log(stdID);
    Student.findOne({ _id: stdID }, function (err, foundStudent) {
        if (foundStudent) {
            if (err) {
                console.log(err);
            } else {
                res.render("openRecord", { student: foundStudent });
            }
        } else {
            res.send("<h1> Record Not Found Enter Valid ID.")

        }
    })
})
app.listen(process.env.PORT || 3000, function (req, res) {
    console.log("server is running at port 3000");
})