//will hold all our client secret keys (facebook, twitter, google)

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'      : '490661971268498', // your App ID
        'clientSecret'  : 'f3300b97b2eab3cdf4d2379044fc1f7e', // your App Secret
        'callbackURL'   : 'http://transpire.azurewebsites.net/auth/facebook/callback'
    },

    'fitbitAuth' : {
      'clientID' : '228PCW',
      'clientSecret' : 'deeb59608f6c8ce495165f3537e7c3ea',
      'callbackURL' : 'http://transpire.azurewebsites.net/auth/fitbit/callback'
    },

    'googleFitAPI' : {
      'clientID' : '209500782585-j4mj84q5h2bles7fd3j5qv254rjn1ja2.apps.googleusercontent.com',
      'clientSecret' : 'M7aoUYQqmLHLNQmf6kjZPN7O',
      'callbackURL' : '/source/google-fit/callback'
    },

    'azureAdb2c' : {
      'clientID' : 'cd743d7c-ddaf-4229-a7dc-93db38906000',
      'identityMetadata' : 'https://login.microsoftonline.com/fhirfli.onmicrosoft.com/.well-known/openid-configuration', // For using Microsoft you should never need to change this.
      'tenantName' :'fhirfli.onmicrosoft.com',
      'policyName' :'B2C_1_SignInUp',
      'validateIssuer' : true,
      'clientSecret' : '5SGE{2g&:375JPH7', //nuffield
      'redirectUrl' : 'https://transpire.azurewebsites.net/auth/adb2c/callback',
      'resource' : 'https://fhirfli.onmicrosoft.com/fhirfli',
      'isB2C' : true,
      'passReqToCallback' : false,
      'responseMode' : 'form_post',
      'responseType' : 'code id_token',
      'allowHttpForRedirectUrl' : true,
      'issuer' : null,
      'useCookieInsteadOfSession' : true
    }

};
