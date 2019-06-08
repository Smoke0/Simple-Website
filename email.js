var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var {google} = require('googleapis');
var OAuth = google.auth.OAuth2;

module.exports = function (name,email,text) {
    //var new_text  = text+"From"+name;

    var oauthclient = new OAuth(
        "",
        "",
        ""
    );

    oauthclient.setCredentials({
        refresh_token:''
    });

    oauthclient.refreshAccessToken().then(function (tokens) {
        var accesstoken = tokens.credentials.access_token;
        var transporter = nodemailer.createTransport(
            {
                service:'gmail',
                auth:{
                    type:"OAuth2",
                    user:'',
                    clientId:"",
                    clientSecret:"",
                    refreshToken:``,
                    accessToken: accesstoken
                },
                tls:{rejectUnauthorized :false}
            }

        );

        var mailOptions = {
            from:'',
            to:email,
            subject:'Verification code',
            text:text
        };

        transporter.sendMail(mailOptions,function (err,info) {
            if(err)
                console.log(err);
            else {
                console.log('Email was send'+info.response);
            }
            transporter.close();
        });
    });

}
