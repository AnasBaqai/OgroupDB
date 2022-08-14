//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')
app.use(express.static("public"));

mongoose.connect("mongodb+srv://anasbaqai:An12as34@cluster0.uuocn2n.mongodb.net/OgroupStudentsDB");


const testsSchema = new mongoose.Schema({
    date: {
        type: String,
        required: [true, "please enter Date"],
    },
    category: {
        type: String,
        required: [true, "please enter category"],
    },
    title: {
        type: String,
        required: [true, "please enter course name"],
    },
    status: {
        type: String,
        required: [true, "please enter course name"],
    },
    obtainedMarks: {
        type: Number,
        // required: [true, "please enter obtained marks"]
    },
    totalMarks: {
        type: Number,
        required: [true, "please enter total marks"]
    },
    grade: String,
});
const studentsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "please enter name"],
    },
    DOB: {
        type: String,
        // required: [true, "please enter Date of Birth"],
    },
    class: {
        type: String,
        required: [true, "please enter Date of Birth"],
    },
    branchName: String,
    address: String,
    phoneNumber: String,
    subjects: [testsSchema],

});

const Test = mongoose.model("Test", testsSchema);
const Student = mongoose.model("Student", studentsSchema)


/////routes

app.get("/", function (req, res) {
    res.render("home");
})


app.post("/", function (req, res) {
    const newStudent = new Student({
        name: _.lowerCase(req.body.studentName),
        DOB: req.body.DOB,
        class: _.lowerCase(req.body.class),
        address: _.lowerCase(req.body.address),
        phoneNumber: _.lowerCase(req.body.phoneNumber),
        branchName: _.lowerCase(req.body.branchName),
    })
    newStudent.save();
    res.redirect("/");
})

app.get("/entry", function (req, res) {
    res.render("testEntry")
})

app.post("/entry", function (req, res) {
    let grade = "";
    if (req.body.status === "notAttempted") {


        var newTestEntry = new Test({
            date: req.body.testDate,
            category: _.lowerCase(req.body.category),
            title: _.lowerCase(req.body.subjectName),
            status: req.body.status,
            obtainedMarks: 0,
            totalMarks: req.body.totalMarks,
            grade:"F",
        })
        newTestEntry.save();
    } else {
        let calculatedGrade = (req.body.marks / req.body.totalMarks) * 100;
        console.log(calculatedGrade);
    
            if(calculatedGrade >= 80){
                grade = "A1";
                
            }
            else if (calculatedGrade >= 70 && calculatedGrade<=79){
                grade = "A";
                
            }
            else if (calculatedGrade >= 60 && calculatedGrade<=69){ 
                grade = "B";
            
            }
            else if (calculatedGrade >=40  && calculatedGrade<=59){
                grade = "C";
                
            }
            else if(calculatedGrade>=33  && calculatedGrade<=49){
                grade="D"
            }
            else{
                grade="F"
            
        }
        var newTestEntry = new Test({
            date: req.body.testDate,
            category: _.lowerCase(req.body.category),
            title: _.lowerCase(req.body.subjectName),
            status: _.lowerCase(req.body.status),
            obtainedMarks: req.body.marks,
            totalMarks: req.body.totalMarks,
            grade:grade,
        })
        newTestEntry.save();
    }

    if(_.lowerCase(req.body.studentName)==="" ){
        return res.send("<h1>Please enter student name</h1>")
    }
    Student.findOneAndUpdate(
        { name: _.lowerCase(req.body.studentName) },
        { "$push": { "subjects": newTestEntry } },
        function (err,foundStudent) {
            if (err) {
                console.log(err);
            } else {
                if(foundStudent){
                console.log("entered successfully");
                res.redirect("/entry");
                }else{
                    res.send("<h1>no student found<h1>");
                }
            }
        }
    )

   
})

app.get("/find", function (req, res) {
    res.render("find");
})

app.post("/find", function (req, res) {

    res.redirect("/find/" + req.body.studentName)
})
app.get("/find/:studentName", function (req, res) {

    stdName = _.lowerCase(req.params.studentName);
    Student.findOne({ name: stdName }, function (err, foundStudent) {
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

    Student.findOneAndUpdate({ name: req.body.studentName },
        { $pull: { subjects: { _id: req.body.subjectName } } },
        function (err, foundArray) {
            if (err) {
                console.log(err);
            } else {
                console.log("deleted successfully")
                res.redirect("/find/" + req.body.studentName)
            }
        })
})


app.get("/delete/:studentName", function (req, res) {
    Student.deleteOne({ name: req.params.studentName }, function (err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/findALL")
        }
    })
})
app.listen(process.env.PORT || 3000, function (req, res) {
    console.log("server is running at port 3000");
})