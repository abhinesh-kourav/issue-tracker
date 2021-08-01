const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
require("../db-connection")

chai.use(chaiHttp);

let deleteID;
suite('Functional Tests', function() {
  test('Create an issue with every field: POST request to /api/issues/{project}',done=>{
    chai
    .request(server)
    .post("/api/issues/projects")
    .set("content-type", "application/json")
    .send({
      issue_title:'cannot login',
      issue_text: "cannot login on site",
      created_by : "ab",
      assigned_to: "fcc",
      status_text: 'pending'
    })
    .end((err,res)=>{
      //console.log(res);
      assert.equal(res.status,200);
      deleteID = res.body._id;
      assert.equal(res.body.issue_title,'cannot login');
      assert.equal(res.body.issue_text,"cannot login on site");
      assert.equal(res.body.created_by,'ab');
      assert.equal(res.body.assigned_to,"fcc");
      assert.equal(res.body.status_text,'pending');
      done();
    })
  })

  test('Create an issue with only required fields: POST request to /api/issues/{project}',(done)=>{
    chai
    .request(server)
    .post("/api/issues/projects")
    .set("content-type", "application/json")
    .send({
      issue_title:'cannot login',
      issue_text: "cannot login on site",
      created_by : "ab",
      assigned_to: "",
      status_text: ''
    })
    .end((err,res)=>{
      //console.log(res);
      assert.equal(res.status,200);
      assert.equal(res.body.issue_title,'cannot login');
      assert.equal(res.body.issue_text,"cannot login on site");
      assert.equal(res.body.created_by,'ab');
      assert.equal(res.body.assigned_to,"");
      assert.equal(res.body.status_text,'');
      done();
    })
  });
  
  test('Create an issue with missing required fields: POST request to /api/issues/{project}',(done)=>{
    chai
    .request(server)
    .post("/api/issues/projects")
    .set("content-type", "application/json")
    .send({
      issue_title:'',
      issue_text: "",
      created_by : "",
      assigned_to: "",
      status_text: ''
    })
    .end((err,res)=>{
      //console.log(res);
      assert.equal(res.status,200);
      assert.equal(res.body.error,'required field(s) missing');
      done();
    })
  });

  test("View issues on a project: GET request to /api/issues/{project}",(done)=>{
    chai
    .request(server)
    .get("/api/issues/test4")
    .end((err,res)=>{
      if(err) console.log(err);
      assert.equal(res.status, 200);
      assert.equal(res.body.length, 4);
      done();
    })
  })

  test("View issues on a project with one filter: GET request to /api/issues/{project}",(done)=>{
    chai
    .request(server)
    .get('/api/issues/test4')
    .query({ issue_title:"test2" })
    .end((err,res)=>{
      if(err) console.log(err);
      //console.log(res.body[0]);
      assert.equal(res.status,200);
      assert.deepEqual(res.body[0],{"_id":"61063b9198133c07448ebd71",
      "issue_title":"test2",
      "issue_text":"test2",
      "created_on":"2021-08-01T06:13:37.877Z","updated_on":"2021-08-01T06:13:37.877Z",
      "created_by":"ab",
      "assigned_to":"",
      "open":true,
      "status_text":""})
      done();
    })
  })

  test("View issues on a project with multiple filters: GET request to /api/issues/{project}",(done)=>{
    chai
    .request(server)
    .get("/api/issues/test4")
    .query({issue_title:'test1', created_by:"ab"})
    .end((err,res)=>{
      if(err) console.log(err);
      assert.equal(res.status,200);
      assert.deepEqual(res.body[0],{"_id":"61063b7c98133c07448ebd6b","issue_title":"test1",
      "issue_text":"test1",
      "created_on":"2021-08-01T06:13:16.854Z",
      "updated_on":"2021-08-01T06:13:16.854Z",
      "created_by":"ab",
      "assigned_to":"",
      "open":true,
      "status_text":""})
      done();
    })
  })

  test("Update one field on an issue: PUT request to /api/issues/{project}",(done)=>{
    chai
    .request(server)
    .put('/api/issues/apitest')
    .send({"_id":"6105420d9db8c70446e58476","issue_title":"its okay now"})
    .end((err,res)=>{
      assert.equal(res.status,200);
      assert.equal(res.body.result,'successfully updated');
      assert.equal(res.body._id,"6105420d9db8c70446e58476");
      done();
    })
  })

  test("Update multiple fields on an issue: PUT request to /api/issues/{project}",(done)=>{
    chai
    .request(server)
    .put("/api/issues/apitest")
    .send({"_id":"6105420d9db8c70446e58476",
    "issue_title":"its ok now",
    "issue_text":"ok",
    assigned_to:	"fcc"})
    .end((err,res)=>{
      assert.equal(res.status,200);
      assert.equal(res.body.result,'successfully updated');
      assert.equal(res.body._id,"6105420d9db8c70446e58476");
      done();
    })
  })

  test("Update an issue with missing _id: PUT request to /api/issues/{project}",(done)=>{
    chai
    .request(server)
    .put('/api/issues/apitest')
    .send({issue_title:"not gonna work"})
    .end((err,res)=>{
      assert.equal(res.status,200);
      assert.equal(res.body.error,'missing _id');
      done();
    })
  })

  test("Update an issue with no fields to update: PUT request to /api/issues/{project}",(done)=>{
    chai
    .request(server)
    .put('/api/issues/apitest')
    .send({_id:"6105420d9db8c70446e58476"})
    .end((err,res)=>{
      assert.equal(res.status,200);
      assert.equal(res.body.error,'no update field(s) sent');
      assert.equal(res.body._id,"6105420d9db8c70446e58476");
      done();
    })
  })

  test("Update an issue with an invalid _id: PUT request to /api/issues/{project}",(done)=>{
    chai
    .request(server)
    .put('/api/issues/apitest')
    .send({_id:"6105420d9db8c70446e58476abcd",issue_text:"test"})
    .end((err,res)=>{
      assert.equal(res.status,200);
      assert.equal(res.body.error,'could not update');
      assert.equal(res.body._id,"6105420d9db8c70446e58476abcd");
      done();
    })
  })

  test("Delete an issue: DELETE request to /api/issues/{project}",(done)=>{
    chai
    .request(server)
    .delete('/api/issues/projects')
    .send({_id:deleteID})
    .end((err,res)=>{
      assert.equal(res.status,200);
      assert.equal(res.body.result,'successfully deleted');
      assert.equal(res.body._id,deleteID);
      done();
    })
  })

  test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}",(done)=>{
    chai
    .request(server)
    .delete('/api/issues/apitest')
    .send({_id:"610692470a6a840ad24bad55abcd"})
    .end((err,res)=>{
      assert.equal(res.status,200);
      assert.equal(res.body.error,'could not delete');
      assert.equal(res.body._id,"610692470a6a840ad24bad55abcd");
      done();
    })
  })

  test("Delete an issue with missing _id: DELETE request to /api/issues/{project}",(done)=>{
    chai
    .request(server)
    .delete('/api/issues/apitest')
    .send({})
    .end((err,res)=>{
      assert.equal(res.status,200);
      assert.equal(res.body.error,'missing _id');
      done();
    })
  })
})