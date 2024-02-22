require('dotenv').config();
const AWS = require('aws-sdk');
const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider();

module.exports.register = async (event) => {
  const { email, password } = JSON.parse(event.body); //password should be string
  
  try {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email }
      ]
    };
    await cognitoidentityserviceprovider.signUp(params).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User successfully registered' })
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ message: error.message || 'An error occurred' })
    };
  }
};

module.exports.verifyCode = async (event) => {
  const { email, code } = JSON.parse(event.body);  //code should be string
  
  try {
    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code
    };
    await cognitoidentityserviceprovider.confirmSignUp(params).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User successfully verified' })
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ message: error.message || 'An error occurred' })
    };
  }
};


module.exports.login = async (event) => {
  const { email, password } = JSON.parse(event.body);

  try {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        'USERNAME': email,
        'PASSWORD': password
      }
    };
    const data = await cognitoidentityserviceprovider.initiateAuth(params).promise();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ accessToken: data.AuthenticationResult.AccessToken })
    };
  } catch (error) {
    return {
      statusCode: error.statusCode || 500,
      body: JSON.stringify({ message: error.message || 'An error occurred' })
    };
  }
};

module.exports.profile = async (event) => {
  try {
    const { sub: userId } = event.requestContext.authorizer.claims;
    const user = await getUserProfile(userId);

    return {
      statusCode: 200,
      body: JSON.stringify(user)
    };
  } catch (error) {
    return {
      statusCode: 401, // Unauthorized
      body: JSON.stringify({ message: 'Unauthorized' })
    };
  }
};

async function getUserProfile(userId) {
  const params = {
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Filter: `sub = "${userId}"`
  };

  const data = await cognitoidentityserviceprovider.listUsers(params).promise();

  if (data.Users.length === 0) {
    throw new Error('User not found');
  }

  const user = {
    email: data.Users[0].Username,
    // Add additional attributes as needed
  };

  return user;
}
