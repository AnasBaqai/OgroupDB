//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
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

// mongoose.connect("mongodb+srv://anasbaqai:An12as34@cluster0.uuocn2n.mongodb.net/OgroupStudentsDB");
mongoose.connect("mongodb://localhost:27017/sqeDB");

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
    date: String,
    category: String,
    title: String,
    status: String,
    obtainedMarks: Number,
    totalMarks: Number,
    grade: String,
    percantage: String,
});

const attendanceSchema= new mongoose.Schema({
    pDate: String,
    isPresent:Boolean,
})

const studentsSchema = new mongoose.Schema({
    _id: String,
    name: String,
    class: String,
    branchName: String,
    address: String,
    phoneNumber: String,
    email: String,
    subjects: [testsSchema],
    attendance: [attendanceSchema],

});

const Test = mongoose.model("Test", testsSchema);
const Student = mongoose.model("Student", studentsSchema)




/******************************************ROUTES ******************************** */


// app.get("/createAdmin",(req,res)=>{
//     res.sendFile(__dirname+"/views/adminCreate.html")
// })

// app.post("/createAdmin",(req,res)=>{
//     User.register({ username: req.body.username }, req.body.password, function (err, user) {
//         if (err) {
//             console.log(err);
//             res.redirect("/");
//         } else {
//             passport.authenticate("local")(req, res, function () {
//                 res.redirect("/register");
//             })
//         }
//     })
// })

/*******************************************LOGIN ROUTE **********************************/

app.get("/", function (req, res) {
    res.render("login2");
})
app.post("/", function (req, res) {

    const user = new User({
        username: req.body.username,
        password: req.body.password,
    })
    if (user.username === "admin") {
        req.login(user, function (err) {

            if (err) {
                console.log("err");
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/register");
                })
            }
        })

    } else {
        req.login(user, function (err) {

            if (err) {
                console.log("err");
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/student/home");
                })
            }
        })

    }



})
/************************************  REGISTER ROUTE ******************************************** */


app.get("/register", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("admin/home");
    } else {
        res.redirect("/");
    }


})


app.post("/register", function (req, res) {

    /*******    GENERATING EMAIL ********************/

    const newEMail = _.lowerCase(req.body.studentName) + "." + _.lowerCase(req.body.id) + "@Ogroup.com";
    const newEmail1 = newEMail.replace(/\s+/g, '');

    /************* INITIALZING NEW STUDENT **************/
    const newStudent = new Student({
        name: _.lowerCase(req.body.studentName),
        _id: _.lowerCase(req.body.id),
        class: _.lowerCase(req.body.class),
        address: _.lowerCase(req.body.address),
        phoneNumber: _.lowerCase(req.body.phoneNumber),
        branchName: _.lowerCase(req.body.branchName),
        email: newEmail1,

    })


    // console.log(newEmail1);
    /************************** REGISTERING NEW STUDENT ********************/

    Student.findById(_.lowerCase(req.body.id), function (err, foundStudent) {
        if (err) {
            console.log(err);
        } else {
            if (!foundStudent) {
                newStudent.save();

                User.register({ username: newEmail1 }, "Ogroup123", function (err, user) {
                    if (err) {
                        console.log(err);
                        res.redirect("/");
                    } else {
                        res.redirect("/register");
                    }
                })
            } else {
                res.send("Student with this id already exists");
            }
        }
    })

})


/********************************************* TEST ENTRY ROUTE ********************/

app.get("/entry", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("admin/testEntry", { student: "" })
    } else {
        res.redirect("/");
    }


})
app.post("/id", function (req, res) {
    Student.findOne({ _id: _.lowerCase(req.body.id) }, function (err, foundStudent) {
        if (foundStudent) {
            if (err) {
                console.log(err);
            } else {
                res.render("admin/testEntry", { student: foundStudent });
            }
        } else {
            res.send("<h1> student Not Found.</h1>")

        }
    })
})


app.post("/entry", function (req, res) {

    let grade = "";
    let obtMarks = Number(req.body.marks)
    let totMArks = Number(req.body.totalMarks);

    if (totMArks >= obtMarks) {

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

    } else {
        res.send("<h1> OBTAINED MARKS CAN NOT BE GREATER THAN TOTAL MARKS</h1>");
    }


})
/*************************** FIND BY ID ROUTE ************************************/

app.get("/find", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("admin/find");
    } else {
        res.redirect("/");
    }


})

app.post("/find", function (req, res) {

    res.redirect("/find/" + req.body.studentID)
})


/******************************************* EXPRESS ROUTE TO CREATE INDIVIDIUAL STUDENT RECORD PAGE ********************/


app.get("/find/:studentID", function (req, res) {
    if (req.isAuthenticated()) {
        stdID = _.lowerCase(req.params.studentID);
        console.log(stdID);
        Student.findOne({ _id: stdID }, function (err, foundStudent) {
            if (foundStudent) {
                if (err) {
                    console.log(err);
                } else {
                    res.render("admin/foundSpec", { student: foundStudent });
                }
            } else {
                res.send("<h1> student Not Found.")

            }
        })
    } else {
        res.redirect("/");
    }
})

/***************************************** ALL STUDENT RECORD ROUTE ********************/

app.get("/findALL", function (req, res) {

    if (req.isAuthenticated()) {
        Student.find({}, function (err, foundStudents) {
            if (err) {
                console.log(err);
            } else {
                res.render("admin/findALL", { studentsList: foundStudents });
            }
        })
    } else {
        res.redirect("/");
    }
})

/************************************** DELETE TEST FROM SPECIFIC RECORD ROUTE *************************/

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


/******************************************* DELETE STUDENT RECORD ROUTE *****************/

app.get("/delete/:studentID", function (req, res) {

    Student.findById(req.params.studentID, (err, student) => {
        if (err) {
            console.log(err);
        } else {
            User.deleteOne({ username: student.email }, (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log("registration cancelled successfully");
                }
            })
        }
    })
    Student.deleteOne({ _id: req.params.studentID }, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("record deleted successfully");
            res.redirect("/findALL")
        }
    })


})

/*********************************************** OPEN SEARCH ROUTE ****************************** */
// app.get("/openSearch", function (req, res) {
//     res.render("openSearch");
// })

// app.post("/openSearch", function (req, res) {
//     res.redirect("/openSearch/" + _.lowerCase(req.body.studentID))
// })
// app.get("/openSearch/:studentEmail", function (req, res) {
//     stdEmail = req.params.studentEmail;
//     console.log(stdEmail);
//     Student.findOne({ _id: stdID }, function (err, foundStudent) {
//         if (foundStudent) {
//             if (err) {
//                 console.log(err);
//             } else {
//                 res.render("openRecord", { student: foundStudent });
//             }
//         } else {
//             res.send("<h1> Record Not Found Enter Valid ID.")

//         }
//     })
// })

/**************************************** UPDATE PASSWORD ROUTE ********************************/

app.get("/update", (req, res) => {
    res.render("updatePass");

})

app.post("/update", (req, res) => {

    User.findOne({ username: req.body.email }, (err, user) => {
        if (user) {
            user.changePassword(req.body.oldpassword, req.body.newpassword, (err, results) => {
                if (err) {
                    res.send(err);
                } else {

                    res.redirect("/");
                }
            })

        } else {
            res.send("<h1>user not found<h1>");
        }


    })

})

/************************* STUDENT VIEWS ROUTE **************************/

app.get("/student/home", (req, res) => {
    Student.findOne({ email: req.user.username }, (err, foundStudent) => {
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

/******************************* adding email to existing record **********/
// app.get("/addEmail", (req, res) => {
//     Student.find({}, (err, foundStudents) => {
//         if (err) {
//             res.send(err);
//         } else {
//             foundStudents.forEach((student) => {

//                 const newEMail = _.lowerCase(student.name) + "." + _.lowerCase(student._id) + "@Ogroup.com";
//                 const newEmail1 = newEMail.replace(/\s+/g, '');
//                 console.log(newEmail1);
//                 User.register({ username: newEmail1 }, "Ogroup123", function (err, user) {
//                     if (err) {
//                         console.log(err);
//                         res.redirect("/");
//                     }
//                 })
//                 Student.findOneAndUpdate({_id:student._id},{email:newEmail1},(err)=>{
//                     if(err){
//                         res.send(err);
//                     }
//                 })
//             })
//         }
//     })

//     res.send("Updatted successfully");
// })

/*********************************** LISTENER PORT ROUTE **************************************/

app.listen(process.env.PORT || 3000, function (req, res) {
    console.log("server is running at port 3000");
})