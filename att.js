// This is a javascript plugin requiring JQuery. It is still in an early experimental state,
// so use at your own risk. Since the AT&T API Platform currently does not properly support
// CORS, this plugin proxies all API requests through a CORS enabled proxy.
// For more information, contact Krists Auders at ka0565@att.com

//var fqdn = 'https://api-uat.bf.pacer.sl.attcompute.com';
var fqdn = 'http://api.kristsauders.com';
function syntaxHighlight(json) {
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}

// Embedding JQuery.cookie.js directly
/*!
 * jQuery Cookie Plugin v1.3
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */
(function ($, document, undefined) {

    var pluses = /\+/g;

    function raw(s) {
		return s;
	}

	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	var config = $.cookie = function (key, value, options) {

		// write
		if (value !== undefined) {
			options = $.extend({}, config.defaults, options);

			if (value === null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = config.json ? JSON.stringify(value) : String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', config.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// read
		var decode = config.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, l = cookies.length; i < l; i++) {
			var parts = cookies[i].split('=');
			if (decode(parts.shift()) === key) {
				var cookie = decode(parts.join('='));
				return config.json ? JSON.parse(cookie) : cookie;
			}
		}

		return null;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		if ($.cookie(key) !== null) {
			$.cookie(key, null, options);
			return true;
		}
		return false;
	};

})(jQuery, document);

// Main api object
var api = {
    manuallyInitialized: false,
    token: null,
    appKey: null,
    appSecret: null,
    init: function(appKey, appSecret, scope, callback, errorCallback) {
        api.manuallyInitialized = true;
        appKey = appKey || "65b7c04c33746f070b2494eae5c09e71";
        api.appKey = appKey;
        appSecret = appSecret || "8cb2c2f5111efb57";
        api.appSecret = appSecret;
        scope = scope || "SMS,MMS,WAP,SPEECH,ADS,CCS";
        callback = callback || function(data) { };
        errorCallback = errorCallback || function(error) { alert(error); };
        // Check for presence of 'code' query parameter, which means the user has returned from consent.
        var url = window.location.toString().match(/\?(.+)$/);
        var params = RegExp.$1.split("&");
        var queryStringList = {};
        for(var i=0;i<params.length;i++) {
            queryStringList[params[i].split("=")[0]] = unescape(params[i].split("=")[1]);
        }
        if($.cookie('access_token')) {
            api.token = $.cookie('access_token');
            if(queryStringList.code!=null) {
                api.oauth.getToken('authorization_code', null, queryStringList.code, function(data) {
                    api.oauth.token = data.access_token;
                    $.cookie('auth_access_token', data.access_token, { path: '/', expires: 365 });
                    $('button').removeClass('disabled');
                    $('.authorize').addClass('btn-success').text("Authorized");
                });
            } else {
                if($.cookie('auth_access_token')) {
                    $(document).ready(function(){
                        api.oauth.token = $.cookie('auth_access_token');
                        $('button').removeClass('disabled');
                        $('.authorize').addClass('btn-success').text("Authorized");
                    });
                }
            }
            callback(api.token);
        } else {
            api.oauth.getToken('client_credentials', scope, null, function(data) {
                api.token = data.access_token;
                $.cookie('access_token', data.access_token, { path: '/', expires: 365 });
                if(queryStringList.code!=null) {
                    api.oauth.getToken('authorization_code', null, queryStringList.code, function(data) {
                            api.oauth.token = data.access_token;
                            $.cookie('auth_access_token', data.access_token, { path: '/', expires: 365 });
                            $('button').removeClass('disabled');
                            $('.authorize').addClass('btn-success').text("Authorized");
                        }, function(error) {
                            alert(error);
                    });
                }
                $(document).ready(function(){
                    callback(data);
                });
            }, function(error) {
                alert(error);
            });
        }
    },
    sms: {
        att: {
            Id: null,
            send: function(number, message, callback, errorCallback) {
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: fqdn + '/rest/sms/2/messaging/outbox',
                    type: 'post',
                    data: {
                        Address: 'tel:' + number.replace(/-/g, "").replace(/ /g, "").replace("tel:", "").replace("(","").replace(")",""),
                        Message: message
                    },
                    headers: {
                        "Authorization": "BEARER " + api.token,
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    success: function(data) {
                        api.sms.att.Id = data.Id;
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            },
            status: function(id, callback, errorCallback) {
                id = id || api.sms.att.Id;
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: fqdn + '/rest/sms/2/messaging/outbox/' + id,
                    type: 'get',
                    headers: {
                        "Authorization": "BEARER " + api.token,
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    success: function(data) {
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            },
            inbox: function(number, callback, errorCallback) {
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: fqdn + '/rest/sms/2/messaging/inbox?RegistrationID=' + number,
                    type: 'get',
                    headers: {
                        "Authorization": "BEARER " + api.token,
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    success: function(data) {
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            }
        },
        gsma: {
            
        }
    },
    mms: {
        att: {
            Id: null,
            send: function(number, base64file, fileType, callback, errorCallback) {
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: fqdn + '/rest/mms/2/messaging/outbox',
                    type: 'post',
                    headers: {
                        "Content-Type": 'multipart/related; boundary="----------------------------6664c22d4e"',
                        "Authorization": "BEARER " + api.token,
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    data: '\
------------------------------6664c22d4e\n\
Content-Type: application/x-www-form-urlencoded; charset=UTF-8\n\
Content-Transfer-Encoding: 8bit\n\
Content-Disposition: form-data; name="root-fields"\n\
Content-ID: <startpart>\n\
\n\
Address=tel%3A' + number.replace(/-/g, "").replace(/ /g, "").replace("tel:", "").replace("(","").replace(")","") + '&Subject=Attachment\n\
------------------------------6664c22d4e--\n\
Content-Disposition: attachment; filename="attachment.jpg"\n\
Content-Type: ' + fileType + '\n\
Content-ID: <attachment.jpg>\n\
Content-Transfer-Encoding: base64\n\
\n\
' + base64file.replace('data:image/jpeg;base64,', '') + '\n\
\n\
                            ',
                    success: function(data) {
                        api.mms.att.Id = data.Id;
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            },
            status: function(id, callback, errorCallback) {
                id = id || api.mms.att.Id;
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: fqdn + '/rest/mms/2/messaging/outbox/' + id,
                    type: 'get',
                    headers: {
                        "Authorization": "BEARER " + api.token,
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    success: function(data) {
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            }
        },
        gsma: {
            
        }
    },
    wap: {
        att: {
            send: function(number, href, text, callback, errorCallback) {
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                var push = '\
Content-Type: text/plain\n\
Content-ID: <PushContent.txt>\n\
Content-Transfer-Encoding: binary\n\
Content-Disposition: form-data; name="PushContent"\n\
Content-Type: text/vnd.wap.si\n\
Content-Length: 20\n\
X-Wap-Application-Id: x-wap-application:wml.ua\n\
\n\
<?xml version="1.0"?>\n\
<!DOCTYPE si PUBLIC "-//WAPFORUM//DTD SI 1.0//EN" "http://www.wapforum.org/DTD/si.dtd">\n\
<si>\n\
<indication href="' + href + '" action="signal-medium" si-id="6532" >\n\
' + text + '\n\
</indication>\n\
</si>';
                $.ajax({
                    url: fqdn + '/1/messages/outbox/wapPush',
                    type: 'post',
                    headers: {
                        "Content-Type": 'multipart/form-data; type="application/x-www-form-urlencoded"; start=""; boundary="----------------------------6664c22d4e"',
                        "Authorization": "BEARER " + api.token,
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    data: '\
------------------------------6664c22d4e\n\
Content-Type: application/x-www-form-urlencoded; charset=UTF-8\n\
Content-Transfer-Encoding: 8bit\n\
Content-Disposition: form-data; name="root-fields"\n\
Content-ID: <startpart>\n\
\n\
address=tel%3A' + number.replace(/-/g, "").replace(/ /g, "").replace("tel:", "").replace("(","").replace(")","") + '\n\
------------------------------6664c22d4e\n\
Content-Disposition: attachment; name=""\n\
\n\
' + push + '\n\
\n\
------------------------------6664c22d4e--\n\
                            ',
                    success: function(data) {
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            }
        },
        gsma: {
            
        }
    },
    location: {
        att: {
            locate: function(requestedAccuracy, acceptableAccuracy, tolerance, callback, errorCallback) {
                requestedAccuracy = requestedAccuracy || '100';
                acceptableAccuracy = acceptableAccuracy || '10000';
                tolerance = tolerance || 'DelayTolerant';
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: fqdn + '/2/devices/location?requestedAccuracy=10000&acceptableAccuracy=10000&Tolerance=DelayTolerant',
                    type: 'get',
                    headers: {
                        "Authorization": "BEARER " + api.oauth.token,
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    success: function(data) {
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            }
        },
        gsma: {
            locate: function(callback, errorCallback) {
                
            }
        }
    },
    device: {
        att: {
            capabilities: function(callback, errorCallback) {
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: fqdn + '/rest/2/Devices/Info',
                    type: 'get',
                    headers: {
                        "Authorization": "BEARER " + api.oauth.token,
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    success: function(data) {
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            }
        },
        gsma: {
            locate: function(callback, errorCallback) {
                
            }
        }
    },
    ads: {
        att: {
            get: function(callback, errorCallback) {
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: fqdn + '/rest/1/ads?Category=auto',
                    type: 'get',
                    headers: {
                        "Authorization": "BEARER " + api.token,
                        "UDID": "012266005922569000000000000000",
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    success: function(data) {
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            }
        },
        gsma: {
            
        }
    },
    tropo: {
        att: {
            Id: null,
            session: function(parameters, callback, errorCallback) {
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: fqdn + '/rest/1/Sessions',
                    type: 'post',
                    headers: {
                        "Authorization": "BEARER " + api.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json"
                    },
                    data: parameters,
                    dataType: 'json',
                    success: function(data) {
                        api.tropo.att.Id = data.id;
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            },
            signal: function(Id, signal, callback, errorCallback) {
                Id = Id || api.tropo.att.Id;
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                var signalVariable = {};
                signalVariable.value = signal;
                $.ajax({
                    url: fqdn + '/rest/1/Sessions/' + Id + '/Signals',
                    type: 'post',
                    headers: {
                        "Authorization": "BEARER " + api.token,
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Accept": "application/json"
                    },
                    data: signalVariable,
                    dataType: 'json',
                    success: function(data) {
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            }
        },
        gsma: {
            
        }
    },
    mobo: {
        att: {
            send: function(number, message, callback, errorCallback) {
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: fqdn + '/rest/1/MyMessages',
                    type: 'post',
                    data: {
                        Addresses: 'tel:' + number.replace(/-/g, "").replace(/ /g, "").replace("tel:", "").replace("(","").replace(")",""),
                        Text: message,
                        Subject: '',
                        Group: false
                    },
                    headers: {
                        "Authorization": "BEARER " + api.oauth.token,
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    success: function(data) {
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            },
            headers: function(headerCount, indexCursor, callback, errorCallback) {
                headerCount = headerCount || '10';
                indexCursor = indexCursor || '';
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: fqdn + '/rest/1/MyMessages?HeaderCount=' + headerCount + '&IndexCursor=' + indexCursor,
                    type: 'get',
                    headers: {
                        "Authorization": "BEARER " + api.oauth.token,
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    success: function(data) {
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            },
            message: function(messageId, messagePart, callback, errorCallback) {
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: fqdn + '/rest/1/MyMessages/' + messageId + '/' + messagePart,
                    type: 'get',
                    headers: {
                        "Authorization": "BEARER " + api.oauth.token,
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    success: function(data) {
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            }
        },
        gsma: {
            
        }
    },
    speech: {
        att: {
            transcribe: function(context, file, callback, errorCallback) {
                callback = callback || function(data) { alert(JSON.stringify(data)); };
                errorCallback = errorCallback || function(error) { alert(error); };
                $.ajax({
                    url: 'https://api-uat.bf.pacer.sl.attcompute.com' + '/rest/2/SpeechToText',
                    type: 'post',
                    headers: {
                        "Authorization": "BEARER " + api.token,
                        "X-SpeechContext": context,
                        "Content-Type": file.type,
                        "Accept": "application/json"
                    },
                    dataType: "json",
                    data: file,
                    processData: false,
                    success: function(data) {
                        callback(data);
                    },
                    error: function(jqXHR, textStatus, error) {
                        errorCallback(jqXHR.responseText);
                    }
                });
            }
        }
    },
    oauth: {
        token: null,
        authorize: function(scope, redirectUri) {
            redirectUri = redirectUri || window.location;
            window.location = "https://api-uat.bf.pacer.sl.attcompute.com/oauth/authorize?client_id=" + api.appKey + "&scope=" + scope + "&redirect_uri=" + redirectUri;
        },
        getToken: function(grant_type, scope, code, callback, errorCallback) {
            code = code || null;
            callback = callback || function(data) { };
            errorCallback = errorCallback || function(error) { alert(error); };
            $.ajax({
                url: fqdn + '/oauth/token',
                type: 'post',
                data: {
                    grant_type: grant_type,
                    scope: scope,
                    client_id: api.appKey,
                    client_secret: api.appSecret,
                    code: code
                },
                headers: {
                    "Accept": "application/json"
                },
                dataType: "json",
                success: function(data) {
                    callback(data);
                },
                error: function(jqXHR, textStatus, error) {
                    errorCallback(jqXHR.responseText);
                }
            });
        }
    }
}
setTimeout(function() {
    if(!api.manuallyInitialized) {
        api.init();
    }
}, 2000);