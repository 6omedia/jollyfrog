(function(fn,c){

    var d=document;
    (d.readyState=='loading')?d.addEventListener('DOMContentLoaded',fn):fn(c);

    })(function(c){

        var d=document;
        var c=new ClientJS();

        d.getElementById('" + clickId + "').addEventListener('click', function(){
        
            var jsonObj = {
                apikey: " + apikey + ",
                domain: window.location.hostname,
                url: window.location.href,
                fingerprint: c.getFingerprint(),
                type: c.getDeviceType(),
                vendor: c.getDeviceVendor(),
                browser: c.getBrowser(),
                os: c.getOS(),
                screen: {
                    res: c.getAvailableResolution(),
                    colorDepth: c.getColorDepth()
                },
                timezone: c.getTimeZone(),
                language: c.getLanguage(),
                meta: {
                    funnel_position: d.getElementById('tracking_info').dataset.funnel_position || ''
                },
                form_name: '" + formName + "',
                datapoints: [
                    {
                        name: '" + dp.name + "',
                        value: d.getElementById('" + dp.field_id + "').value
                    },
                    {
                        name: '" + dp.name + "',
                        value: d.getElementById('" + dp.field_id + "').value
                    }
                ]
            };

            var x = new XMLHttpRequest();
            x.onreadystatechange = function(){
                if(this.readyState == 4){
                }
            };
            x.open('POST', 'http://localhost:20100/api/log_formsubmission', true);
            x.setRequestHeader('Content-Type', 'application/json');
            x.send(JSON.stringify(jsonObj));

        });

});