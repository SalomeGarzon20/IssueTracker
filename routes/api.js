'use strict';

var expect = require('chai').expect;
let mongodb = require('mongodb')
let mongoose = require('mongoose')

let uri = 'mongodb+srv://gabriela:Gabriela07@cluster0.amtn6p4.mongodb.net/issue_tracker?retryWrites=true&w=majority&appName=Cluster0'

module.exports = function (app) {
  
  mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });

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
