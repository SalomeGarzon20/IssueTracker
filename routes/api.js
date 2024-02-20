'use strict';

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId; // Agrega esta línea
const IssueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;

module.exports = function (app) {

  app.route('/api/issues/:project')

    .get(function (req, res) {
      let projectName = req.params.project;
      
      const { 
        _id,
        open,
        issue_title,
        issue_text,
        created_by,
        assigned_to, 
        status_text, 
      } = req.query;
      
      ProjectModel.aggregate([
        { $match: {name: projectName}},
        { $unwind: "$issues" },
        _id != undefined
        ? { $match: { "issues._id": ObjectId(_id) } }
        : { $match: {} },
        open!= undefined
        ? { $match: { "issues.open": open } }
        : { $match: {}},
        issue_title != undefined
        ? { $match: { "issues.issue_title": issue_title}} 
        : { $match: {} },
        issue_text != undefined
        ? { $match: { "issues.issue_text": issue_text } } 
        : { $match: {}},
        created_by != undefined
        ? { $match: { "issues.created_by": created_by } } 
        : { $match: {} },
        assigned_to != undefined
        ? { $match: { "issues.assigned_to": assigned_to } }
        : { $match: {}}, 
        status_text != undefined
        ? { $match: { "issues.status_text": status_text } } 
        : { $match: {}},
      ]).then((data) => { // Cambio aquí
        if (!data) { 
          res.json([]);
        } else {
          let mappedData = data.map((item) => item. issues); 
          //res.json(data);
          res.json (mappedData);
        }
      }).catch((err) => { // Cambio aquí
        console.error(err); // Agrega esto para ver si hay errores
        res.status(500).send("Internal Server Error"); // Cambio aquí
      });
    })

    .post(function (req, res) {
      let project = req.params.project;
      const {
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
      } = req.body;
      if (!issue_title || !issue_text || !created_by) {
        res.json({ error: "required field(s) missing" });
        return;
      }
      const newIssue = new IssueModel({
        issue_title: issue_title || "",
        issue_text: issue_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        created_by: created_by || "",
        assigned_to: assigned_to || "",
        open: true,
        status_text: status_text || "",
      });

      ProjectModel.findOne({ name: project })
        .then(projectdata => {
          if (!projectdata) {
            const newProject = new ProjectModel({ name: project });
            newProject.issues.push(newIssue);
            return newProject.save();
          } else {
            projectdata.issues.push(newIssue);
            return projectdata.save();
          }
        })
        .then(data => {
          res.json(newIssue);
        })
        .catch(err => {
          console.error(err); // Agrega esto para ver si hay errores
          res.status(500).send("Internal Server Error"); // Cambio aquí
        });
    })

    .put(function (req, res) {
      let project = req.params.project;

    })

    .delete(function (req, res) {
      let project = req.params.project;

    });

};
