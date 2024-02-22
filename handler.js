// const AWS = require('aws-sdk');
// const { v4: uuidv4 } = require('uuid');

// const cognito = new AWS.CognitoIdentityServiceProvider();
// const dynamoDB = new AWS.DynamoDB.DocumentClient();

// const TABLE_NAME = 'UserProfiles';

require('dotenv').config();

var AWS = require('aws-sdk');

const my_AWSAccessKeyId = process.env.AWSAccessKeyId;
const my_AWSSecretKey = process.env.AWSSecretKey;
const aws_region = process.env.region;
const empTable = process.env.tableName;

var dynamoDB = new AWS.DynamoDB.DocumentClient({
    region: aws_region,
    accessKeyId: my_AWSAccessKeyId,
    secretAccessKey: my_AWSSecretKey,
});

module.exports.register = async (event) => {
   const {id,name,email, password } = JSON.parse(event.body);
  var params = {
    TableName:empTable,
    Item: {
        id: id,
        name:name,
        email:email,
        password:password
    },
    ReturnValues: 'ALL_OLD' 
};

let putItem = new Promise((res, rej) => {
    dynamoDB.put(params, function(err, data) {
        if (err) {
            console.log("Error", err);
            rej(err);
        } else {
            console.log("Success!");
            res(data);
        }
    }); 
});
const res = await putItem;
console.log(res);  
 
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "register successfully",result:res }),
    };
  // }
};

module.exports.login = async (event) => {
 
  return {
    statusCode: 500,
    body: JSON.stringify({ message: "login",body:JSON.parse(event.body) }),
  };
};

module.exports.profile = async (event) => {
  // const id = event.pathParameters.userId
  console.log("params",event.pathParameters,typeof(event.pathParameters.id));
    const params = {
        TableName:empTable,
        Key:{
            id: Number(event.pathParameters.id)
        }
    };

    let queryExecute = new Promise((res, rej) => {
        dynamoDB.get(params, function(err, data) {
            if (err) {
                console.log("Error", err);
                rej(err);
            } else {
                console.log("Success! get method fetch data from dynamodb");
                res(JSON.stringify(data, null, 2));
            }
        }); 
    });

    const res=await queryExecute;
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "profile",result:JSON.stringify(res) }),
  };
};
