            api.init(null, null, null, function(data) {
                $(document).ready(function(){
                    $('#init').removeClass("disabled loading").text('Ready').addClass("btn-success");
                    $('.needs-oauth').removeClass("disabled loading");
                });
            }, function(error) {
                $('<pre>' + JSON.stringify(JSON.parse(error), null, '\t') + '</pre>').dialog({modal:true, width:$(window).width()-100, height:$(window).height()-100});
            });
            // Functions for using a private riak key/value data storage for persistence
            var riak = {
                get: function(key, callback, errorCallback) {
                    callback = callback || function(data) {
                        alert(JSON.stringify(data));
                    };
                    errorCallback = errorCallback || function(error) {
                        alert(error);
                    };
                    $.ajax({
                        url: 'http://riak.kristsauders.com/buckets/att-js/keys/' + key,
                        type: 'get',
                        success: function(data) {
                            callback(data);
                        },
                        error: function(jqXHR, textStatus, error) {
                            errorCallback(jqXHR.responseText);
                        }
                    });
                },
                save: function(key, value, callback, errorCallback) {
                    callback = callback || function(data) {};
                    errorCallback = errorCallback || function(error) {
                        alert(error);
                    };
                    $.ajax({
                        url: 'http://riak.kristsauders.com/buckets/att-js/keys/' + key,
                        type: 'post',
                        data: value,
                        success: function(data) {
                            callback(data);
                        },
                        error: function(jqXHR, textStatus, error) {
                            errorCallback(jqXHR.responseText);
                        }
                    });
                }
            };
            // Attach JQuery.click() functions to buttons
            $(document).ready(function() {
                $("#sendSms").click(function() {
                    $('#sendSms').addClass("disabled loading");
                    api.sms.att.send($('#sendSmsNumber').val(), $('#sendSmsMessage').val(), function(data) {
                        $('#sendSms').removeClass("disabled loading");
                        $('#smsId').val(api.sms.att.Id);
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    }, function(error) {
                        $('#sendSms').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $("#getSmsStatus").click(function() {
                    $('#getSmsStatus').addClass("disabled loading");
                    api.sms.att.status($('#smsId').val() == 'Message ID' ? api.sms.att.Id : $('#smsId').val(), function(data) {
                        $('#getSmsStatus').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    }, function(error) {
                        $('#getSmsStatus').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $("#getSmsInbox").click(function() {
                    $('#getSmsInbox').addClass("disabled loading");
                    api.sms.att.inbox($('#smsInboxNumber').val(), function(data) {
                        $('#getSmsInbox').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    }, function(error) {
                        $('#getSmsInbox').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $("#sendMms").click(function() {
                    $('#sendMms').addClass("disabled loading");
                    var reader = new FileReader();
                    var file = document.getElementById('sendMmsFile').files[0];
                    reader.readAsDataURL(file);
                    reader.onload = function(e) {
                        api.mms.att.send($('#sendMmsNumber').val(), e.target.result, file.type, function(data) {
                            $('#sendMms').removeClass("disabled loading");
                            $('#mmsId').val(api.mms.att.Id);
                            $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                                modal: true,
                                width: $(window).width() - 100,
                                height: $(window).height() - 100
                            });
                        }, function(error) {
                            $('#sendMms').removeClass("disabled loading");
                            $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                                modal: true,
                                width: $(window).width() - 100,
                                height: $(window).height() - 100
                            });
                        });
                    }
                });
                $("#sendWap").click(function() {
                    $('#sendWap').addClass("disabled loading");
                    api.wap.att.send($('#sendWapNumber').val(), $('#sendWapHref').val(), $('#sendWapText').val(), function(data) {
                        $('#sendWap').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    }, function(error) {
                        $('#sendWap').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $("#getMmsStatus").click(function() {
                    $('#getMmsStatus').addClass("disabled loading");
                    api.mms.att.status($('#mmsId').val() == 'Message ID' ? null : $('#mmsId').val(), function(data) {
                        $('#getMmsStatus').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    }, function(error) {
                        $('#getMmsStatus').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $(".authorize").click(function() {
                    api.oauth.authorize("TL,DC,MOBO,MIM");
                });
                $("#getLocation").click(function() {
                    $('#getLocation').addClass("disabled loading");
                    api.location.att.locate($('#requestedAccuracy').val(), $('#acceptableAccuracy').val(), $('#tolerance').val(), function(data) {
                        $('#getLocation').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                        if (data.RequestError.ServiceException.MessageId == 'SVC0002') api.oauth.authorize("TL,DC,MOBO,MIM");
                    }, function(error) {
                        $('#getLocation').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $("#getCapabilities").click(function() {
                    $('#getCapabilities').addClass("disabled loading");
                    api.device.att.capabilities(function(data) {
                        $('#getCapabilities').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                        if (data.RequestError.ServiceException.MessageId == 'SVC0002') api.oauth.authorize("TL,DC,MOBO,MIM");
                    }, function(error) {
                        $('#getCapabilities').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $("#getAd").click(function() {
                    $('#getAd').addClass("disabled loading");
                    api.ads.att.get(function(data) {
                        $('#getAd').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    }, function(error) {
                        $('#getAd').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $("#startSession").click(function() {
                    $('#startSession').addClass("disabled loading");
                    api.tropo.att.session({'number':$('#tropoNumber').val()}, function(data) {
                        $('#startSession').removeClass("disabled loading");
                        $('#tropoId').val(api.tropo.att.Id);
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    }, function(error) {
                        $('#startSession').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $("#sendSignal").click(function() {
                    $('#sendSignal').addClass("disabled loading");
                    api.tropo.att.signal($('#tropoId').val(), $('#tropoSignal').val(), function(data) {
                        $('#sendSignal').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    }, function(error) {
                        $('#sendSignal').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $("#sendMoboMessage").click(function() {
                    $('#sendMoboMessage').addClass("disabled loading");
                    api.mobo.att.send($('#sendMoboNumber').val(), $('#sendMoboText').val(), function(data) {
                        $('#sendMoboMessage').removeClass("disabled loading");
                        //$('#moboId').val(api.mobo.att.Id);
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                        if (data.RequestError.ServiceException.MessageId == 'SVC0002') api.oauth.authorize("TL,DC,MOBO,MIM");
                    }, function(error) {
                        $('#sendMoboMessage').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $("#getMoboHeaders").click(function() {
                    $('#getMoboHeaders').addClass("disabled loading");
                    api.mobo.att.headers($('#moboHeaderCount').val(), $('#moboIndexCursor').val() == 'Index Cursor' ? null : $('#moboIndexCursor').val(), function(data) {
                        $('#getMoboHeaders').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                        if (data.RequestError.ServiceException.MessageId == 'SVC0002') api.oauth.authorize("TL,DC,MOBO,MIM");
                    }, function(error) {
                        $('#getMoboHeaders').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $("#getMoboMessage").click(function() {
                    $('#getMoboMessage').addClass("disabled loading");
                    api.mobo.att.message($('#moboMessageId').val(), $('#moboMessagePart').val(), function(data) {
                        $('#getMoboMessage').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                        if (data.RequestError.ServiceException.MessageId == 'SVC0002') api.oauth.authorize("TL,DC,MOBO,MIM");
                    }, function(error) {
                        $('#getMoboMessage').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                $("#transcribe").click(function() {
                    $('#transcribe').addClass("disabled loading");
                    var file = document.getElementById('speechFile').files[0];
                    api.speech.att.transcribe($('#speechContext').val(), file, function(data) {
                        $('#transcribe').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(data, null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    }, function(error) {
                        $('#transcribe').removeClass("disabled loading");
                        $('<pre>' + syntaxHighlight(JSON.stringify(JSON.parse(error), null, '\t')) + '</pre>').dialog({
                            modal: true,
                            width: $(window).width() - 100,
                            height: $(window).height() - 100
                        });
                    });
                });
                // clear input on focus
                var clearMePrevious = '';
                $('input').focus(function() {
                    if ($(this).val() == $(this).attr('title')) {
                        clearMePrevious = $(this).val();
                        $(this).val('');
                    }
                });
                // if field is empty afterward, add text again
                $('input').blur(function() {
                    if ($(this).val() == '') {
                        $(this).val(clearMePrevious);
                    }
                });
                // Event listeners for menu bar clicks
                $('#docsButton').click(function() {
                    $('#app').hide();
                    $('#docs').show();
                    $('#appButton').removeClass('active');
                    $('#docsButton').addClass('active');
                });
                $('#appButton').click(function() {
                    $('#docs').hide();
                    $('#app').show();
                    $('#docsButton').removeClass('active');
                    $('#appButton').addClass('active');
                });
                $('#docs').hide();
            });