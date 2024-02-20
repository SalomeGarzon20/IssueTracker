'use strict';

const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const IssueModel = require("../models").Issue;
const ProjectModel = require("../models").Project;

module.exports = function (app) {

  app.route("/api/issues/:project")

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
      ]).then((data) => {
        if (!data) { 
          res.json([]);
        } else {
          let mappedData = data.map((item) => item.issues); 
          res.json(mappedData);
        }
      }).catch((err) => {
        console.error(err);
        res.status(500).send("Internal Server Error");
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
          console.error(err);
          res.status(500).send("Internal Server Error");
        });
    })

    /*
    .put(function (req, res) {
      let project = req.params.project;
      const { 
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }
      if (
        !issue_title &&
        !issue_text &&
        !created_by &&
        !assigned_to &&
        !status_text &&
        !open
      ) {
        res.json({ error: "no update field(s) sent", _id: _id });
        return;
      }
      ProjectModel.findOne({ name: project }) // Cambio aquí
        .then(projectdata => {
          if (!projectdata) {
            throw new Error("could not update"); // Cambio aquí
          }
          const issueData = projectdata.issues.id(_id);
          if (!issueData) {
            throw new Error("could not update"); // Cambio aquí
          } 
          issueData.issue_title = issue_title || issueData.issue_title; 
          issueData.issue_text = issue_text || issueData.issue_text; 
          issueData.created_by = created_by || issueData.created_by; 
          issueData.assigned_to= assigned_to || issueData.assigned_to; 
          issueData.status_text = status_text || issueData.status_text; 
          issueData.updated_on = new Date();
          issueData.open = open;
          return projectdata.save(); 
        })
        .then(data => {
          res.json({ result: "successfully updated", _id: _id });
        })
        .catch(err => {
          console.error(err);
          res.status(500).send("Internal Server Error");
        });
    })
*/
    .put(function (req, res) {
      let project = req.params.project;
      const { 
        _id,
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text,
        open,
      } = req.body;

      if (!_id) {
        res.json({ error: "missing _id" });
        return;
      }

      const updates = {};
      if (issue_title) updates.issue_title = issue_title;
      if (issue_text) updates.issue_text = issue_text;
      if (created_by) updates.created_by = created_by;
      if (assigned_to) updates.assigned_to = assigned_to;
      if (status_text) updates.status_text = status_text;
      if (typeof open === 'boolean') updates.open = open;
      
      if (Object.keys(updates).length === 0) {
        res.json({ error: "no update field(s) sent", _id: _id });
        return;
      }

      ProjectModel.findOneAndUpdate(
        { name: project, "issues._id": _id },
        { $set: { "issues.$": { ...updates, updated_on: new Date() } } },
        { new: true }
      )
      .then(data => {
        if (!data) {
          throw new Error("could not update");
        }
        res.json({ result: "successfully updated", _id: _id });
      })
      .catch(err => {
        console.error(err);
        res.status(500).send("Internal Server Error");
      });
    })

    .delete(function (req, res) {
      let projectName = req.params.project; 
      const { _id } = req.body;
      if (!_id) {
        res.json({ error: "missing _id" }); 
        return;
      }
      
      ProjectModel.findOneAndDelete({ name: projectName })
        .then(deletedProject => {
          if (!deletedProject) {
            throw new Error("Project not found");
          }
          res.json({ result: "successfully deleted", _id: deletedProject._id });
        })
        .catch(err => {
          console.error(err);
          res.status(404).json({ error: err.message, _id: _id });        
        });
    });
    

/*
    .delete(function (req, res) {
      let project = req.params.project; 
      const { _id } = req.body;
      if (!_id) {
        res.status(400).json({ error: "missing _id" }); 
        return;
      }
      
      ProjectModel.findOne({ name: project })
        .then(projectdata => {
          if (!projectdata) {
            throw new Error("could not find project");
          }
          const issueData = projectdata.issues.id(_id); 
          if (!issueData) {
            throw new Error("could not find issue");
          }
          issueData.remove(); 
          
          return projectdata.save();
        })
        .then(data => {
          res.json({ result: "successfully deleted", _id: _id });
        })
        .catch(err => {
          console.error(err);
          res.status(404).json({ error: err.message, _id: _id });        
        });
    });
    */
    /*
    .delete(function (req, res) {
      let project = req.params.project; 
      const { _id } = req.params;
      if (!_id) {
        res.json({ error: "missing _id" }); 
        return;
      }
      
      ProjectModel.findOne({ name: project })
        .then(projectdata => {
          if (!projectdata) {
            throw new Error("could not delete");
          }
          const issueData = projectdata.issues.id(_id); 
          if (!issueData) {
            throw new Error("could not delete");
          }
          issueData.remove(); 
          
          return projectdata.save();
        })
        .then(data => {
          res.json({ result: "successfully deleted", _id: _id });
        })
        .catch(err => {
          console.error(err);
          res.status(404).json({ error: err.message, _id: _id });        
        });
    });
    */
  }