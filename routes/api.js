'use strict';

var expect = require('chai').expect;
let mongodb = require('mongodb')
let mongoose = require('mongoose')

let uri = 'mongodb+srv://gabriela:' + process.env.PW + '@cluster0.amtn6p4.mongodb.net/issue_tracker?retryWrites=true&w=majority&appName=Cluster0'

module.exports = function (app) {
  
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  let issueSchema = new mongoose.Schema({
    issue_title: {type: String, required: true},
    issue_text: {type: String, required: true},
    created_by : {type: String, required: true},
    assigned_to : String,
    status_text : String,
    open: {type: Boolean, required: true},
    created_on: {type: Date, required: true},
    updated_on: {type: Date, required: true},
    project: String
  })

  let Issue = mongoose.model('Issue', issueSchema)

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      
    })
    
    .post(function (req, res){
      let project = req.params.project;
      
    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
