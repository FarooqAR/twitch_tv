$(document).ready(function() {
    var streamers = ["ESL_SC2", "OgamingSC2", "cretetion", "comster404","freecodecamp", "storbeck" ,"habathcx", "RobotCaleb", "noobs2ninjas","sjdflsdjfklasdjf","brunofin"];
    var streamersObjArray = [];
    fetchStreamers(streamers);
    $('#form-search').submit(function() {
        var q =$('#search').val().toLowerCase();
        q = q.replace(" ",""); 
        if(q != ''){
            search(q);
        }
        return false;
    });
    $('.filters a').on('click', function() {
        $('.filters a').removeClass('active');
        $(this).addClass('active');
        if ($(this).hasClass('online'))
            showOnline();
        else if ($(this).hasClass('offline'))
            showOffline();
        else
            showAll();
    });

    function search(q) {
        showLoader();
        hideError();
        $('.filters a').removeClass('active');
        $('.filters a.all').addClass('active');
        $.ajax({
            dataType: 'jsonp',
            crossDomain: true,
            url: 'https://api.twitch.tv/kraken/search/channels?client_id=kl88blj60haq8yagp85dj87lyefoma&limit=25&q=' + q,
            success: function(data) {
                if (data['_total'] == 0) {
                    showError(q + ' donot exist');
                    hideLoader();
                } else {
                    var arr = [];
                    data['channels'].forEach(function(channel) {
                        if (channel['name'].indexOf(q) != -1) {
                            arr.push(channel['name']);
                        }
                    });
                    if (arr.length != 0){
                        fetchStreamers(arr);
                    }
                    else{
                        hideLoader();
                    }
                }
            }
        }).done(function(){
            hideLoader();
        });
    }

    function showLoader() {
        $('.loader').slideDown();
    }

    function hideLoader() {
        $('.loader').slideUp();
    }
    function showError(message){
        $('#error').text(message).slideDown();
    }
    function hideError(){
        $('#error').slideUp();
    }
    function showOnline() {
        showStreamers(streamersObjArray.filter(function(streamer) {
            return (streamer.status!=='does_not_exist' && streamer.status !== 'offline' && streamer.status !== 'closed')
        }));
    }

    function showOffline() {
        showStreamers(streamersObjArray.filter(function(streamer) {
            return (streamer.status === 'offline')
        }));
    }

    function showAll() {
        showStreamers(streamersObjArray);
    }

    function fetchStreamers(arr) {
        $('#search-results').empty();
        streamersObjArray.length = 0;
        arr.forEach(function(streamer_name) {
            showLoader();
            $.ajax({
                url: 'https://api.twitch.tv/kraken/streams/' + streamer_name + '?client_id=kl88blj60haq8yagp85dj87lyefoma',
                dataType: 'jsonp',
                crossDomain: true,
                success: function(data) {
                    if (data.hasOwnProperty('stream')) {
                        if (data['stream'] == null) {
                            $.ajax({
                                url: 'https://api.twitch.tv/kraken/channels/' + streamer_name + '?client_id=kl88blj60haq8yagp85dj87lyefoma',
                                dataType: 'jsonp',
                                crossDomain: true,
                                success: function(data) {
                                    var streamer = {};
                                    streamer.status = 'offline'
                                    streamer.name = data['display_name'];
                                    streamer.logo = (data['logo'] == null) ? 'placeholder.png' : data['logo'];
                                    streamer.url = data['url'];
                                    streamersObjArray.push(streamer);
                                    showStreamer(streamer);
                                    if (arr[arr.length - 1] == streamer_name) {
                                        hideLoader();
                                    }
                                }
                            }).done(function(){
                                hideLoader();
                            });
                        } else {
                            var streamer = {};
                            streamer.status = data['stream']['game'] + ' : ' + data['stream']['channel']['status'];
                            streamer.name = data['stream']['channel']['display_name'];
                            streamer.logo = (data['stream']['channel']['logo'] == null) ? 'placeholder.png' : data['stream']['channel']['logo'];
                            streamer.url = data['stream']['channel']['url'];
                            streamersObjArray.push(streamer);
                            showStreamer(streamer);
                            if (arr[arr.length - 1] == streamer_name) {
                                hideLoader();
                            }
                        }
                    }
                    else if(data.hasOwnProperty('error')){
                            var streamer = {};
                            streamer.status = (data['status'] == 422)?'closed':'does_not_exist';
                            streamer.name = streamer_name;
                            streamer.logo = 'placeholder.png';
                            streamer.url = '#';
                            streamersObjArray.push(streamer);
                            showStreamer(streamer);
                            if (arr[arr.length - 1] == streamer_name) {
                                hideLoader();
                            }
                    }

                }
            });
        });
    }
    function showStreamers(streamers) {
        $('#search-results').empty();
        streamers.forEach(function(streamer) {
            showStreamer(streamer);
        });
    }

    function showStreamer(streamer) {
        $('#search-results').append(
            '<div class="result ' + ((streamer.status !== 'does_not_exist' && streamer.status !== 'closed' && streamer.status !== 'offline') ? 'online' : streamer.status) + '"><div class="col-2">' +
            '<div class="logo" style="background-image:url(\'' + streamer.logo + '\')"></div></div>' +
            '<div class="col-8"><div class="col-6">' +
            '<a target="_blank" href="' + streamer.url + '" class="name">' + streamer.name + '</a></div>' +
            '<div class="col-6">' +
            '<p class="status">' + ((streamer.status == "does_not_exist") ? "does not exist" : streamer.status) + '</p></div></div></div>'
        );
    }
});