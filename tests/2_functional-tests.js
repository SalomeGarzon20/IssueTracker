const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");
const Issue = require("../models/issue");

chai.use(chaiHttp);

Issue.deleteMany({ project: "test" }, (err, result) =>
  err ? console.log(err) : console.log(result),
);

suite("Functional Tests", function () {
  this.timeout(5000);

  const regexIsoString =
    /[1-9][0-9]{3}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}Z/;

  suite("Test POST /api/issues/{project}", function () {
    test("Create an issue with every field", function (done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "test",
          issue_text: "test",
          created_by: "test",
          assigned_to: "test",
          status_text: "test",
        })
        .end((err, res) => {
          console.log("Create an issue with every field:");
          console.log(res.body);
          assert.isDefined(res.body._id);
          assert.isNotNull(res.body._id);
          assert.typeOf(res.body._id, "string");
          assert.equal(res.body.issue_title, "test");
          assert.equal(res.body.issue_text, "test");
          assert.match(res.body.created_on, regexIsoString);
          assert.match(res.body.updated_on, regexIsoString);
          assert.equal(res.body.created_by, "test");
          assert.equal(res.body.assigned_to, "test");
          assert.equal(res.body.open, true);
          assert.equal(res.body.status_text, "test");
          done();
        });
    });

    test("Create an issue with only required fields", function (done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "test",
          issue_text: "test",
          created_by: "test",
        })
        .end((err, res) => {
          assert.isDefined(res.body._id);
          assert.isNotNull(res.body._id);
          assert.typeOf(res.body._id, "string");
          assert.equal(res.body.issue_title, "test");
          assert.equal(res.body.issue_text, "test");
          assert.match(res.body.created_on, regexIsoString);
          assert.match(res.body.updated_on, regexIsoString);
          assert.equal(res.body.created_by, "test");
          assert.equal(res.body.assigned_to, "");
          assert.equal(res.body.open, true);
          assert.equal(res.body.status_text, "");
          done();
        });
    });

    test("Create an issue with missing required fields", function (done) {
      chai
        .request(server)
        .post("/api/issues/test")
        .send({
          issue_title: "test",
          issue_text: "test",
        })
        .end((err, res) => {
          assert.equal(res.body.error, "required field(s) missing");
          done();
        });
    });
  });

  suite("Test GET /api/issues/{project}", function () {
    test("View issues on a project", function (done) {
      chai
        .request(server)
        .get("/api/issues/test")
        .end((err, res) => {
          Issue.find({ project: "test" }, (err, data) => {
            if (err) return console.log(err);
            res.body.map((responseIssue, index) => {
              assert.equal(responseIssue._id, data[index]._id);
            });
          });
          done();
        });
    });

    test("View issues on a project with one filter", function (done) {
      let issue = new Issue({
        project: "test",
        issue_title: "filter", // different point
        issue_text: "test",
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by: "test",
        assigned_to: "",
        open: true,
        status_text: "",
      });

      issue.save((err, data) => (err ? console.log(err) : data));

      chai
        .request(server)
        .get("/api/issues/test?issue_title=filter")
        .end((err, res) => {
          Issue.find({ project: "test" }, (err, data) => {
            if (err) return console.log(err);
            let filteredData = data.filter((d) => d.issue_title === "filter");
            res.body.map((responseIssue, index) => {
              assert.equal(responseIssue._id, filteredData[index]._id);
            });
          });
          done();
        });
    });

    test("View issues on a project with multiple filters", function (done) {
      let issue = new Issue({
        project: "test",
        issue_title: "filter",
        issue_text: "test",
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by: "test",
        assigned_to: "",
        open: false, // different point
        status_text: "",
      });

      issue.save((err, data) => (err ? console.log(err) : data));

      chai
        .request(server)
        .get("/api/issues/test?issue_title=filter&open=false")
        .end((err, res) => {
          Issue.find({ project: "test" }, (err, data) => {
            if (err) return console.log(err);
            let filteredData = data.filter(
              (d) => d.issue_title === "filter" && d.open === false,
            );
            res.body.map((issue, index) => {
              assert.equal(issue._id, filteredData[index]._id);
            });
          });
          done();
        });
    });
  });

  suite("Test PUT /api/issues/{project}", function () {
    test("Update one field on an issue", function (done) {
      let issue = new Issue({
        project: "test",
        issue_title: "test",
        issue_text: "test",
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by: "test",
        assigned_to: "",
        open: true,
        status_text: "",
      });

      issue.save((err, data) => {
        if (err) return console.log(err);
        chai
          .request(server)
          .put("/api/issues/test")
          .send({
            _id: data._id,
            open: false, // updating point
          })
          .end((err, res) => {
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, data._id);
            done();
          });
      });
    });

    test("Update multiple fields on an issue", function (done) {
      let issue = new Issue({
        project: "test",
        issue_title: "test",
        issue_text: "test",
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by: "test",
        assigned_to: "",
        open: true,
        status_text: "",
      });

      issue.save((err, data) => {
        if (err) return console.log(err);
        chai
          .request(server)
          .put("/api/issues/test")
          .send({
            _id: data._id,
            issue_title: "updated",
            issue_text: "updated",
            created_by: "updated",
            assigned_to: "updated",
            open: false,
            status_text: "updated",
          })
          .end((err, res) => {
            assert.equal(res.body.result, "successfully updated");
            assert.equal(res.body._id, data._id);
            done();
          });
      });
    });

    test("Update an issue with missing _id", function (done) {
      let issue = new Issue({
        project: "test",
        issue_title: "test",
        issue_text: "test",
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by: "test",
        assigned_to: "",
        open: true,
        status_text: "",
      });

      issue.save((err, data) => {
        if (err) return console.log(err);
        chai
          .request(server)
          .put("/api/issues/test")
          .send({
            open: false, // updating point
          })
          .end((err, res) => {
            assert.equal(res.body.error, "missing _id");
            done();
          });
      });
    });

    test("Update an issue with no fields to update", function (done) {
      let issue = new Issue({
        project: "test",
        issue_title: "test",
        issue_text: "test",
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by: "test",
        assigned_to: "",
        open: true,
        status_text: "",
      });

      issue.save((err, data) => {
        if (err) return console.log(err);
        chai
          .request(server)
          .put("/api/issues/test")
          .send({
            _id: data._id,
          }) // missing updating field
          .end((err, res) => {
            assert.equal(res.body.error, "no update field(s) sent");
            assert.equal(res.body._id, data._id);
            done();
          });
      });
    });

    test("Update an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .put("/api/issues/test")
        .send({
          _id: "INVALID_ID",
          open: false,
        })
        .end((err, res) => {
          assert.equal(res.body.error, "could not update");
          assert.equal(res.body._id, "INVALID_ID");
          done();
        });
    });
  });

  suite("Test DELETE /api/issues/{project}", function () {
    test("Delete an issue", function (done) {
      let issue = new Issue({
        project: "test",
        issue_title: "test",
        issue_text: "test",
        created_on: new Date().toISOString(),
        updated_on: new Date().toISOString(),
        created_by: "test",
        assigned_to: "",
        open: true,
        status_text: "",
      });

      issue.save((err, data) => {
        if (err) return console.log(err);
        chai
          .request(server)
          .delete("/api/issues/test")
          .send({
            _id: data._id,
          })
          .end((err, res) => {
            assert.equal(res.body.result, "successfully deleted");
            assert.equal(res.body._id, data._id);
            done();
          });
      });
    });

    test("Delete an issue with an invalid _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/test")
        .send({
          _id: "INVALID_ID",
        })
        .end((err, res) => {
          assert.equal(res.body.error, "could not delete");
          assert.equal(res.body._id, "INVALID_ID");
          done();
        });
    });

    test("Delete an issue with missing _id", function (done) {
      chai
        .request(server)
        .delete("/api/issues/test")
        .send({})
        .end((err, res) => {
          assert.equal(res.body.error, "missing _id");
          done();
        });
    });
  });
});
