var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');
var {google} = require('googleapis');
var OAuth = google.auth.OAuth2;

module.exports = function (name,email,text) {
    //var new_text  = text+"From"+name;

    var oauthclient = new OAuth(
        "799279190687-mofl0tjc3mi5g3uqn1e6n05e2h84kuqe.apps.googleusercontent.com",
        "VPiB9lZL1CiFh4RafvHYrn8E",
        "https://developers.google.com/oauthplayground"
    );

    oauthclient.setCredentials({
        refresh_token:'1/VYb-1zzc0VwQ_pGCPZEY5F94_sF2cQv-dlyGcra2TCc'
    });

    oauthclient.refreshAccessToken().then(function (tokens) {
        var accesstoken = tokens.credentials.access_token;
        var transporter = nodemailer.createTransport(
            {
                service:'gmail',
                auth:{
                    type:"OAuth2",
                    user:'kashishdhawan070250@gmail.com',
                    clientId:"799279190687-mofl0tjc3mi5g3uqn1e6n05e2h84kuqe.apps.googleusercontent.com",
                    clientSecret:"VPiB9lZL1CiFh4RafvHYrn8E",
                    refreshToken:`1/DXLcwXXqMjC1is2wAv5NlE9BD1l29l_efpcJKIwrC04`,
                    accessToken: accesstoken
                },
                tls:{rejectUnauthorized :false}
            }

        );

        var mailOptions = {
            from:'kashishdhawan070250@gmail.com',
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
